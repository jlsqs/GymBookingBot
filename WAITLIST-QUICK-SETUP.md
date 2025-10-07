# 🚀 Quick Waitlist Bot Setup

## 🎯 **Super Easy Method (Recommended):**

```bash
npm run waitlist-class "class-name" "HH:MM" "day"
```

### Examples:
```bash
# Monitor Pilates at 09:30 on Friday
npm run waitlist-class "pilates" "09:30" "friday"

# Monitor Yoga at 18:00 on Monday  
npm run waitlist-class "yoga" "18:00" "monday"

# Monitor Cross Training at 12:15 on Wednesday
npm run waitlist-class "cross training" "12:15" "wednesday"
```

## 📋 **What This Does:**
1. ✅ Re-enables GitHub Actions workflow
2. ✅ Updates waitlist configuration
3. ✅ Commits and pushes changes
4. ✅ Starts monitoring automatically

## 🔧 **Manual Method (If Needed):**

### 1. Re-enable workflow:
```bash
npm run waitlist-enable
```

### 2. Edit `waitlist-config.js`:
```javascript
TARGET_CLASSES: [
    {
        name: 'your-class-name',    // e.g., 'pilates'
        time: 'HH:MM',              // e.g., '09:30'
        dayOfWeek: 0,               // 0=Sun, 1=Mon, 2=Tue, 3=Wed, 4=Thu, 5=Fri, 6=Sat
        location: null,             // Any location
        instructor: 'TBA',          // Any instructor
        priority: 1
    }
]
```

### 3. Commit and push:
```bash
git add waitlist-config.js
git commit -m "Setup waitlist for [class] at [time] on [day]"
git push
```

## 📅 **Day Numbers:**
- `0` = Sunday
- `1` = Monday  
- `2` = Tuesday
- `3` = Wednesday
- `4` = Thursday
- `5` = Friday
- `6` = Saturday

## ⏰ **Time Format:**
- Use 24-hour format: `HH:MM`
- Examples: `09:30`, `18:00`, `12:15`

## 🎯 **Class Names:**
- Use exact names from the gym app
- Examples: `pilates`, `yoga`, `cross training`, `bootcamp`, `hard training`

## 🔄 **To Stop Monitoring:**
The bot automatically stops after successful booking, or manually:
```bash
# Disable workflow
mv .github/workflows/waitlist-bot.yml .github/workflows/waitlist-bot.yml.disabled
git add . && git commit -m "Disable waitlist bot" && git push
```

## 📧 **Notifications:**
- Console logs during monitoring
- Email notifications (if configured)
- GitHub Actions logs for debugging
