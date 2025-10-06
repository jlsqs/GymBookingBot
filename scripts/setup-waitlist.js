#!/usr/bin/env node

import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const projectRoot = join(__dirname, '..');

console.log('🎯 Waitlist Bot Setup');
console.log('====================\n');

// Check if waitlist-config.js exists
const configPath = join(projectRoot, 'waitlist-config.js');
if (!fs.existsSync(configPath)) {
    console.log('❌ waitlist-config.js not found!');
    console.log('   Please make sure you have the waitlist bot files.');
    process.exit(1);
}

// Display current configuration
console.log('📋 Current Target Classes:');
console.log('-------------------------');

try {
    const { WAITLIST_CONFIG } = await import(configPath);
    
    WAITLIST_CONFIG.TARGET_CLASSES.forEach((cls, index) => {
        console.log(`${index + 1}. ${cls.name}`);
        console.log(`   Time: ${cls.time}`);
        console.log(`   Day: ${['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][cls.dayOfWeek]}`);
        console.log(`   Location: ${cls.location}`);
        console.log(`   Instructor: ${cls.instructor}`);
        console.log(`   Priority: ${cls.priority || 1}`);
        console.log('');
    });
    
    console.log('⚙️  Monitoring Settings:');
    console.log('------------------------');
    console.log(`Peak hours interval: ${WAITLIST_CONFIG.MONITORING_INTERVALS.PEAK_HOURS / 1000}s`);
    console.log(`Normal hours interval: ${WAITLIST_CONFIG.MONITORING_INTERVALS.NORMAL_HOURS / 1000}s`);
    console.log(`Off-peak interval: ${WAITLIST_CONFIG.MONITORING_INTERVALS.OFF_PEAK / 1000}s`);
    console.log(`Night hours interval: ${WAITLIST_CONFIG.MONITORING_INTERVALS.NIGHT_HOURS / 1000}s`);
    console.log(`Max monitoring days: ${WAITLIST_CONFIG.MAX_MONITORING_DAYS}`);
    console.log('');
    
    console.log('🔔 Notification Settings:');
    console.log('-------------------------');
    console.log(`Enabled: ${WAITLIST_CONFIG.NOTIFICATIONS.enabled}`);
    console.log(`Methods: ${WAITLIST_CONFIG.NOTIFICATIONS.methods.join(', ')}`);
    console.log(`Email: ${WAITLIST_CONFIG.NOTIFICATIONS.email}`);
    console.log('');
    
    console.log('📝 How to customize:');
    console.log('-------------------');
    console.log('1. Edit waitlist-config.js to modify target classes');
    console.log('2. Set environment variables for notifications:');
    console.log('   - NOTIFICATION_EMAIL=your-email@example.com');
    console.log('   - DISCORD_WEBHOOK_URL=your-discord-webhook-url');
    console.log('   - EMAIL_USER=your-email@gmail.com');
    console.log('   - EMAIL_PASS=your-app-password');
    console.log('');
    
    console.log('🚀 How to run:');
    console.log('-------------');
    console.log('1. Start monitoring: npm run waitlist');
    console.log('2. Test with specific class: npm run waitlist-test');
    console.log('3. Stop monitoring: Ctrl+C');
    console.log('');
    
    console.log('📊 Monitoring will:');
    console.log('------------------');
    console.log('• Check for available spots every 2-30 minutes (depending on time)');
    console.log('• Attempt to book immediately when a spot opens');
    console.log('• Send notifications for successful bookings');
    console.log('• Stop after 7 days or when all classes are booked');
    console.log('• Retry failed bookings up to 3 times');
    
} catch (error) {
    console.log('❌ Error reading configuration:', error.message);
    process.exit(1);
}
