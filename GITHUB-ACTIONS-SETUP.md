# 🚀 GitHub Actions + cron-job.org Setup

This setup uses GitHub Actions as your webhook and [cron-job.org](https://cron-job.org/en/) to trigger them via GitHub's API.

## 🎯 Why This Approach is Perfect:

✅ **Reliable** - GitHub Actions are extremely stable  
✅ **Free** - No cloud hosting costs  
✅ **Monitored** - Full execution history in GitHub  
✅ **Secure** - Uses GitHub's built-in security  
✅ **Scalable** - Easy to add more workflows  

## 🔧 Step 1: Set Up GitHub Secrets

1. **Go to your repository settings:**
   - https://github.com/jlsqs/GymBookingBot/settings/secrets/actions

2. **Add these secrets:**
   - `CLIENT_ID`: `8kTC2WKnd3ZrjXt8gD1GZyN78uWAPFgN`
   - `CLIENT_SECRET`: `8QLHnxvAlKaX85KVy42REI9tyBSnqxrBSTewt4bmQATWyNxmcxQo0nElQOMAm1994zNcIggBefqawdXq5qMbh7rmcRVozli12IV0ebWVenenQBYDYW9HPtZqPz841OBc`
   - `USER_ACCOUNT_ID`: `3d48d22c-4e09-430e-a4d0-d65d58a5bd0d`
   - `DEVICE_ID`: `9C329D35-7479-4979-A38A-D6DA27DC4074`
   - `USER_EMAIL`: `j.sarquis@hotmail.com`
   - `ACCESS_TOKEN`: (from your tokens.json)
   - `REFRESH_TOKEN`: (from your tokens.json)
   - `TOKEN_EXPIRY`: (from your tokens.json)
   - `SECRETS_PAT`: a personal access token that can write this repo's secrets (see below)

### Keeping tokens fresh (`SECRETS_PAT`)

Every time the bot refreshes its access token, the API also issues a **new refresh token**
and the old one stops working. The bot writes the new tokens back to the
`ACCESS_TOKEN`, `REFRESH_TOKEN` and `TOKEN_EXPIRY` secrets, which needs a token that is allowed to edit secrets:

1. Go to https://github.com/settings/personal-access-tokens/new (fine-grained token)
2. Repository access: **Only select repositories** → `GymBookingBot`
3. Repository permissions: **Secrets → Read and write**
4. Generate it and save it as the repository secret `SECRETS_PAT`

Without it the bot still runs, but the stored refresh token goes stale and you will
eventually see `Invalid refresh token` and have to re-authenticate by hand.

## 🔑 Step 2: Create GitHub Personal Access Token

1. **Go to GitHub Settings:**
   - https://github.com/settings/tokens

2. **Create new token:**
   - Click "Generate new token" → "Generate new token (classic)"
   - **Note:** "GymBookingBot cron-job.org"
   - **Expiration:** No expiration (or 1 year)
   - **Scopes:** Check "repo" (Full control of private repositories)

3. **Copy the token** - you'll need it for cron-job.org

## 🕐 Step 3: Set Up cron-job.org

1. **Go to [cron-job.org](https://cron-job.org/en/)**
2. **Sign up for free account**
3. **Create 5 separate cron jobs:**

### Job 1: Monday Class (Wednesday 07:29:57)
- **Title:** `GymBot - Monday Class`
- **URL:** `https://api.github.com/repos/jlsqs/GymBookingBot/dispatches`
- **Schedule:** `57 29 7 * * 3`
- **Method:** `POST`
- **Headers:**
  ```
  Authorization: token YOUR_GITHUB_TOKEN
  Accept: application/vnd.github.v3+json
  Content-Type: application/json
  ```
- **Body:**
  ```json
  {
    "event_type": "booking-request",
    "client_payload": {
      "class_type": "monday",
      "triggered_at": "{{timestamp}}"
    }
  }
  ```

### Job 2: Tuesday Class (Thursday 10:59:57)
- **Title:** `GymBot - Tuesday Class`
- **URL:** `https://api.github.com/repos/jlsqs/GymBookingBot/dispatches`
- **Schedule:** `57 59 10 * * 4`
- **Method:** `POST`
- **Headers:** (same as above)
- **Body:**
  ```json
  {
    "event_type": "booking-request",
    "client_payload": {
      "class_type": "tuesday",
      "triggered_at": "{{timestamp}}"
    }
  }
  ```

### Job 3: Wednesday Class (Friday 07:29:57)
- **Title:** `GymBot - Wednesday Class`
- **URL:** `https://api.github.com/repos/jlsqs/GymBookingBot/dispatches`
- **Schedule:** `57 29 7 * * 5`
- **Method:** `POST`
- **Headers:** (same as above)
- **Body:**
  ```json
  {
    "event_type": "booking-request",
    "client_payload": {
      "class_type": "wednesday",
      "triggered_at": "{{timestamp}}"
    }
  }
  ```

### Job 4: Thursday Class (Saturday 08:34:57)
- **Title:** `GymBot - Thursday Class`
- **URL:** `https://api.github.com/repos/jlsqs/GymBookingBot/dispatches`
- **Schedule:** `57 34 8 * * 6`
- **Method:** `POST`
- **Headers:** (same as above)
- **Body:**
  ```json
  {
    "event_type": "booking-request",
    "client_payload": {
      "class_type": "thursday",
      "triggered_at": "{{timestamp}}"
    }
  }
  ```

### Job 5: Friday Class (Sunday 12:59:57)
- **Title:** `GymBot - Friday Class`
- **URL:** `https://api.github.com/repos/jlsqs/GymBookingBot/dispatches`
- **Schedule:** `57 59 12 * * 0`
- **Method:** `POST`
- **Headers:** (same as above)
- **Body:**
  ```json
  {
    "event_type": "booking-request",
    "client_payload": {
      "class_type": "friday",
      "triggered_at": "{{timestamp}}"
    }
  }
  ```

## 🧪 Step 4: Test Your Setup

### Test GitHub Action Manually:
1. **Go to Actions tab:** https://github.com/jlsqs/GymBookingBot/actions
2. **Click "Gym Booking Bot"**
3. **Click "Run workflow"**
4. **Select class type and run**

### Test with Local Script:
```bash
# Set your GitHub token
export GITHUB_TOKEN=your_token_here

# Test triggering different classes
node scripts/trigger-github-action.js monday
node scripts/trigger-github-action.js tuesday
node scripts/trigger-github-action.js auto
```

### Test with cron-job.org:
- Use the "Test run" feature for each job
- Check execution history

## 📊 Step 5: Monitor Your Bot

### GitHub Actions Features:
- ✅ **Execution History** - See all runs and logs
- ✅ **Real-time Logs** - Watch runs in progress
- ✅ **Artifacts** - Download logs and data
- ✅ **Notifications** - Email alerts on failures
- ✅ **Manual Triggers** - Run anytime from GitHub

### cron-job.org Features:
- ✅ **Execution History** - See all API calls
- ✅ **Status Notifications** - Email alerts on failures
- ✅ **Execution Prediction** - See next scheduled runs
- ✅ **Test Runs** - Test immediately

## 🔧 Troubleshooting

### Common Issues:

1. **GitHub Action not triggering:**
   - Check GitHub token has "repo" scope
   - Verify repository_dispatch is enabled
   - Check cron-job.org execution history

2. **Bot not booking:**
   - Check GitHub Secrets are set correctly
   - Verify tokens.json values in secrets
   - Check Action logs for errors

3. **Authentication errors (`Invalid refresh token`):**
   - The bot now stops immediately and the run fails instead of retrying for hours
   - Re-authenticate locally (`FIRST_TIME_SETUP = true` in auth_manager.js with a fresh `identity_request`)
   - Run `node scripts/setup-github-secrets.js` to print the new values
   - Update GitHub Secrets with new tokens
   - Re-run the workflow

### Getting Help:

- **GitHub Actions:** Check the Actions tab for detailed logs
- **cron-job.org:** Check their execution history
- **Local Testing:** Use the trigger script to test

## 🎉 You're All Set!

Once configured, your bot will:
- ✅ Run automatically via [cron-job.org](https://cron-job.org/en/)
- ✅ Execute on GitHub Actions (reliable infrastructure)
- ✅ Book classes 3 seconds before they open
- ✅ Handle token refresh automatically
- ✅ Log everything for monitoring

**No external hosting needed - everything runs on GitHub!** 🏋️‍♀️
