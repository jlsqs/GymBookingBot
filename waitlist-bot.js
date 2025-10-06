#!/usr/bin/env node

import AuthManager from './auth_manager.js';
import { getClasses } from './api_client.js';
import { bookClass } from './api_client.js';
import { WAITLIST_CONFIG, ConfigHelpers } from './waitlist-config.js';
import { NotificationService } from './notification-service.js';
import fs from 'fs';

class WaitlistBot {
    constructor() {
        // Check if we're running in GitHub Actions and create tokens.json from secrets
        if (process.env.GITHUB_ACTIONS && process.env.ACCESS_TOKEN) {
            this.createTokensFromSecrets();
        }
        
        this.authManager = new AuthManager();
        this.notificationService = new NotificationService();
        this.monitoring = new Map(); // Track classes being monitored
        this.isRunning = false;
        this.startTime = new Date();
        this.targetClasses = [...WAITLIST_CONFIG.TARGET_CLASSES];
        this.bookingAttempts = new Map(); // Track booking attempts per class
    }

    createTokensFromSecrets() {
        const tokens = {
            accessToken: process.env.ACCESS_TOKEN,
            refreshToken: process.env.REFRESH_TOKEN,
            tokenExpiry: parseInt(process.env.TOKEN_EXPIRY) || Date.now() + 3600000
        };
        
        fs.writeFileSync('tokens.json', JSON.stringify(tokens, null, 2));
        this.log('📝 Created tokens.json from GitHub Secrets');
    }

    log(message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    }

    getMonitoringInterval() {
        return ConfigHelpers.getMonitoringInterval();
    }

    async findTargetClass(targetClass, classes) {
        return classes.find(cls => {
            const classDate = new Date(cls.startDate || cls.startTime);
            const dayOfWeek = classDate.getDay();
            const time = classDate.toTimeString().substring(0, 5);
            
            const isMatch = cls.name.toLowerCase().includes(targetClass.name.toLowerCase()) &&
                   dayOfWeek === targetClass.dayOfWeek &&
                   time === targetClass.time &&
                   (targetClass.location && targetClass.location !== null ? cls.locationName.includes(targetClass.location) : true) &&
                   (targetClass.instructor && targetClass.instructor !== 'TBA' ? 
                    cls.coach?.name?.trim() === targetClass.instructor.trim() : true);
            
            if (isMatch) {
                this.log(`   ✅ MATCH FOUND: ${cls.name} at ${time} (day ${dayOfWeek}) - ${cls.placesFree}/${cls.placesTotal} spots`);
            } else {
                this.log(`   Checking: ${cls.name} at ${time} (day ${dayOfWeek}) vs target ${targetClass.name} at ${targetClass.time} (day ${targetClass.dayOfWeek})`);
            }
            
            return isMatch;
        });
    }

    async checkClassAvailability(targetClass) {
        try {
            this.log(`🔍 Checking availability for ${targetClass.name} at ${targetClass.time}`);
            
            // Get classes for the next 7 days
            const classes = await getClasses(7);
            const foundClass = await this.findTargetClass(targetClass, classes);
            
            if (!foundClass) {
                this.log(`❌ Class not found: ${targetClass.name} at ${targetClass.time}`);
                return null;
            }

            const availability = {
                id: foundClass.id,
                name: foundClass.name,
                date: foundClass.startTime,
                time: new Date(foundClass.startTime).toTimeString().substring(0, 5),
                location: foundClass.locationName,
                instructor: foundClass.coach?.name || 'TBA',
                placesFree: foundClass.placesFree,
                placesTotal: foundClass.placesTotal,
                isBookable: foundClass.placesFree > 0,
                isFullyBooked: foundClass.placesFree === 0
            };

            this.log(`📊 ${availability.name} - ${availability.placesFree}/${availability.placesTotal} spots available`);
            
            return availability;
        } catch (error) {
            this.log(`❌ Error checking class availability: ${error.message}`);
            return null;
        }
    }

    async attemptBooking(classInfo) {
        try {
            const classKey = `${classInfo.name}-${classInfo.time}`;
            const attempts = this.bookingAttempts.get(classKey) || 0;
            
            // Check if we've exceeded max attempts
            if (attempts >= WAITLIST_CONFIG.MAX_ATTEMPTS_PER_CLASS) {
                this.log(`❌ Max booking attempts (${WAITLIST_CONFIG.MAX_ATTEMPTS_PER_CLASS}) reached for ${classInfo.name}`);
                return false;
            }
            
            this.log(`🎯 Attempting to book: ${classInfo.name} at ${classInfo.time} (attempt ${attempts + 1})`);
            
            const result = await bookClass(classInfo.id);
            
            if (result.success) {
                this.log(`✅ SUCCESS! Booked ${classInfo.name} at ${classInfo.time}`);
                this.log(`📧 Booking confirmation: ${result.bookingId}`);
                
                // Send success notification
                await this.notificationService.notifyBookingSuccess(classInfo, result.bookingId);
                
                // Remove from target classes
                this.removeTargetClass(classInfo);
                
                return true;
            } else {
                this.log(`❌ Booking failed: ${result.error}`);
                this.bookingAttempts.set(classKey, attempts + 1);
                
                // Wait before retry if configured
                if (WAITLIST_CONFIG.ADVANCED.retryFailedBookings && attempts < WAITLIST_CONFIG.ADVANCED.maxRetries) {
                    this.log(`⏰ Waiting ${WAITLIST_CONFIG.ADVANCED.retryDelay/1000}s before retry...`);
                    await new Promise(resolve => setTimeout(resolve, WAITLIST_CONFIG.ADVANCED.retryDelay));
                }
                
                return false;
            }
        } catch (error) {
            this.log(`❌ Booking error: ${error.message}`);
            await this.notificationService.notifyError(error, `Booking attempt for ${classInfo.name}`);
            return false;
        }
    }

