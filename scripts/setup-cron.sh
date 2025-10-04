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

# Create the cron job entries with specific times
CRON_JOBS=(
    "# Wednesday 07:29:57 → books Monday class"
    "57 29 7 * * 3  cd $PROJECT_DIR && /usr/local/bin/node booking_bot.js >> $PROJECT_DIR/gym_booking.log 2>&1"
    ""
    "# Thursday 10:59:57 → books Tuesday class"
    "57 59 10 * * 4  cd $PROJECT_DIR && /usr/local/bin/node booking_bot.js >> $PROJECT_DIR/gym_booking.log 2>&1"
    ""
    "# Friday 07:29:57 → books Wednesday class"
    "57 29 7 * * 5  cd $PROJECT_DIR && /usr/local/bin/node booking_bot.js >> $PROJECT_DIR/gym_booking.log 2>&1"
    ""
    "# Saturday 08:34:57 → books Thursday class"
    "57 34 8 * * 6  cd $PROJECT_DIR && /usr/local/bin/node booking_bot.js >> $PROJECT_DIR/gym_booking.log 2>&1"
    ""
    "# Sunday 12:59:57 → books Friday class"
    "57 59 12 * * 0  cd $PROJECT_DIR && /usr/local/bin/node booking_bot.js >> $PROJECT_DIR/gym_booking.log 2>&1"
)

echo "🕐 Cron Job Configuration:"
echo "   Wednesday 07:29:57 → books Monday class"
echo "   Thursday 10:59:57 → books Tuesday class"
echo "   Friday 07:29:57 → books Wednesday class"
echo "   Saturday 08:34:57 → books Thursday class"
echo "   Sunday 12:59:57 → books Friday class"
echo ""

# Show current crontab
echo "📋 Current crontab:"
crontab -l 2>/dev/null || echo "   No crontab found"
echo ""

# Ask if user wants to add the cron jobs
read -p "Do you want to add these cron jobs? (y/n): " -n 1 -r
echo ""

if [[ $REPLY =~ ^[Yy]$ ]]; then
    # Remove existing GymBookingBot cron jobs first
    crontab -l 2>/dev/null | grep -v "booking_bot.js" | crontab -
    
    # Add the new cron jobs
    (crontab -l 2>/dev/null; printf '%s\n' "${CRON_JOBS[@]}") | crontab -
    
    if [ $? -eq 0 ]; then
        echo "✅ Cron jobs added successfully!"
        echo ""
        echo "📋 Updated crontab:"
        crontab -l
        echo ""
        echo "📝 Logs will be saved to: $PROJECT_DIR/gym_booking.log"
        echo ""
        echo "🔧 To manage your cron jobs:"
        echo "   View: crontab -l"
        echo "   Edit: crontab -e"
        echo "   Remove: crontab -r"
    else
        echo "❌ Failed to add cron jobs"
        exit 1
    fi
else
    echo "ℹ️  Cron jobs not added. You can add them manually later with:"
    echo "   crontab -e"
    echo "   Then add these lines:"
    printf '%s\n' "${CRON_JOBS[@]}"
fi

echo ""
echo "🎯 Next steps:"
echo "   1. Make sure your tokens.json is up to date"
echo "   2. Test the bot manually: npm run book -- --test"
echo "   3. Check logs: tail -f $PROJECT_DIR/booking.log"
echo ""
echo "✅ Setup complete!"
