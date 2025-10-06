# 🎯 Waitlist Bot

A smart monitoring bot that watches for available spots in fully booked gym classes and automatically books them when they become available.

## 🚀 Features

- **Smart Monitoring**: Different check intervals based on time of day
- **Priority System**: Monitor multiple classes with priority ordering
- **Automatic Booking**: Instantly books when spots become available
- **Multiple Notifications**: Console, Email, Discord, SMS support
- **Retry Logic**: Automatically retries failed bookings
- **Configurable**: Easy to customize target classes and settings

## 📋 How It Works

1. **Monitors** your target classes continuously
2. **Checks** every 2-30 minutes (depending on time of day)
3. **Books immediately** when a spot opens up
4. **Notifies** you of successful bookings
5. **Stops** when all classes are booked or time limit reached

## ⚙️ Configuration

### Target Classes

Edit `waitlist-config.js` to set your target classes:

```javascript
TARGET_CLASSES: [
    {
        name: 'cross training',
        time: '13:00',
        dayOfWeek: 5, // Friday
        location: 'Salle 1 Boxe-Training',
        instructor: 'Fabrice',
        priority: 1 // Higher number = higher priority
    }
    // Add more classes...
]
```

### Monitoring Intervals

- **Peak Hours** (6-9 AM, 12-2 PM, 6-8 PM): Every 2 minutes
- **Normal Hours**: Every 5 minutes  
- **Off-Peak**: Every 15 minutes
- **Night Hours** (10 PM - 6 AM): Every 30 minutes

### Notifications

Set up notifications by configuring environment variables:

```bash
# Email notifications
export NOTIFICATION_EMAIL="your-email@example.com"
export EMAIL_USER="your-email@gmail.com"
export EMAIL_PASS="your-app-password"

# Discord notifications
export DISCORD_WEBHOOK_URL="https://discord.com/api/webhooks/..."

# SMS notifications (Twilio)
export TWILIO_ACCOUNT_SID="your-account-sid"
export TWILIO_AUTH_TOKEN="your-auth-token"
export TWILIO_FROM_NUMBER="+1234567890"
export TWILIO_TO_NUMBER="+0987654321"
```

## 🚀 Usage

### Setup

1. **Configure your target classes** in `waitlist-config.js`
2. **Set up notifications** (optional but recommended)
3. **Run setup** to verify configuration:

```bash
npm run waitlist-setup
```

### Start Monitoring

```bash
# Start monitoring all target classes
npm run waitlist

# Test with a specific class (dry run)
npm run waitlist-test
```

### Stop Monitoring

Press `Ctrl+C` to stop monitoring gracefully.

## 📊 Monitoring Behavior

### Peak Hours (6-9 AM, 12-2 PM, 6-8 PM)
- Checks every **2 minutes**
- Most likely time for cancellations
- Highest chance of success

### Normal Hours
- Checks every **5 minutes**
- Balanced monitoring frequency
- Good for regular monitoring

### Off-Peak Hours
- Checks every **15 minutes**
- Lower frequency to save resources
- Still catches last-minute cancellations

### Night Hours (10 PM - 6 AM)
- Checks every **30 minutes**
- Minimal monitoring during sleep hours
- Catches early morning cancellations

## 🎯 Smart Features

### Priority System
Classes are checked in priority order (1 = highest priority). Higher priority classes are checked first.

### Retry Logic
- Automatically retries failed bookings up to 3 times
- 10-second delay between retries
- Tracks attempts per class to avoid spam

### Multiple Booking Options
- **Stop after first booking**: Stops when any class is booked
- **Allow multiple bookings**: Books all available classes
- **Priority-based**: Books highest priority class first

### Error Handling
- Graceful error recovery
- Continues monitoring after temporary failures
- Sends error notifications for debugging

## 📱 Notifications

### Console (Always Enabled)
- Real-time status updates
- Detailed logging with timestamps
- Color-coded messages

### Email
- HTML formatted notifications
- Class details and booking confirmations
- Error alerts and status updates

### Discord
- Rich embeds with class information
- Color-coded by notification type
- Real-time updates in your Discord server

### SMS
- Instant text notifications
- Perfect for urgent alerts
- Works with any SMS service

## 🔧 Advanced Configuration

### Smart Monitoring
Enable intelligent monitoring that adjusts intervals based on class popularity and booking patterns.

### Timezone Support
All times are handled in your local timezone. The bot automatically converts to UTC for API calls.

### Logging
- Configurable log levels (DEBUG, INFO, WARN, ERROR)
- Automatic log rotation
- File and console logging

## 🚨 Important Notes

### API Rate Limits
The bot respects API rate limits and includes delays between requests to avoid being blocked.

### Booking Timing
- Books immediately when spots become available
- No waiting for "optimal" booking times
- First-come, first-served approach

### Resource Usage
- Minimal CPU and memory usage
- Efficient polling with smart intervals
- Automatic cleanup and garbage collection

## 🛠️ Troubleshooting

### Common Issues

**Bot not finding classes:**
- Check class name spelling in config
- Verify day of week (0=Sunday, 1=Monday, etc.)
- Ensure time format is HH:MM (24-hour)

**Booking failures:**
- Check if tokens are valid and not expired
- Verify class is actually bookable
- Check for API errors in logs

**Notifications not working:**
- Verify environment variables are set
- Check notification service credentials
- Test with console notifications first

### Debug Mode

Enable debug logging by setting:
```bash
export LOG_LEVEL=DEBUG
```

## 📈 Success Tips

1. **Monitor during peak hours** for best results
2. **Set realistic priorities** for your most wanted classes
3. **Use multiple notification methods** for reliability
4. **Check logs regularly** to ensure bot is working
5. **Test configuration** before long-term monitoring

## 🔒 Security

- All sensitive data stored in environment variables
- No hardcoded credentials in code
- Secure token management
- Encrypted notification channels

## 📞 Support

If you encounter issues:
1. Check the logs for error messages
2. Verify your configuration
3. Test with a single class first
4. Check API connectivity and tokens

---

**Happy booking! 🎉**
