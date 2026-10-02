package com.reelstopper.app.services

import android.app.Notification
import android.app.NotificationChannel
import android.app.NotificationManager
import android.app.PendingIntent
import android.app.Service
import android.content.Context
import android.content.Intent
import android.graphics.Color
import android.graphics.PixelFormat
import android.graphics.drawable.GradientDrawable
import android.os.Build
import android.os.IBinder
import android.view.Gravity
import android.view.LayoutInflater
import android.view.MotionEvent
import android.view.View
import android.view.WindowManager
import android.view.animation.OvershootInterpolator
import android.widget.Button
import android.widget.ImageView
import android.widget.TextView
import androidx.core.app.NotificationCompat
import com.reelstopper.app.MainActivity
import com.reelstopper.app.R

/**
 * OverlayCounterService
 *
 * Runs as a foreground service rendering a non-intrusive floating pill
 * anchored on the right edge above the reel action buttons (Like button).
 *
 * It dynamically interpolates its color according to the PRD:
 * Transparent -> Green -> Yellow -> Orange -> Red
 *
 * Displays lightweight break dialogs at 50 and 100 reels without forcing the user to stop.
 */
class OverlayCounterService : Service() {

    companion object {
        const val ACTION_SHOW_OVERLAY = "com.reelstopper.app.ACTION_SHOW_OVERLAY"
        const val ACTION_HIDE_OVERLAY = "com.reelstopper.app.ACTION_HIDE_OVERLAY"
        const val ACTION_UPDATE_COUNT = "com.reelstopper.app.ACTION_UPDATE_COUNT"
        const val ACTION_RESET_COUNT = "com.reelstopper.app.ACTION_RESET_COUNT"
        const val EXTRA_COUNT = "extra_count"

        private const val CHANNEL_ID = "reelstopper_service_channel"
        private const val REMINDER_CHANNEL_ID = "reelstopper_reminders"
        private const val NOTIFICATION_ID = 1001

        fun updateCount(context: Context, count: Int) {
            val intent = Intent(context, OverlayCounterService::class.java).apply {
                action = ACTION_UPDATE_COUNT
                putExtra(EXTRA_COUNT, count)
            }
            context.startService(intent)
        }
    }

    private lateinit var windowManager: WindowManager
    private var overlayView: View? = null
    private var reminderDialogView: View? = null

    private var counterTextView: TextView? = null
    private var leafIconView: TextView? = null
    private var containerView: View? = null

