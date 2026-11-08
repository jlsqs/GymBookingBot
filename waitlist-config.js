// Waitlist Bot Configuration
// Customize your target classes and monitoring settings here

export const WAITLIST_CONFIG = {
    // Target classes to monitor for availability
    TARGET_CLASSES: [
        {
            name: 'calisthenics',
            time: '10:00',
            dayOfWeek: 3, // thursday
            location: null, // Any location
            instructor: 'TBA', // Any instructor
            priority: 1
        }
    ],

    // Monitoring intervals (in milliseconds)
    MONITORING_INTERVALS: {
        PEAK_HOURS: 2 * 60 * 1000,    // 2 minutes during peak hours
        NORMAL_HOURS: 5 * 60 * 1000,  // 5 minutes during normal hours
        OFF_PEAK: 15 * 60 * 1000,     // 15 minutes during off-peak hours
        NIGHT_HOURS: 30 * 60 * 1000   // 30 minutes during night hours
    },

    // Peak hours when classes are most likely to have cancellations
    PEAK_HOURS: [
        { start: 6, end: 9 },   // Morning rush (6-9 AM)
        { start: 12, end: 14 }, // Lunch time (12-2 PM)
        { start: 18, end: 20 }  // Evening rush (6-8 PM)
    ],

    // Night hours (minimal monitoring)
    NIGHT_HOURS: [
        { start: 22, end: 6 }   // 10 PM - 6 AM
    ],

    // Bot settings
    MAX_MONITORING_DAYS: 7,     // Stop monitoring after 7 days
    MAX_ATTEMPTS_PER_CLASS: 10, // Max booking attempts per class
    DELAY_BETWEEN_CLASSES: 2000, // 2 seconds delay between checking different classes
    DELAY_BETWEEN_ATTEMPTS: 5000, // 5 seconds delay between booking attempts

    // Notification settings
    NOTIFICATIONS: {
        enabled: true,
        email: process.env.NOTIFICATION_EMAIL || 'your-email@example.com',
        methods: ['console', 'email'], // 'console', 'email', 'sms', 'discord'
        
        // Email settings (if using email notifications)
        emailConfig: {
            service: 'gmail', // or your preferred email service
            user: process.env.EMAIL_USER || '',
            pass: process.env.EMAIL_PASS || ''
        },
        
        // Discord webhook (if using Discord notifications)
        discordWebhook: process.env.DISCORD_WEBHOOK_URL || '',
        
        // SMS settings (if using SMS notifications)
        smsConfig: {
            service: 'twilio', // or your preferred SMS service
            accountSid: process.env.TWILIO_ACCOUNT_SID || '',
            authToken: process.env.TWILIO_AUTH_TOKEN || '',
            fromNumber: process.env.TWILIO_FROM_NUMBER || '',
            toNumber: process.env.TWILIO_TO_NUMBER || ''
        }
    },

    // Logging settings
    LOGGING: {
        level: 'INFO', // 'DEBUG', 'INFO', 'WARN', 'ERROR'
        saveToFile: true,
        logFile: 'waitlist-bot.log',
        maxLogSize: '10MB',
        maxLogFiles: 5
    },

    // Advanced settings
    ADVANCED: {
        // Retry failed bookings
        retryFailedBookings: true,
        maxRetries: 3,
        retryDelay: 10000, // 10 seconds
        
        // Smart monitoring (adjust intervals based on class popularity)
        smartMonitoring: true,
        
        // Book multiple classes if available
        allowMultipleBookings: false,
        
        // Stop monitoring after first successful booking
        stopAfterFirstBooking: true,
        
        // Timezone for logging and notifications
        timezone: 'Europe/Paris'
    }
};

// Helper functions for configuration
export const ConfigHelpers = {
    // Get monitoring interval based on current time
    getMonitoringInterval() {
        const now = new Date();
        const hour = now.getHours();
        
        // Check if it's night time
        if (WAITLIST_CONFIG.NIGHT_HOURS.some(night => 
            (night.start > night.end) ? 
            (hour >= night.start || hour < night.end) : 
            (hour >= night.start && hour < night.end)
        )) {
            return WAITLIST_CONFIG.MONITORING_INTERVALS.NIGHT_HOURS;
        }
        
        // Check if it's peak time
        if (WAITLIST_CONFIG.PEAK_HOURS.some(peak => 
            hour >= peak.start && hour < peak.end
        )) {
            return WAITLIST_CONFIG.MONITORING_INTERVALS.PEAK_HOURS;
        }
        
        return WAITLIST_CONFIG.MONITORING_INTERVALS.NORMAL_HOURS;
    },

    // Get target classes sorted by priority
    getTargetClassesByPriority() {
        return [...WAITLIST_CONFIG.TARGET_CLASSES].sort((a, b) => 
            (a.priority || 0) - (b.priority || 0)
        );
    },

    // Check if notifications are enabled for a specific method
    isNotificationEnabled(method) {
        return WAITLIST_CONFIG.NOTIFICATIONS.enabled && 
               WAITLIST_CONFIG.NOTIFICATIONS.methods.includes(method);
    },

    // Get log level
    getLogLevel() {
        return WAITLIST_CONFIG.LOGGING.level;
    }
};
