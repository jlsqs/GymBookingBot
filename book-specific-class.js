#!/usr/bin/env node

import { getClasses, bookClass } from './api_client.js';

async function bookSpecificClass() {
    console.log('🎯 Booking Cross Training at 12:10 on Tuesday...\n');
    
    try {
        // Get classes for the next 7 days
        const classes = await getClasses(7);
        console.log(`📚 Found ${classes.length} classes\n`);
        
        // Find the specific cross training class at 12:10 on Tuesday
        const targetClass = classes.find(cls => {
            const date = new Date(cls.startDate || cls.startTime);
            const dayOfWeek = date.getDay(); // 2 = Tuesday
            const time = date.toTimeString().substring(0, 5);
            
            return cls.name.toLowerCase().includes('cross training') &&
                   dayOfWeek === 2 && // Tuesday
                   time === '12:10';
        });
        
        if (!targetClass) {
            console.log('❌ Cross training class at 12:10 on Tuesday not found');
            return;
        }
        
        console.log('✅ Found target class:');
        console.log(`   Name: ${targetClass.name}`);
        console.log(`   Time: ${new Date(targetClass.startDate || targetClass.startTime).toTimeString().substring(0, 5)}`);
        console.log(`   Date: ${new Date(targetClass.startDate || targetClass.startTime).toLocaleDateString()}`);
        console.log(`   Location: ${targetClass.locationName}`);
        console.log(`   Instructor: ${targetClass.coach?.name || 'TBA'}`);
        console.log(`   Available spots: ${targetClass.placesFree}/${targetClass.placesTotal}`);
        console.log(`   ID: ${targetClass.id}\n`);
        
        if (targetClass.placesFree === 0) {
            console.log('❌ Class is fully booked!');
            return;
        }
        
        if (!targetClass.bookable) {
            console.log('❌ Class is not bookable!');
            return;
        }
        
        console.log('🎯 Attempting to book...');
        const result = await bookClass(targetClass.id);
        
        if (result.success) {
            console.log('🎉 SUCCESS! Class booked successfully!');
            console.log(`📧 Booking ID: ${result.bookingId}`);
        } else {
            console.log(`❌ Booking failed: ${result.error}`);
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

bookSpecificClass();
