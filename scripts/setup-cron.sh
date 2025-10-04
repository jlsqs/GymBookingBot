#!/bin/bash

# GymBookingBot Cron Job Setup Script

echo "🕐 GymBookingBot Cron Job Setup"
echo "================================"
echo ""

# Get the current directory (where the script is located)
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

echo "📁 Project directory: $PROJECT_DIR"
echo ""

# Check if Node.js is available
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed or not in PATH"
    echo "   Please install Node.js first"
    exit 1
fi

echo "✅ Node.js found: $(node --version)"
echo ""

# Check if npm is available
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed or not in PATH"
    echo "   Please install npm first"
    exit 1
fi

echo "✅ npm found: $(npm --version)"
echo ""

# Install dependencies if node_modules doesn't exist
if [ ! -d "$PROJECT_DIR/node_modules" ]; then
    echo "📦 Installing dependencies..."
    cd "$PROJECT_DIR"
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install dependencies"
        exit 1
    fi
    echo "✅ Dependencies installed"
else
    echo "✅ Dependencies already installed"
fi

echo ""

# Create the cron job entry
CRON_JOB="30 6 * * 1-5 cd $PROJECT_DIR && /usr/bin/node booking_bot.js >> $PROJECT_DIR/booking.log 2>&1"

echo "🕐 Cron Job Configuration:"
echo "   Schedule: Every weekday at 6:30 AM"
echo "   Command: $CRON_JOB"
echo ""

# Show current crontab
echo "📋 Current crontab:"
crontab -l 2>/dev/null || echo "   No crontab found"
echo ""

# Ask if user wants to add the cron job
read -p "Do you want to add this cron job? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Add the cron job
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    
    if [ $? -eq 0 ]; then
        echo "✅ Cron job added successfully!"
        echo ""
        echo "📋 Updated crontab:"
        crontab -l
        echo ""
        echo "📝 Logs will be saved to: $PROJECT_DIR/booking.log"
        echo ""
        echo "🔧 To manage your cron jobs:"
        echo "   View: crontab -l"
        echo "   Edit: crontab -e"
        echo "   Remove: crontab -r"
    else
        echo "❌ Failed to add cron job"
        exit 1
    fi
else
    echo "ℹ️  Cron job not added. You can add it manually later with:"
    echo "   crontab -e"
    echo "   Then add this line:"
    echo "   $CRON_JOB"
fi

echo ""
echo "🎯 Next steps:"
echo "   1. Make sure your tokens.json is up to date"
echo "   2. Test the bot manually: npm run book -- --test"
echo "   3. Check logs: tail -f $PROJECT_DIR/booking.log"
echo ""
echo "✅ Setup complete!"
