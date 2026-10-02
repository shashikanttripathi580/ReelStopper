package com.reelstopper.app.modules

import android.content.BroadcastReceiver
import android.content.Context
import android.content.Intent
import android.content.IntentFilter
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Arguments
import com.facebook.react.bridge.LifecycleEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.modules.core.DeviceEventManagerModule
import com.reelstopper.app.services.OverlayCounterService
import com.reelstopper.app.services.ReelAccessibilityService

/**
 * ReelStopperModule
 *
 * Bridge between React Native UI and Android Native Accessibility/Overlay services.
 */
class ReelStopperModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    private var reelReceiver: BroadcastReceiver? = null

    override fun getName(): String = "ReelStopperModule"

    override fun initialize() {
        super.initialize()
        try {
            reactContext.addLifecycleEventListener(this)
            registerBroadcastReceiver()
        } catch (e: Exception) {
            Log.e("ReelStopperModule", "Error in initialize", e)
        }
    }

    override fun invalidate() {
        super.invalidate()
        try {
            reactContext.removeLifecycleEventListener(this)
            unregisterReceiverSafely()
        } catch (e: Exception) {
            Log.e("ReelStopperModule", "Error in invalidate", e)
        }
    }

    private fun registerBroadcastReceiver() {
        if (reelReceiver != null) return
        try {
            reelReceiver = object : BroadcastReceiver() {
                override fun onReceive(context: Context?, intent: Intent?) {
                    if (intent?.action == ReelAccessibilityService.ACTION_REEL_INCREMENTED) {
                        val count = intent.getIntExtra(ReelAccessibilityService.EXTRA_COUNT, 0)
                        val app = intent.getStringExtra(ReelAccessibilityService.EXTRA_APP) ?: "Reels"

                        val params = Arguments.createMap().apply {
                            putInt("count", count)
                            putString("app", app)
                            putDouble("timestamp", System.currentTimeMillis().toDouble())
                        }
                        sendEvent("onReelIncremented", params)
                    }
                }
            }

            val filter = IntentFilter(ReelAccessibilityService.ACTION_REEL_INCREMENTED)
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
                reactContext.registerReceiver(reelReceiver, filter, Context.RECEIVER_NOT_EXPORTED)
            } else {
                reactContext.registerReceiver(reelReceiver, filter)
            }
        } catch (e: Exception) {
            Log.e("ReelStopperModule", "Failed to register broadcast receiver", e)
        }
    }

    private fun unregisterReceiverSafely() {
        reelReceiver?.let {
            try {
                reactContext.unregisterReceiver(it)
            } catch (e: Exception) {
                // Ignore if already unregistered
            }
            reelReceiver = null
        }
    }

    private fun sendEvent(eventName: String, params: Any?) {
        try {
            if (reactContext.hasActiveReactInstance()) {
                reactContext
                    .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
                    .emit(eventName, params)
            }
        } catch (e: Exception) {
            Log.e("ReelStopperModule", "Failed to send event: $eventName", e)
        }
    }

    @ReactMethod
    fun addListener(type: String?) {
        // Keep React Native NativeEventEmitter happy
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        // Keep React Native NativeEventEmitter happy
    }

    @ReactMethod
    fun isAccessibilityPermissionGranted(promise: Promise) {
        try {
            val enabledServices = Settings.Secure.getString(
                reactContext.contentResolver,
                Settings.Secure.ENABLED_ACCESSIBILITY_SERVICES
            ) ?: ""
            val serviceName = "${reactContext.packageName}/${ReelAccessibilityService::class.java.canonicalName}"
            val isEnabled = enabledServices.contains(serviceName) || ReelAccessibilityService.isServiceRunning
            promise.resolve(isEnabled)
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        try {
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
            }
            reactContext.startActivity(intent)
        } catch (e: Exception) {
            Log.e("ReelStopperModule", "Failed to open accessibility settings", e)
        }
    }

    @ReactMethod
    fun isOverlayPermissionGranted(promise: Promise) {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                promise.resolve(Settings.canDrawOverlays(reactContext))
            } else {
                promise.resolve(true)
            }
        } catch (e: Exception) {
            promise.resolve(false)
        }
    }

    @ReactMethod
    fun openOverlaySettings() {
        try {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:${reactContext.packageName}")
                ).apply {
                    flags = Intent.FLAG_ACTIVITY_NEW_TASK
                }
                reactContext.startActivity(intent)
            }
        } catch (e: Exception) {
            Log.e("ReelStopperModule", "Failed to open overlay settings", e)
        }
    }

    @ReactMethod
    fun startTracking(promise: Promise) {
        try {
            ReelAccessibilityService.setTrackingEnabled(true)
            val intent = Intent(reactContext, OverlayCounterService::class.java).apply {
                action = OverlayCounterService.ACTION_SHOW_OVERLAY
            }
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                reactContext.startForegroundService(intent)
            } else {
                reactContext.startService(intent)
            }
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_START_TRACKING", e.message)
        }
    }

    @ReactMethod
    fun stopTracking(promise: Promise) {
        try {
            ReelAccessibilityService.setTrackingEnabled(false)
            val intent = Intent(reactContext, OverlayCounterService::class.java).apply {
                action = OverlayCounterService.ACTION_HIDE_OVERLAY
            }
            reactContext.startService(intent)
            promise.resolve(true)
        } catch (e: Exception) {
            promise.reject("ERR_STOP_TRACKING", e.message)
        }
    }

    @ReactMethod
    fun resetSession(promise: Promise) {
        try {
            ReelAccessibilityService.resetSession()
            val intent = Intent(reactContext, OverlayCounterService::class.java).apply {
                action = OverlayCounterService.ACTION_RESET_COUNT
            }
            reactContext.startService(intent)
            promise.resolve(0)
        } catch (e: Exception) {
            promise.reject("ERR_RESET", e.message)
        }
    }

    @ReactMethod
    fun getCurrentCount(promise: Promise) {
        try {
            promise.resolve(ReelAccessibilityService.getSessionCount())
        } catch (e: Exception) {
            promise.resolve(0)
        }
    }

    override fun onHostResume() {}
    override fun onHostPause() {}
    override fun onHostDestroy() {
        unregisterReceiverSafely()
    }
}