    removeTargetClass(classInfo) {
        const index = this.targetClasses.findIndex(cls => 
            cls.name === classInfo.name && 
            cls.time === classInfo.time && 
            cls.dayOfWeek === new Date(classInfo.date).getDay()
        );
        
        if (index > -1) {
            this.targetClasses.splice(index, 1);
            this.log(`🗑️ Removed ${classInfo.name} from monitoring list`);
        }
    }

    async startMonitoring() {
        this.log('🚀 Starting Waitlist Bot...');
        this.log(`📋 Monitoring ${this.targetClasses.length} target classes`);
        
        // Send start notification
        await this.notificationService.notifyMonitoringStarted(this.targetClasses);
        
        this.isRunning = true;
        this.startTime = new Date();
        
        while (this.isRunning) {
            try {
                // Check if we've been running too long
                const daysRunning = (new Date() - this.startTime) / (1000 * 60 * 60 * 24);
                if (daysRunning > WAITLIST_CONFIG.MAX_MONITORING_DAYS) {
                    this.log(`⏰ Stopping monitoring after ${WAITLIST_CONFIG.MAX_MONITORING_DAYS} days`);
                    await this.notificationService.notifyMonitoringStopped(`Maximum monitoring time (${WAITLIST_CONFIG.MAX_MONITORING_DAYS} days) reached`);
                    break;
                }

                this.log('🔍 Checking all target classes...');
                
                // Sort classes by priority
                const sortedClasses = ConfigHelpers.getTargetClassesByPriority();
                
                for (const targetClass of sortedClasses) {
                    const classInfo = await this.checkClassAvailability(targetClass);
                    
                    if (classInfo) {
                        if (classInfo.isBookable) {
                            this.log(`🎯 SPOT AVAILABLE! Attempting to book ${classInfo.name}`);
                            
                            // Send spot available notification
                            await this.notificationService.notifySpotAvailable(classInfo);
                            
                            const booked = await this.attemptBooking(classInfo);
                            
                            if (booked) {
                                this.log('🎉 Booking successful! Stopping monitoring for this class.');
                                
                                // Check if we should stop after first booking
                                if (WAITLIST_CONFIG.ADVANCED.stopAfterFirstBooking) {
                                    this.log('🛑 Stopping monitoring after first successful booking.');
                                    await this.notificationService.notifyMonitoringStopped('First successful booking completed');
                                    return;
                                }
                            }
                        } else if (classInfo.isFullyBooked) {
                            this.log(`⏳ ${classInfo.name} is fully booked, continuing to monitor...`);
                        }
                    }
                    
                    // Small delay between class checks
                    await new Promise(resolve => setTimeout(resolve, WAITLIST_CONFIG.DELAY_BETWEEN_CLASSES));
                }

                // Check if we have any classes left to monitor
                if (this.targetClasses.length === 0) {
                    this.log('🎉 All target classes have been booked! Stopping monitoring.');
                    await this.notificationService.notifyMonitoringStopped('All target classes have been booked');
                    break;
                }

                // Wait before next check
                const interval = this.getMonitoringInterval();
                this.log(`⏰ Waiting ${interval/1000} seconds before next check...`);
                await new Promise(resolve => setTimeout(resolve, interval));
                
            } catch (error) {
                this.log(`❌ Error in monitoring loop: ${error.message}`);
                await this.notificationService.notifyError(error, 'Monitoring loop error');
                this.log('⏰ Waiting 5 minutes before retrying...');
                await new Promise(resolve => setTimeout(resolve, 5 * 60 * 1000));
            }
        }
        
        this.log('🛑 Waitlist Bot stopped.');
    }

    stop() {
        this.log('🛑 Stopping Waitlist Bot...');
        this.isRunning = false;
    }
}

// Main execution
async function main() {
    const bot = new WaitlistBot();
    
    // Handle graceful shutdown
    process.on('SIGINT', () => {
        console.log('\n🛑 Received SIGINT, stopping gracefully...');
        bot.stop();
        process.exit(0);
    });
    
    process.on('SIGTERM', () => {
        console.log('\n🛑 Received SIGTERM, stopping gracefully...');
        bot.stop();
        process.exit(0);
    });
    
    try {
        await bot.startMonitoring();
    } catch (error) {
        console.error('❌ Fatal error:', error);
        process.exit(1);
    }
}

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main();
}

export { WaitlistBot };
