#!/usr/bin/env node

import { getClasses } from './api_client.js';

async function testClasses() {
    console.log('🔍 Testing class availability...\n');
    
    try {
        const classes = await getClasses(7);
        console.log(`📚 Found ${classes.length} classes in the next 7 days\n`);
        
        // Group by day
        const classesByDay = {};
        classes.forEach(cls => {
            const date = new Date(cls.startDate || cls.startTime);
            const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
            const time = date.toTimeString().substring(0, 5);
            
            if (!classesByDay[dayName]) {
                classesByDay[dayName] = [];
            }
            
            classesByDay[dayName].push({
                name: cls.name,
                time: time,
                location: cls.locationName,
                instructor: cls.coach?.name || 'TBA',
                placesFree: cls.placesFree,
                placesTotal: cls.placesTotal,
                isBookable: cls.placesFree > 0
            });
        });
        
        // Display classes by day
        Object.keys(classesByDay).sort().forEach(day => {
            console.log(`📅 ${day}:`);
            classesByDay[day].forEach(cls => {
                const status = cls.isBookable ? '✅' : '❌';
                console.log(`   ${status} ${cls.name} at ${cls.time} (${cls.placesFree}/${cls.placesTotal}) - ${cls.instructor}`);
            });
            console.log('');
        });
        
        // Show some sample class data
        if (classes.length > 0) {
            console.log('📋 Sample class data:');
            console.log(JSON.stringify(classes[0], null, 2));
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testClasses();
