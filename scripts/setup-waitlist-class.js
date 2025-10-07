#!/usr/bin/env node

/**
 * Quick Setup for Waitlist Bot
 * 
 * Usage: node scripts/setup-waitlist-class.js "class-name" "HH:MM" "day"
 * Example: node scripts/setup-waitlist-class.js "pilates" "09:30" "friday"
 */

import fs from 'fs';
import { execSync } from 'child_process';

const args = process.argv.slice(2);

if (args.length !== 3) {
    console.log('❌ Usage: node scripts/setup-waitlist-class.js "class-name" "HH:MM" "day"');
    console.log('📝 Example: node scripts/setup-waitlist-class.js "pilates" "09:30" "friday"');
    console.log('📝 Example: node scripts/setup-waitlist-class.js "yoga" "18:00" "monday"');
    process.exit(1);
}

const [className, time, day] = args;

// Convert day name to number
const dayMap = {
    'sunday': 0, 'monday': 1, 'tuesday': 2, 'wednesday': 3,
    'thursday': 4, 'friday': 5, 'saturday': 6
};

const dayOfWeek = dayMap[day.toLowerCase()];
if (dayOfWeek === undefined) {
    console.log('❌ Invalid day. Use: sunday, monday, tuesday, wednesday, thursday, friday, saturday');
    process.exit(1);
}

// Validate time format
if (!/^\d{2}:\d{2}$/.test(time)) {
    console.log('❌ Invalid time format. Use HH:MM (e.g., 09:30, 18:00)');
    process.exit(1);
}

console.log(`🔧 Setting up waitlist bot for: ${className} at ${time} on ${day}`);

try {
    // 1. Re-enable workflow
    console.log('1️⃣ Re-enabling GitHub Actions workflow...');
    execSync('npm run waitlist-enable', { stdio: 'inherit' });

    // 2. Update config
    console.log('2️⃣ Updating waitlist configuration...');
    const configPath = 'waitlist-config.js';
    let config = fs.readFileSync(configPath, 'utf8');
    
    // Replace the TARGET_CLASSES section
    const newConfig = config.replace(
        /TARGET_CLASSES: \[[\s\S]*?\],/,
        `TARGET_CLASSES: [
        {
            name: '${className}',
            time: '${time}',
            dayOfWeek: ${dayOfWeek}, // ${day}
            location: null, // Any location
            instructor: 'TBA', // Any instructor
            priority: 1
        }
    ],`
    );
    
    fs.writeFileSync(configPath, newConfig);
    console.log('✅ Configuration updated');

    // 3. Commit and push
    console.log('3️⃣ Committing changes...');
    execSync('git add waitlist-config.js .github/workflows/waitlist-bot.yml', { stdio: 'inherit' });
    execSync(`git commit -m "🤖 Setup waitlist bot for ${className} at ${time} on ${day}"`, { stdio: 'inherit' });
    execSync('git push', { stdio: 'inherit' });

    console.log('🎉 Waitlist bot setup complete!');
    console.log(`📅 Monitoring: ${className} at ${time} on ${day}`);
    console.log('⏰ The bot will start monitoring on the next scheduled run (every 4 hours)');
    console.log('🔍 Check GitHub Actions to see when it starts running');

} catch (error) {
    console.error(`❌ Error: ${error.message}`);
    process.exit(1);
}
