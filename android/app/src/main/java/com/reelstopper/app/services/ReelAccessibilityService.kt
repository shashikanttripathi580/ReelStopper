package com.reelstopper.app.services

import android.accessibilityservice.AccessibilityService
import android.accessibilityservice.AccessibilityServiceInfo
import android.content.Context
import android.content.Intent
import android.os.SystemClock
import android.util.Log
import android.view.accessibility.AccessibilityEvent
import android.view.accessibility.AccessibilityNodeInfo

/**
 * ReelAccessibilityService
 *
 * Listens for scroll and content change events in supported short-video platforms
 * (Instagram Reels, YouTube Shorts).
 *
 * Features:
 * - Fingerprint extraction of active reel elements (e.g. author tag, sound title, reel view id)
 * - Strict debouncing (ignores duplicate UI refresh triggers for the same reel)
 * - Safe minimum dwell time before qualifying as a newly consumed reel (avoids count explosion when fast-swiping)
 * - Local-only processing with zero external network communication
 */
class ReelAccessibilityService : AccessibilityService() {

    companion object {
        private const val TAG = "ReelAccessibility"
        const val ACTION_REEL_INCREMENTED = "com.reelstopper.app.ACTION_REEL_INCREMENTED"
        const val ACTION_TRACKING_STATE = "com.reelstopper.app.ACTION_TRACKING_STATE"
        const val EXTRA_COUNT = "extra_count"
        const val EXTRA_APP = "extra_app"

        var isServiceRunning = false
            private set

        private var trackingEnabled = true
        private var currentSessionCount = 0

        fun setTrackingEnabled(enabled: Boolean) {
            trackingEnabled = enabled
        }

        fun getSessionCount(): Int = currentSessionCount

        fun resetSession() {
            currentSessionCount = 0
        }
    }

    private var lastReelSignature: String = ""
    private var lastDetectionTime: Long = 0L
    private val MIN_INTERVAL_BETWEEN_REELS_MS = 1200L // Minimum dwell time between counts

    override fun onServiceConnected() {
        super.onServiceConnected()
        isServiceRunning = true
        Log.i(TAG, "ReelAccessibilityService connected and ready")

        // Notify overlay service that accessibility is active
        val intent = Intent(this, OverlayCounterService::class.java).apply {
            action = OverlayCounterService.ACTION_SHOW_OVERLAY
        }
        startService(intent)
    }

    private var isOverlayVisible = false

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (!trackingEnabled || event == null) return

        val packageName = event.packageName?.toString() ?: return

        when (packageName) {
            "com.instagram.android" -> {
                ensureOverlayVisible(true)
                handleInstagramReel(event)
            }
            "com.google.android.youtube" -> {
                ensureOverlayVisible(true)
                handleYouTubeShorts(event)
            }
            else -> {
                // User navigated away to home screen or another app -> auto-hide overlay
                if (event.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
                    ensureOverlayVisible(false)
                }
            }
        }
    }

    private fun ensureOverlayVisible(visible: Boolean) {
        if (isOverlayVisible == visible) return
        isOverlayVisible = visible

        val intent = Intent(this, OverlayCounterService::class.java).apply {
            action = if (visible) OverlayCounterService.ACTION_SHOW_OVERLAY else OverlayCounterService.ACTION_HIDE_OVERLAY
        }
        startService(intent)
    }

    /**
     * Inspects Instagram UI nodes for Reels layout identifiers or author tags.
     */
    private fun handleInstagramReel(event: AccessibilityEvent) {
        val rootNode = rootInActiveWindow ?: return

        // In Instagram reels, author handles, like buttons, and reel containers have distinct descriptors
        val signature = extractNodeSignature(rootNode, "instagram")
        evaluateReelTransition(signature, "Instagram")
    }

    /**
     * Inspects YouTube Shorts UI nodes for channel handle or shorts player container.
     */
    private fun handleYouTubeShorts(event: AccessibilityEvent) {
        val rootNode = rootInActiveWindow ?: return

        val signature = extractNodeSignature(rootNode, "youtube")
        evaluateReelTransition(signature, "YouTube Shorts")
    }

    /**
     * Extracts a stable identifier for the currently focused reel item
     * using view IDs, text nodes, or content descriptions.
     */
    private fun extractNodeSignature(root: AccessibilityNodeInfo, platform: String): String {
        val sb = StringBuilder(platform).append(":")

        // Look for common reel action views (like, comments, author)
        val candidateNodes = ArrayList<AccessibilityNodeInfo>()
        collectCandidateNodes(root, candidateNodes, 0)

        for (node in candidateNodes) {
            val text = node.text?.toString()?.trim()
            val desc = node.contentDescription?.toString()?.trim()
            val viewId = node.viewIdResourceName

            if (!text.isNullOrEmpty() && text.length > 2) {
                sb.append(text.take(20)).append("|")
            } else if (!desc.isNullOrEmpty() && desc.length > 2) {
                sb.append(desc.take(20)).append("|")
            }
        }

        return if (sb.length > platform.length + 1) sb.toString() else ""
    }

    private fun collectCandidateNodes(node: AccessibilityNodeInfo?, list: ArrayList<AccessibilityNodeInfo>, depth: Int) {
        if (node == null || depth > 8 || list.size >= 6) return

        val id = node.viewIdResourceName
        if (id != null && (id.contains("reel") || id.contains("author") || id.contains("username") || id.contains("shorts_title"))) {
            list.add(node)
        }

        for (i in 0 until node.childCount) {
            collectCandidateNodes(node.getChild(i), list, depth + 1)
        }
    }

    /**
     * Verifies if this event represents a genuine transition to a new reel:
     * 1. Signature must not be empty.
     * 2. Signature must differ from previous reel signature.
     * 3. Must satisfy minimum dwell time (prevents burst increments while scrolling past).
     */
    @Synchronized
    private fun evaluateReelTransition(signature: String, appName: String) {
        val now = SystemClock.uptimeMillis()

        if (signature.isEmpty()) return
        if (signature == lastReelSignature) return // Duplicate event for the same reel
        if (now - lastDetectionTime < MIN_INTERVAL_BETWEEN_REELS_MS) return

        // Valid new reel detected
        lastReelSignature = signature
        lastDetectionTime = now
        currentSessionCount++

        Log.d(TAG, "New reel detected in $appName! Count: $currentSessionCount")

        // Broadcast count update to overlay service and React Native module
        val updateIntent = Intent(ACTION_REEL_INCREMENTED).apply {
            putExtra(EXTRA_COUNT, currentSessionCount)
            putExtra(EXTRA_APP, appName)
            setPackage(packageName)
        }
        sendBroadcast(updateIntent)

        // Directly notify OverlayCounterService for instant UI reaction
        OverlayCounterService.updateCount(this, currentSessionCount)
    }

    override fun onInterrupt() {
        Log.w(TAG, "ReelAccessibilityService interrupted")
    }

    override fun onDestroy() {
        super.onDestroy()
        isServiceRunning = false
        Log.i(TAG, "ReelAccessibilityService destroyed")
    }
}
