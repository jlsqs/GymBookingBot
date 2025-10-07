# 🤖 Auto-Disable Feature

The waitlist bot now automatically disables itself after successfully booking a class to prevent unnecessary monitoring and resource usage.

## 🎯 How It Works

1. **Bot monitors** the target class continuously
2. **When a spot opens** and the bot successfully books it
3. **Bot automatically**:
   - Stops monitoring
   - Disables the GitHub Actions workflow
   - Commits the changes to Git
   - Sends notification that monitoring is disabled

## 🔧 What Happens

### When Booking Succeeds:
```
🎉 Booking successful! Stopping monitoring for this class.
🔧 Disabling GitHub Actions workflow...
✅ GitHub Actions workflow disabled successfully!
📧 All future scheduled runs have been cancelled.
🛑 Stopping monitoring after first successful booking.
```

### Workflow File Changes:
- **Before**: `.github/workflows/waitlist-bot.yml` (active)
- **After**: `.github/workflows/waitlist-bot.yml.disabled` (inactive)

## 🔄 Re-enabling the Bot

If you want to start monitoring again (e.g., for a different class):

```bash
npm run waitlist-enable
```

This will:
- Rename the workflow file back to active
- Commit and push the changes
- Restart monitoring on the next scheduled run

## ⚙️ Configuration

The auto-disable feature is controlled by:

```javascript
// In waitlist-config.js
ADVANCED: {
    stopAfterFirstBooking: true,  // Enable auto-disable
    // ... other settings
}
```

## 📧 Notifications

You'll receive notifications when:
- ✅ **Booking succeeds** - "Booking successful! All monitoring disabled"
- 🔧 **Workflow disabled** - "GitHub Actions workflow disabled successfully"
- 📧 **Monitoring stopped** - "First successful booking completed - All monitoring disabled"

## 🎯 Benefits

- ✅ **No wasted resources** - Stops monitoring after success
- ✅ **No email spam** - Disables all future scheduled runs
- ✅ **Clean shutdown** - Gracefully stops all processes
- ✅ **Easy re-enable** - Simple command to restart if needed
- ✅ **Automatic cleanup** - Commits changes to Git automatically

## 🚨 Important Notes

- The bot will **only auto-disable** when running in GitHub Actions
- Local test runs will **not** disable the workflow
- You can **re-enable** anytime with `npm run waitlist-enable`
- The feature is **enabled by default** in the configuration
