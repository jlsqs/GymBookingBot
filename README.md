# 🏋️ GymBookingBot

An automated gym class booking bot for La Montgolfière gym that intelligently books your preferred classes 5 days in advance.

## ✨ Features

- 🤖 **Automated Booking**: Books classes automatically 5 days in advance
- ⏰ **Smart Scheduling**: Different preferred times for each weekday
- 🎯 **Class Filtering**: Targets specific class types (hard training, bootcamp, cross training)
- 🔄 **Retry Logic**: Up to 3 booking attempts with intelligent timing
- 🧪 **Test Mode**: Safe testing without actual bookings
- 📊 **Class Discovery**: View available classes and their details
- 🔐 **Token Management**: Automatic token refresh and persistent storage
- 📝 **Comprehensive Logging**: Detailed logs with timestamps

## 📅 Booking Schedule

| Day | Time | Class Types |
|-----|------|-------------|
| Monday | 07:30 | Hard Training, Bootcamp, Cross Training |
| Tuesday | 11:00 | Hard Training, Bootcamp, Cross Training |
| Wednesday | 07:30 | Hard Training, Bootcamp, Cross Training |
| Thursday | 08:35 | Hard Training, Bootcamp, Cross Training |
| Friday | 13:00 | Hard Training, Bootcamp, Cross Training |

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- npm or yarn
- La Montgolfière gym membership
- mitmproxy (for initial authentication)

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd GymBookingBot
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   ```bash
   cp .env.example .env
   # Edit .env with your actual credentials
   ```

4. **First-time authentication**
   - Set `FIRST_TIME_SETUP = true` in `auth_manager.js`
   - Add your `identity_request` from mitmproxy
   - Run: `node auth_manager.js`

## 🔧 Configuration

### Environment Variables

Create a `.env` file based on `.env.example`:

```env
# API Configuration
CLIENT_ID=your_client_id_here
CLIENT_SECRET=your_client_secret_here
USER_ACCOUNT_ID=your_user_account_id_here
DEVICE_ID=your_device_id_here

# User Configuration
USER_EMAIL=your_email@example.com
```

### Getting Your Credentials

1. **Install mitmproxy**:
   ```bash
   pip install mitmproxy
   ```

2. **Capture authentication**:
   - Start mitmproxy: `mitmproxy -p 8080`
   - Configure your phone to use the proxy
   - Log into the La Montgolfière app
   - Look for the `/auth/v2/token` request
   - Copy the `identity_request` value

3. **Extract other values**:
   - `client_id` and `client_secret` from the request body
   - `user_account_id` from API responses
   - `device_id` can be any UUID

## 📖 Usage

### Book Classes Automatically

```bash
# Normal mode (waits for booking time)
npm run book

# Test mode (books immediately)
npm run book -- --test
```

### View Available Classes

```bash
# Today's classes
npm run classes

# Classes from specific date
npm run classes 2024-01-15
```

### Manual Authentication

```bash
node auth_manager.js
```

## 🏗️ Project Structure

```
GymBookingBot/
├── booking_bot.js          # Main booking automation
├── auth_manager.js         # Authentication & token management
├── get_classes_script.js   # Class discovery utility
├── package.json            # Project configuration
├── .env.example           # Configuration template
├── .gitignore             # Git ignore rules
└── README.md              # This file
```

## 🔐 Security

### Important Security Notes

- ⚠️ **Never commit your `.env` file or `tokens.json`**
- 🔒 **Keep your credentials secure**
- 🔄 **Rotate tokens regularly**
- 🛡️ **Use environment variables for all sensitive data**

### Token Management

The bot automatically:
- Refreshes expired tokens
- Stores tokens securely in `tokens.json`
- Handles authentication errors gracefully

## 🧪 Testing

### Test Mode

Run with `--test` flag to skip timing and book immediately:

```bash
npm run book -- --test
```

### Class Discovery

Use the classes script to explore available classes:

```bash
npm run classes
```

## 📊 Logging

The bot provides detailed logging:

- ✅ **Success messages** with booking confirmations
- ⚠️ **Warning messages** for timing issues
- ❌ **Error messages** with detailed error information
- 📝 **Info messages** for debugging and status updates

## 🛠️ Development

### Scripts

- `npm run book` - Run the booking bot
- `npm run classes` - View available classes
- `node auth_manager.js` - Manual authentication

### Code Structure

- **Modular design** with separate concerns
- **ES6 modules** for clean imports
- **Comprehensive error handling**
- **TypeScript-ready** structure

## 🚨 Troubleshooting

### Common Issues

1. **"No saved tokens found"**
   - Run first-time setup with `auth_manager.js`
   - Ensure `FIRST_TIME_SETUP = true`

2. **"Authentication failed"**
   - Check your credentials in `.env`
   - Verify `identity_request` is correct
   - Ensure network connectivity

3. **"No matching bookable classes found"**
   - Check if classes are available for your target date
   - Verify class names match your preferences
   - Check if classes are already full

4. **"Too late to book"**
   - The bot only books within 5 minutes of opening time
   - Run earlier or use test mode

### Debug Mode

Enable detailed logging by setting `LOG_LEVEL=debug` in your `.env` file.

## 📝 License

This project is for personal use only. Please respect the gym's terms of service.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## ⚠️ Disclaimer

This bot is for educational and personal use only. Users are responsible for:
- Complying with the gym's terms of service
- Ensuring proper authentication
- Using the bot responsibly
- Respecting booking limits and policies

## 📞 Support

For issues and questions:
1. Check the troubleshooting section
2. Review the logs for error details
3. Ensure all configuration is correct
4. Test with `--test` mode first

---

**Happy Booking! 🏋️‍♀️**