    private var currentCount = 0
    private var layoutParams: WindowManager.LayoutParams? = null

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        windowManager = getSystemService(Context.WINDOW_SERVICE) as WindowManager
        createNotificationChannels()
        startForeground(NOTIFICATION_ID, buildForegroundNotification())
        createFloatingView()
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        when (intent?.action) {
            ACTION_SHOW_OVERLAY -> {
                overlayView?.visibility = View.VISIBLE
            }
            ACTION_HIDE_OVERLAY -> {
                overlayView?.visibility = View.GONE
            }
            ACTION_UPDATE_COUNT -> {
                val newCount = intent.getIntExtra(EXTRA_COUNT, currentCount + 1)
                updateCounterUi(newCount)
            }
            ACTION_RESET_COUNT -> {
                updateCounterUi(0)
            }
        }
        return START_STICKY
    }

    private fun createNotificationChannels() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            val serviceChannel = NotificationChannel(
                CHANNEL_ID,
                "ReelStopper Tracker",
                NotificationManager.IMPORTANCE_LOW
            ).apply {
                description = "Runs quietly while reel tracking is active"
            }

            val reminderChannel = NotificationChannel(
                REMINDER_CHANNEL_ID,
                "Break Reminders",
                NotificationManager.IMPORTANCE_HIGH
            ).apply {
                description = "Alerts you when reaching 50 or 100 watched reels"
                enableVibration(true)
            }

            val manager = getSystemService(NotificationManager::class.java)
            manager?.createNotificationChannel(serviceChannel)
            manager?.createNotificationChannel(reminderChannel)
        }
    }

    private fun buildForegroundNotification(): Notification {
        val launchIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, 0, launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        return NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("ReelStopper Active")
            .setContentText("Monitoring reel scroll count locally")
            .setSmallIcon(android.R.drawable.ic_menu_compass)
            .setContentIntent(pendingIntent)
            .setOngoing(true)
            .build()
    }

    private fun createFloatingView() {
        if (overlayView != null) return

        val inflater = LayoutInflater.from(this)
        overlayView = inflater.inflate(R.layout.floating_counter_layout, null)

        containerView = overlayView?.findViewById(R.id.counter_container)
        counterTextView = overlayView?.findViewById(R.id.tv_counter_number)
        leafIconView = overlayView?.findViewById(R.id.tv_leaf_icon)

        val windowType = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
        } else {
            @Suppress("DEPRECATION")
            WindowManager.LayoutParams.TYPE_PHONE
        }

        layoutParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.WRAP_CONTENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            windowType,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or
                    WindowManager.LayoutParams.FLAG_LAYOUT_NO_LIMITS,
            PixelFormat.TRANSLUCENT
        ).apply {
            // Anchor along the right edge, slightly above the reel Like button
            gravity = Gravity.END or Gravity.CENTER_VERTICAL
            x = 24 // 24px inset from right border
            y = -120 // ~120px above center, placing it neatly above the Like button stack
        }

        // Tap to open ReelStopper Dashboard
        containerView?.setOnClickListener {
            val intent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_SINGLE_TOP
            }
            startActivity(intent)
        }

        try {
            windowManager.addView(overlayView, layoutParams)
            updateCounterUi(0)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    /**
     * Updates the number and dynamically adjusts the leaf icon and color progression.
     */
    private fun updateCounterUi(count: Int) {
        val previousCount = currentCount
        currentCount = count

        counterTextView?.text = count.toString()

        val colorInfo = resolveColorForCount(count)
        val pillBg = GradientDrawable().apply {
            shape = GradientDrawable.RECTANGLE
            cornerRadius = 32f
            setColor(colorInfo.backgroundColor)
            setStroke(2, colorInfo.borderColor)
        }
        containerView?.background = pillBg
        counterTextView?.setTextColor(colorInfo.textColor)
        leafIconView?.setTextColor(colorInfo.textColor)

        // Subtle micro-animation when count increments
        if (count > previousCount) {
            containerView?.animate()
                ?.scaleX(1.15f)
                ?.scaleY(1.15f)
                ?.setDuration(120)
                ?.withEndAction {
                    containerView?.animate()
                        ?.scaleX(1.0f)
                        ?.scaleY(1.0f)
                        ?.setDuration(100)
                        ?.start()
                }
                ?.start()
        }

        // Check 50-reel and 100-reel milestones
        if (count == 50 && previousCount < 50) {
            triggerBreakMilestone(
                milestone = 50,
                title = getString(R.string.break_reminder_title_50),
                body = getString(R.string.break_reminder_body_50),
                isMajor = false
            )
        } else if (count == 100 && previousCount < 100) {
            triggerBreakMilestone(
                milestone = 100,
                title = getString(R.string.break_reminder_title_100),
                body = getString(R.string.break_reminder_body_100),
                isMajor = true
            )
        }
    }

    /**
     * Color progression calculation based on Section 8 & 13 of PRD:
     * 0: Transparent/Gray
     * 1-10: Soft Green
     * 11-25: Green
     * 26-49: Green -> Yellow
     * 50: Yellow
     * 51-74: Yellow -> Orange
     * 75-99: Orange -> Red
     * 100+: Red
     */
    data class ColorScheme(
        val textColor: Int,
        val backgroundColor: Int,
        val borderColor: Int
    )

    private fun resolveColorForCount(count: Int): ColorScheme {
        return when {
            count == 0 -> ColorScheme(
                textColor = Color.argb(160, 180, 190, 185),
                backgroundColor = Color.argb(60, 20, 20, 20),
                borderColor = Color.argb(40, 255, 255, 255)
            )
            count in 1..10 -> ColorScheme(
                textColor = Color.rgb(134, 239, 172), // Soft Green (#86EFAC)
                backgroundColor = Color.argb(170, 16, 35, 22),
                borderColor = Color.argb(100, 74, 222, 128)
            )
            count in 11..25 -> ColorScheme(
                textColor = Color.rgb(74, 222, 128), // Bright Green (#4ADE80)
                backgroundColor = Color.argb(190, 18, 42, 26),
                borderColor = Color.argb(140, 34, 197, 94)
            )
            count in 26..49 -> ColorScheme(
                textColor = Color.rgb(190, 242, 100), // Lime / Yellow-Green (#BEF264)
                backgroundColor = Color.argb(200, 35, 42, 18),
                borderColor = Color.argb(160, 163, 230, 53)
            )
            count == 50 -> ColorScheme(
                textColor = Color.rgb(250, 204, 21), // Pure Yellow (#FACC15)
                backgroundColor = Color.argb(220, 50, 42, 12),
                borderColor = Color.rgb(250, 204, 21)
            )
            count in 51..74 -> ColorScheme(
                textColor = Color.rgb(251, 146, 60), // Warm Orange (#FB923C)
                backgroundColor = Color.argb(220, 55, 30, 10),
                borderColor = Color.argb(180, 249, 115, 22)
            )
            count in 75..99 -> ColorScheme(
                textColor = Color.rgb(248, 113, 113), // Orange-Red (#F87171)
                backgroundColor = Color.argb(230, 60, 20, 20),
                borderColor = Color.argb(200, 239, 68, 68)
            )
            else -> ColorScheme(
                textColor = Color.rgb(239, 68, 68), // Vivid Red (#EF4444)
                backgroundColor = Color.argb(240, 70, 15, 15),
                borderColor = Color.rgb(239, 68, 68)
            )
        }
    }

    /**
     * Triggers local notification and floating in-app reminder dialog.
     */
    private fun triggerBreakMilestone(milestone: Int, title: String, body: String, isMajor: Boolean) {
        // 1. Post local Android notification
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val launchIntent = Intent(this, MainActivity::class.java)
        val pendingIntent = PendingIntent.getActivity(
            this, milestone, launchIntent,
            PendingIntent.FLAG_IMMUTABLE or PendingIntent.FLAG_UPDATE_CURRENT
        )

        val notification = NotificationCompat.Builder(this, REMINDER_CHANNEL_ID)
            .setContentTitle(title)
            .setContentText(body)
            .setSmallIcon(android.R.drawable.ic_dialog_alert)
            .setPriority(NotificationCompat.PRIORITY_HIGH)
            .setContentIntent(pendingIntent)
            .setAutoCancel(true)
            .build()

        notificationManager.notify(milestone, notification)

        // 2. Show floating reminder overlay modal
        showBreakReminderOverlay(milestone, title, body, isMajor)
    }

    private fun showBreakReminderOverlay(milestone: Int, title: String, body: String, isMajor: Boolean) {
        if (reminderDialogView != null) return // Already showing

        val inflater = LayoutInflater.from(this)
        reminderDialogView = inflater.inflate(R.layout.dialog_break_reminder, null)

        val tvTitle = reminderDialogView?.findViewById<TextView>(R.id.tv_reminder_title)
        val tvBody = reminderDialogView?.findViewById<TextView>(R.id.tv_reminder_body)
        val tvPill = reminderDialogView?.findViewById<TextView>(R.id.tv_reminder_milestone)
        val btnBreak = reminderDialogView?.findViewById<Button>(R.id.btn_take_break)
        val btnContinue = reminderDialogView?.findViewById<TextView>(R.id.btn_continue_watching)

        tvTitle?.text = title
        tvBody?.text = body
        tvPill?.text = if (isMajor) "🔴 $milestone reels" else "🌱 $milestone reels"

        val dialogParams = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.WRAP_CONTENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                @Suppress("DEPRECATION")
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_TOUCH_MODAL,
            PixelFormat.TRANSLUCENT
        ).apply {
            gravity = Gravity.CENTER
            x = 0
            y = 0
        }

        btnBreak?.setOnClickListener {
            dismissReminderOverlay()
            // Open main app with break suggestions
            val appIntent = Intent(this, MainActivity::class.java).apply {
                flags = Intent.FLAG_ACTIVITY_NEW_TASK
                putExtra("action", "take_break")
            }
            startActivity(appIntent)
        }

        btnContinue?.setOnClickListener {
            dismissReminderOverlay()
        }

        try {
            windowManager.addView(reminderDialogView, dialogParams)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    private fun dismissReminderOverlay() {
        reminderDialogView?.let {
            try {
                windowManager.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            reminderDialogView = null
        }
    }

    override fun onDestroy() {
        super.onDestroy()
        dismissReminderOverlay()
        overlayView?.let {
            try {
                windowManager.removeView(it)
            } catch (e: Exception) {
                e.printStackTrace()
            }
            overlayView = null
        }
    }
}
