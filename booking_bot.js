import fetch from 'node-fetch';
import AuthManager, { CONFIG } from './auth_manager.js';

// Class preferences by weekday (same as your Puppeteer bot)
const CLASS_TIMES = {
    1: "07:30", // Monday
    2: "11:00", // Tuesday
    3: "07:30", // Wednesday
    4: "08:35", // Thursday
    5: "13:00"  // Friday
};

const PREFERRED_CLASSES = ["hard training", "bootcamp", "cross training"];
const DAYS_IN_ADVANCE = 5; // Book 5 days ahead
const TEST_MODE = process.argv.includes('--test'); // Add --test flag to skip waiting

function log(message) {
    const timestamp = new Date().toISOString();
    console.log(`[${timestamp}] ${message}`);
}

// Get classes for a specific date
async function getClasses(auth, date) {
    try {
        const token = await auth.getValidToken();
        const dateStr = date.toISOString().split('T')[0];
        
        const url = `${CONFIG.baseURL}/members/v2/user_accounts/${CONFIG.userAccountId}/bookings/slots?from=${dateStr}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: auth.getHeaders()
        });

        if (response.ok) {
            return await response.json();
        } else {
            log(`❌ Failed to get classes: ${response.status}`);
            return null;
        }
    } catch (error) {
        log(`❌ Error fetching classes: ${error.message}`);
        return null;
    }
}

// Book a specific class
async function bookClass(auth, classId) {
    try {
        const token = await auth.getValidToken();
        
        const url = `${CONFIG.baseURL}/members/v2/user_accounts/${CONFIG.userAccountId}/bookings/slots/${classId}/book`;
        
        log(`Attempting to book class ${classId}...`);
        
        const response = await fetch(url, {
            method: 'POST',
            headers: auth.getHeaders()
        });

        const data = await response.json();
        
        if (response.ok) {
            log('✅ Booking successful!');
            return { success: true, data };
        } else {
            log(`❌ Booking failed: ${JSON.stringify(data)}`);
            return { success: false, error: data };
        }
    } catch (error) {
        log(`❌ Error booking class: ${error.message}`);
        return { success: false, error: error.message };
    }
}

// Wait until specific time to book
async function waitUntilBookingTime(targetTime) {
    const now = new Date();
    const timeToWait = targetTime - now;
    
    // Skip checks in test mode
    if (TEST_MODE) {
        return true;
    }
    
    // If more than 5 minutes late, don't book
    if (timeToWait < -300000) {
        log('❌ Too late to book: more than 5 minutes after opening time');
        return false;
    }
    
    if (timeToWait > 0) {
        log(`⏳ Waiting ${Math.floor(timeToWait / 1000)} seconds until booking time...`);
        await new Promise(resolve => setTimeout(resolve, timeToWait));
    } else {
        log('⚠️  Booking time has passed, attempting immediately...');
    }
    
    return true;
}

// Main booking logic
async function findAndBookClass(auth) {
    try {
        // Calculate target date (5 days from now)
        const targetDate = new Date();
        targetDate.setDate(targetDate.getDate() + DAYS_IN_ADVANCE);
        const targetWeekday = targetDate.getDay();
        const targetDateStr = targetDate.toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        });

        log(`🎯 Looking for a class on ${targetDateStr} (${['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][targetWeekday]})`);
        
        // Get target class time for this weekday
        const targetClassTime = CLASS_TIMES[targetWeekday];
        if (!targetClassTime) {
            log('ℹ️  No classes scheduled for this weekday (weekend)');
            log('   Bot only runs Monday-Friday');
            return;
        }
        
        log(`🕐 Target time: ${targetClassTime}`);
        log(`📋 Preferred classes: ${PREFERRED_CLASSES.join(', ')}`);

        // Fetch classes
        const classesData = await getClasses(auth, targetDate);
        if (!classesData || !classesData.items) {
            throw new Error('Failed to fetch classes');
        }

        log(`📚 Found ${classesData.items.length} total classes`);

        // Filter classes matching our criteria
        const targetClasses = classesData.items.filter(cls => {
            const classDate = new Date(cls.startDate);
            const classTime = classDate.toLocaleTimeString('fr-FR', { 
                hour: '2-digit', 
                minute: '2-digit' 
            });
            const className = (cls.name || cls.activity?.name || '').toLowerCase();
            
            // Check if it matches our criteria
            const matchesTime = classTime === targetClassTime;
            const matchesName = PREFERRED_CLASSES.some(preferred => 
                className.includes(preferred.toLowerCase())
            );
            const isBookable = cls.bookable;
            
            if (matchesTime && matchesName) {
                log(`   Found: ${cls.name} at ${classTime} - ${isBookable ? 'BOOKABLE' : 'FULL/BOOKED'}`);
            }
            
            return matchesTime && matchesName && isBookable;
        });

        if (targetClasses.length === 0) {
            log('❌ No matching bookable classes found');
            log('Possible reasons:');
            log('  - Class is full');
            log('  - Class is already booked');
            log('  - No class at that time');
            log('  - Class name doesn\'t match preferences');
            return;
        }

        // Take the first matching class
        const targetClass = targetClasses[0];
        const classDate = new Date(targetClass.startDate);
        
        log(`\n✨ Target class found:`);
        log(`   Name: ${targetClass.name}`);
        log(`   Date: ${classDate.toLocaleDateString('fr-FR')}`);
        log(`   Time: ${classDate.toLocaleTimeString('fr-FR')}`);
        log(`   Instructor: ${targetClass.coach?.name || 'TBA'}`);
        log(`   Location: ${targetClass.locationName}`);
        log(`   Available spots: ${targetClass.placesFree}/${targetClass.placesTotal}`);
        log(`   ID: ${targetClass.id}\n`);

        // Calculate booking time: TODAY at the same time as the class + 3 seconds
        // (Booking opens 5 days before the class, which is TODAY)
        // Convert to UTC for consistent timing
        const now = new Date();
        const classTimeUTC = new Date(classDate);
        
        // Get the time components from the class (which is in France time)
        const classHour = classTimeUTC.getHours();
        const classMinute = classTimeUTC.getMinutes();
        
        // Create booking time in UTC (France time - 2 hours)
        const bookingTime = new Date(now);
        bookingTime.setUTCHours(classHour - 2, classMinute, 3, 0); // Convert France time to UTC
        
        log(`🕐 Booking opens at: ${bookingTime.toLocaleString('fr-FR')} (France time)`);
        log(`🕐 Booking opens at: ${bookingTime.toISOString()} (UTC)`);
        
        // Wait until booking time (unless in test mode)
        if (TEST_MODE) {
            log('🧪 TEST MODE: Skipping wait, booking immediately...');
        } else {
            const shouldProceed = await waitUntilBookingTime(bookingTime);
            if (!shouldProceed) {
                return;
            }
        }

        // Attempt booking with retries (up to 3 attempts like Puppeteer bot)
        let bookingSuccess = false;
        const maxRetries = 3;
        
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            log(`\n📝 Booking attempt ${attempt}/${maxRetries}...`);
            
            const result = await bookClass(auth, targetClass.id);
            
            if (result.success) {
                bookingSuccess = true;
                log('\n🎉 CLASS SUCCESSFULLY BOOKED!');
                log(`   ${targetClass.name}`);
                log(`   ${classDate.toLocaleDateString('fr-FR')} at ${classDate.toLocaleTimeString('fr-FR')}`);
                break;
            } else {
                log(`❌ Attempt ${attempt} failed`);
                if (attempt < maxRetries) {
                    log('   Retrying in 1 second...');
                    await new Promise(resolve => setTimeout(resolve, 1000));
                }
            }
        }

        if (!bookingSuccess) {
            log('\n❌ Failed to book class after all attempts');
        }

    } catch (error) {
        log(`❌ Error: ${error.message}`);
        throw error;
    }
}

// Main function
async function main() {
    log('=== GYM CLASS BOOKING BOT ===\n');
    
    const auth = new AuthManager();
    
    // Check if we have tokens
    if (!auth.refreshToken) {
        log('❌ No saved tokens found!');
        log('Please run first-time setup with auth_manager.js');
        return;
    }

    try {
        await findAndBookClass(auth);
    } catch (error) {
        log(`\n❌ Fatal error: ${error.message}`);
        process.exit(1);
    }
}

// Run the script
main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});