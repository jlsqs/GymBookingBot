# 🌐 cron-job.org Setup Guide

This guide will help you set up [cron-job.org](https://cron-job.org/en/) to run your GymBookingBot automatically.

## 🚀 Quick Setup

### Step 1: Deploy Your Webhook

You have several options to host your webhook:

#### Option A: Local Server (if you have a static IP)
```bash
# Start the webhook server
node webhook.js

# Your webhook URL will be:
# http://YOUR_IP:3000/webhook
```

#### Option B: Cloud Hosting (Recommended)
- **Heroku**: Free tier available
- **Railway**: Free tier available  
- **Render**: Free tier available
- **Vercel**: Free tier available

#### Option C: VPS/Server
- Deploy to any VPS or cloud server
- Make sure port 3000 is accessible

### Step 2: Set Up cron-job.org

1. **Sign up** at [cron-job.org](https://cron-job.org/en/)
2. **Create a new cron job**
3. **Configure the job:**

#### Job Configuration:

**URL:** `http://YOUR_DOMAIN:3000/webhook`

**Schedule:** Create 5 separate jobs with these times:

| Job Name | Schedule | Description |
|----------|----------|-------------|
| GymBot - Monday Class | `57 29 7 * * 3` | Wednesday 07:29:57 → books Monday class |
| GymBot - Tuesday Class | `57 59 10 * * 4` | Thursday 10:59:57 → books Tuesday class |
| GymBot - Wednesday Class | `57 29 7 * * 5` | Friday 07:29:57 → books Wednesday class |
| GymBot - Thursday Class | `57 34 8 * * 6` | Saturday 08:34:57 → books Thursday class |
| GymBot - Friday Class | `57 59 12 * * 0` | Sunday 12:59:57 → books Friday class |

**Method:** `POST`

**Headers:** (Optional)
```
Content-Type: application/json
```

**Body:** (Optional)
```json
{
  "triggered_by": "cron-job.org",
  "timestamp": "{{timestamp}}"
}
```

### Step 3: Test Your Setup

1. **Test the webhook manually:**
   ```bash
   curl -X POST http://YOUR_DOMAIN:3000/webhook
   ```

2. **Check the logs:**
   ```bash
   tail -f gym_booking.log
   ```

3. **Test with cron-job.org:**
   - Use the "Test run" feature in cron-job.org
   - Check that your bot executes successfully

## 🔧 Advanced Configuration

### Environment Variables

Set these in your hosting platform:

```env
PORT=3000
NODE_ENV=production
```

### Health Check

Your webhook includes a health check endpoint:
```
GET http://YOUR_DOMAIN:3000/health
```

### Logging

All bot executions are logged to `gym_booking.log` with timestamps.

## 🛠️ Troubleshooting

### Common Issues:

1. **Webhook not responding:**
   - Check if your server is running
   - Verify the URL is correct
   - Check firewall settings

2. **Bot not executing:**
   - Check the logs in `gym_booking.log`
   - Verify `tokens.json` is present and valid
   - Test locally first: `npm run book -- --test`

3. **Authentication errors:**
   - Update your tokens: `node auth_manager.js`
   - Ensure `tokens.json` is in the project directory

### Monitoring:

- **cron-job.org** provides execution history
- **Local logs** show detailed bot activity
- **Health check** endpoint for uptime monitoring

## 📊 Benefits of cron-job.org

✅ **Reliable** - 15+ years of service  
✅ **Free** - No cost for basic usage  
✅ **Monitoring** - Execution history and status  
✅ **Flexible** - Custom schedules and retry logic  
✅ **Notifications** - Email alerts on failures  
✅ **Global** - Runs from multiple locations  

## 🔄 Backup Strategy

Keep both options running:
- **cron-job.org** for primary automation
- **Local cron** as backup (if you have a server)

This ensures maximum reliability for your gym bookings!

---

**Need help?** Check the logs first, then test locally before debugging the webhook.
