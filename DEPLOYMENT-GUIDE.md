# 🚀 Deployment Guide for cron-job.org

This guide will help you deploy your GymBookingBot webhook and set it up with [cron-job.org](https://cron-job.org/en/).

## 📋 Prerequisites

- ✅ Webhook tested locally (already done)
- ✅ GitHub repository with your code
- ✅ Cloud platform account (Railway, Render, or Heroku)

## 🌐 Step 1: Deploy to Cloud Platform

### Option A: Railway (Recommended)

1. **Go to [railway.app](https://railway.app)**
2. **Sign up with GitHub**
3. **Create new project** → "Deploy from GitHub repo"
4. **Select your GymBookingBot repository**
5. **Railway will auto-detect Node.js and deploy**
6. **Copy your webhook URL** (e.g., `https://gymbookingbot-production.up.railway.app`)

### Option B: Render

1. **Go to [render.com](https://render.com)**
2. **Sign up and connect GitHub**
3. **Create new Web Service**
4. **Connect your GymBookingBot repository**
5. **Settings:**
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment:** Node
6. **Deploy and copy your URL**

### Option C: Heroku

1. **Go to [heroku.com](https://heroku.com)**
2. **Create new app**
3. **Connect to GitHub**
4. **Enable automatic deploys**
5. **Deploy and copy your URL**

## 🔧 Step 2: Configure Your Webhook

Your webhook will be available at:
- **Main endpoint:** `https://YOUR-APP-NAME.railway.app/webhook`
- **Health check:** `https://YOUR-APP-NAME.railway.app/health`

## 🕐 Step 3: Set Up cron-job.org

1. **Go to [cron-job.org](https://cron-job.org/en/)**
2. **Sign up for free account**
3. **Create 5 separate cron jobs:**

### Job 1: Monday Class (Wednesday 07:29:57)
- **Title:** `GymBot - Monday Class`
- **URL:** `https://YOUR-APP-NAME.railway.app/webhook`
- **Schedule:** `57 29 7 * * 3`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

### Job 2: Tuesday Class (Thursday 10:59:57)
- **Title:** `GymBot - Tuesday Class`
- **URL:** `https://YOUR-APP-NAME.railway.app/webhook`
- **Schedule:** `57 59 10 * * 4`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

### Job 3: Wednesday Class (Friday 07:29:57)
- **Title:** `GymBot - Wednesday Class`
- **URL:** `https://YOUR-APP-NAME.railway.app/webhook`
- **Schedule:** `57 29 7 * * 5`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

### Job 4: Thursday Class (Saturday 08:34:57)
- **Title:** `GymBot - Thursday Class`
- **URL:** `https://YOUR-APP-NAME.railway.app/webhook`
- **Schedule:** `57 34 8 * * 6`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

### Job 5: Friday Class (Sunday 12:59:57)
- **Title:** `GymBot - Friday Class`
- **URL:** `https://YOUR-APP-NAME.railway.app/webhook`
- **Schedule:** `57 59 12 * * 0`
- **Method:** `POST`
- **Headers:** `Content-Type: application/json`

## 🧪 Step 4: Test Your Setup

1. **Test webhook manually:**
   ```bash
   curl -X POST https://YOUR-APP-NAME.railway.app/webhook
   ```

2. **Test with cron-job.org:**
   - Use the "Test run" feature for each job
   - Check execution history

3. **Monitor logs:**
   - Check your cloud platform logs
   - cron-job.org shows execution history

## 📊 Step 5: Monitor Your Bot

### cron-job.org Features:
- ✅ **Execution History** - See all runs and results
- ✅ **Status Notifications** - Email alerts on failures
- ✅ **Execution Prediction** - See next scheduled runs
- ✅ **Test Runs** - Test immediately

### Your Bot Features:
- ✅ **Automatic Token Refresh** - Handles expired tokens
- ✅ **Smart Class Filtering** - Finds your preferred classes
- ✅ **Precise Timing** - 3 seconds before booking opens
- ✅ **Comprehensive Logging** - All activities logged

## 🎯 Why This Setup is Perfect:

1. **Reliable** - [cron-job.org](https://cron-job.org/en/) has 15+ years uptime
2. **Precise** - Your 3-second-early timing strategy
3. **Free** - Both cron-job.org and cloud platforms are free
4. **Monitored** - Full execution history and notifications
5. **Scalable** - Easy to add more jobs or modify schedules

## 🔧 Troubleshooting

### Common Issues:

1. **Webhook not responding:**
   - Check cloud platform logs
   - Verify URL is correct
   - Test health endpoint

2. **Bot not booking:**
   - Check `tokens.json` is up to date
   - Verify class availability
   - Check timing (must be within 5 minutes)

3. **Authentication errors:**
   - Update tokens locally
   - Redeploy to cloud platform

### Getting Help:

- **cron-job.org:** Check their FAQ and support
- **Cloud Platform:** Check their documentation
- **Bot Logs:** Check execution history and platform logs

## 🎉 You're All Set!

Once deployed, your bot will:
- ✅ Run automatically on [cron-job.org](https://cron-job.org/en/)
- ✅ Book classes 3 seconds before they open
- ✅ Handle token refresh automatically
- ✅ Log everything for monitoring

**No more manual booking needed!** 🏋️‍♀️
