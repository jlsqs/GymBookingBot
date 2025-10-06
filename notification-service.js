import { WAITLIST_CONFIG, ConfigHelpers } from './waitlist-config.js';

class NotificationService {
    constructor() {
        this.config = WAITLIST_CONFIG.NOTIFICATIONS;
    }

    log(message) {
        const timestamp = new Date().toISOString();
        console.log(`[${timestamp}] ${message}`);
    }

    async sendNotification(type, title, message, data = {}) {
        const notifications = [];
        
        // Console notification (always enabled)
        notifications.push(this.sendConsoleNotification(type, title, message, data));
        
        // Email notification
        if (ConfigHelpers.isNotificationEnabled('email')) {
            notifications.push(this.sendEmailNotification(type, title, message, data));
        }
        
        // Discord notification
        if (ConfigHelpers.isNotificationEnabled('discord')) {
            notifications.push(this.sendDiscordNotification(type, title, message, data));
        }
        
        // SMS notification
        if (ConfigHelpers.isNotificationEnabled('sms')) {
            notifications.push(this.sendSMSNotification(type, title, message, data));
        }
        
        // Send all notifications
        const results = await Promise.allSettled(notifications);
        
        // Log any failures
        results.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.log(`❌ Notification ${index} failed: ${result.reason}`);
            }
        });
    }

    async sendConsoleNotification(type, title, message, data) {
        const emoji = this.getEmojiForType(type);
        this.log(`${emoji} ${title}: ${message}`);
        
        if (data.classInfo) {
            this.log(`   📅 Class: ${data.classInfo.name} at ${data.classInfo.time}`);
            this.log(`   📍 Location: ${data.classInfo.location}`);
            this.log(`   👨‍🏫 Instructor: ${data.classInfo.instructor}`);
        }
        
        if (data.bookingId) {
            this.log(`   🎫 Booking ID: ${data.bookingId}`);
        }
    }

    async sendEmailNotification(type, title, message, data) {
        try {
            // This is a placeholder - you'll need to implement actual email sending
            // Using nodemailer or similar library
            this.log(`📧 Email notification: ${title} - ${message}`);
            
            // Example implementation with nodemailer:
            /*
            const nodemailer = require('nodemailer');
            
            const transporter = nodemailer.createTransporter({
                service: this.config.emailConfig.service,
                auth: {
                    user: this.config.emailConfig.user,
                    pass: this.config.emailConfig.pass
                }
            });
            
            const mailOptions = {
                from: this.config.emailConfig.user,
                to: this.config.email,
                subject: `Gym Booking Bot - ${title}`,
                html: this.formatEmailHTML(type, title, message, data)
            };
            
            await transporter.sendMail(mailOptions);
            */
            
        } catch (error) {
            this.log(`❌ Email notification failed: ${error.message}`);
            throw error;
        }
    }

    async sendDiscordNotification(type, title, message, data) {
        try {
            if (!this.config.discordWebhook) {
                this.log('❌ Discord webhook URL not configured');
                return;
            }
            
            const embed = {
                title: `Gym Booking Bot - ${title}`,
                description: message,
                color: this.getColorForType(type),
                timestamp: new Date().toISOString(),
                fields: []
            };
            
            if (data.classInfo) {
                embed.fields.push(
                    { name: 'Class', value: data.classInfo.name, inline: true },
                    { name: 'Time', value: data.classInfo.time, inline: true },
                    { name: 'Location', value: data.classInfo.location, inline: true },
                    { name: 'Instructor', value: data.classInfo.instructor, inline: true }
                );
            }
            
            if (data.bookingId) {
                embed.fields.push({ name: 'Booking ID', value: data.bookingId, inline: false });
            }
            
            const payload = {
                embeds: [embed]
            };
            
            const response = await fetch(this.config.discordWebhook, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(payload)
            });
            
            if (!response.ok) {
                throw new Error(`Discord webhook failed: ${response.status}`);
            }
            
            this.log(`📱 Discord notification sent: ${title}`);
            
        } catch (error) {
            this.log(`❌ Discord notification failed: ${error.message}`);
            throw error;
        }
    }

    async sendSMSNotification(type, title, message, data) {
        try {
            // This is a placeholder - you'll need to implement actual SMS sending
            // Using Twilio or similar service
            this.log(`📱 SMS notification: ${title} - ${message}`);
            
            // Example implementation with Twilio:
            /*
            const twilio = require('twilio');
            
            const client = twilio(
                this.config.smsConfig.accountSid,
                this.config.smsConfig.authToken
            );
            
            const smsMessage = `${title}: ${message}`;
            if (data.classInfo) {
                smsMessage += `\nClass: ${data.classInfo.name} at ${data.classInfo.time}`;
            }
            
            await client.messages.create({
                body: smsMessage,
                from: this.config.smsConfig.fromNumber,
                to: this.config.smsConfig.toNumber
            });
            */
            
        } catch (error) {
            this.log(`❌ SMS notification failed: ${error.message}`);
            throw error;
        }
    }

    getEmojiForType(type) {
        const emojis = {
            'success': '✅',
            'error': '❌',
            'warning': '⚠️',
            'info': 'ℹ️',
            'booking': '🎯',
            'monitoring': '🔍',
            'spot_available': '🎉',
            'fully_booked': '⏳'
        };
        return emojis[type] || '📢';
    }

    getColorForType(type) {
        const colors = {
            'success': 0x00ff00, // Green
            'error': 0xff0000,   // Red
            'warning': 0xffaa00, // Orange
            'info': 0x0099ff,    // Blue
            'booking': 0xff6b6b, // Pink
            'monitoring': 0x4ecdc4, // Teal
            'spot_available': 0x45b7d1, // Light blue
            'fully_booked': 0x96ceb4  // Light green
        };
        return colors[type] || 0x95a5a6; // Gray
    }

    formatEmailHTML(type, title, message, data) {
        const color = this.getColorForType(type);
        const emoji = this.getEmojiForType(type);
        
        return `
        <!DOCTYPE html>
        <html>
        <head>
            <style>
                body { font-family: Arial, sans-serif; margin: 20px; }
                .header { background-color: #${color.toString(16).padStart(6, '0')}; color: white; padding: 20px; border-radius: 5px; }
                .content { margin: 20px 0; }
                .class-info { background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin: 10px 0; }
                .footer { color: #666; font-size: 12px; margin-top: 20px; }
            </style>
        </head>
        <body>
            <div class="header">
                <h2>${emoji} ${title}</h2>
            </div>
            <div class="content">
                <p>${message}</p>
                ${data.classInfo ? `
                <div class="class-info">
                    <h3>Class Details:</h3>
                    <p><strong>Name:</strong> ${data.classInfo.name}</p>
                    <p><strong>Time:</strong> ${data.classInfo.time}</p>
                    <p><strong>Location:</strong> ${data.classInfo.location}</p>
                    <p><strong>Instructor:</strong> ${data.classInfo.instructor}</p>
                </div>
                ` : ''}
                ${data.bookingId ? `<p><strong>Booking ID:</strong> ${data.bookingId}</p>` : ''}
            </div>
            <div class="footer">
                <p>Sent by Gym Booking Bot at ${new Date().toLocaleString()}</p>
            </div>
        </body>
        </html>
        `;
    }

    // Convenience methods for common notifications
    async notifyBookingSuccess(classInfo, bookingId) {
        await this.sendNotification('success', 'Booking Successful!', 
            `Successfully booked ${classInfo.name} at ${classInfo.time}`, 
            { classInfo, bookingId });
    }

    async notifySpotAvailable(classInfo) {
        await this.sendNotification('spot_available', 'Spot Available!', 
            `A spot opened up for ${classInfo.name} at ${classInfo.time}`, 
            { classInfo });
    }

    async notifyMonitoringStarted(targetClasses) {
        await this.sendNotification('monitoring', 'Monitoring Started', 
            `Started monitoring ${targetClasses.length} classes for availability`, 
            { targetClasses });
    }

    async notifyMonitoringStopped(reason) {
        await this.sendNotification('info', 'Monitoring Stopped', 
            `Waitlist monitoring stopped: ${reason}`);
    }

    async notifyError(error, context) {
        await this.sendNotification('error', 'Bot Error', 
            `An error occurred: ${error.message}`, 
            { context, error: error.stack });
    }
}

export { NotificationService };
