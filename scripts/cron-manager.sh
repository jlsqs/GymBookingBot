#!/bin/bash

# GymBookingBot Cron Job Manager

echo "🕐 GymBookingBot Cron Job Manager"
echo "================================="
echo ""

# Get the current directory
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_DIR="$(dirname "$SCRIPT_DIR")"

# Function to show current cron jobs
show_cron_jobs() {
    echo "📋 Current cron jobs:"
    echo "===================="
    crontab -l 2>/dev/null | grep -E "(GymBookingBot|booking_bot)" || echo "   No GymBookingBot cron jobs found"
    echo ""
}

# Function to add cron job
add_cron_job() {
    echo "➕ Adding GymBookingBot cron job..."
    
    # Check if already exists
    if crontab -l 2>/dev/null | grep -q "booking_bot.js"; then
        echo "⚠️  A GymBookingBot cron job already exists"
        read -p "Do you want to replace it? (y/n): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            echo "❌ Cancelled"
            return
        fi
        # Remove existing job
        crontab -l 2>/dev/null | grep -v "booking_bot.js" | crontab -
    fi
    
    # Add new job
    CRON_JOB="30 6 * * 1-5 cd $PROJECT_DIR && /usr/bin/node booking_bot.js >> $PROJECT_DIR/booking.log 2>&1"
    (crontab -l 2>/dev/null; echo "$CRON_JOB") | crontab -
    
    if [ $? -eq 0 ]; then
        echo "✅ Cron job added successfully!"
    else
        echo "❌ Failed to add cron job"
    fi
}

# Function to remove cron job
remove_cron_job() {
    echo "➖ Removing GymBookingBot cron job..."
    
    if crontab -l 2>/dev/null | grep -q "booking_bot.js"; then
        crontab -l 2>/dev/null | grep -v "booking_bot.js" | crontab -
        echo "✅ Cron job removed successfully!"
    else
        echo "ℹ️  No GymBookingBot cron job found"
    fi
}

# Function to test the bot
test_bot() {
    echo "🧪 Testing GymBookingBot..."
    cd "$PROJECT_DIR"
    npm run book -- --test
}

# Function to view logs
view_logs() {
    echo "📝 Recent booking logs:"
    echo "======================"
    if [ -f "$PROJECT_DIR/booking.log" ]; then
        tail -20 "$PROJECT_DIR/booking.log"
    else
        echo "   No logs found yet"
    fi
    echo ""
}

# Function to show help
show_help() {
    echo "Available commands:"
    echo "  show    - Show current cron jobs"
    echo "  add     - Add GymBookingBot cron job"
    echo "  remove  - Remove GymBookingBot cron job"
    echo "  test    - Test the bot (test mode)"
    echo "  logs    - View recent logs"
    echo "  help    - Show this help"
    echo ""
    echo "Usage: $0 [command]"
}

# Main menu
case "${1:-menu}" in
    "show")
        show_cron_jobs
        ;;
    "add")
        add_cron_job
        show_cron_jobs
        ;;
    "remove")
        remove_cron_job
        show_cron_jobs
        ;;
    "test")
        test_bot
        ;;
    "logs")
        view_logs
        ;;
    "help")
        show_help
        ;;
    "menu"|*)
        echo "Choose an option:"
        echo "1. Show current cron jobs"
        echo "2. Add GymBookingBot cron job"
        echo "3. Remove GymBookingBot cron job"
        echo "4. Test the bot"
        echo "5. View logs"
        echo "6. Help"
        echo ""
        read -p "Enter choice (1-6): " choice
        
        case $choice in
            1) show_cron_jobs ;;
            2) add_cron_job; show_cron_jobs ;;
            3) remove_cron_job; show_cron_jobs ;;
            4) test_bot ;;
            5) view_logs ;;
            6) show_help ;;
            *) echo "Invalid choice" ;;
        esac
        ;;
esac
