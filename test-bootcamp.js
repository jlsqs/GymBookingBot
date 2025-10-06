#!/usr/bin/env node

import { getClasses } from './api_client.js';

async function testBootcamp() {
    console.log('🔍 Testing bootcamp class detection...\n');
    
    try {
        const classes = await getClasses(7);
        console.log(`📚 Found ${classes.length} classes\n`);
        
        // Find bootcamp classes at 07:30 on Wednesday
        const bootcampClasses = classes.filter(cls => {
            const date = new Date(cls.startDate || cls.startTime);
            const dayOfWeek = date.getDay();
            const time = date.toTimeString().substring(0, 5);
            
            return cls.name.toLowerCase().includes('bootcamp') &&
                   dayOfWeek === 3 && // Wednesday
                   time === '07:30';
        });
        
        console.log(`🎯 Found ${bootcampClasses.length} bootcamp classes at 07:30 on Wednesday:\n`);
        
        bootcampClasses.forEach((cls, index) => {
            console.log(`${index + 1}. ${cls.name}`);
            console.log(`   Time: ${new Date(cls.startDate || cls.startTime).toTimeString().substring(0, 5)}`);
            console.log(`   Date: ${new Date(cls.startDate || cls.startTime).toLocaleDateString()}`);
            console.log(`   Location: ${cls.locationName}`);
            console.log(`   Instructor: "${cls.coach?.name || 'TBA'}"`);
            console.log(`   Available spots: ${cls.placesFree}/${cls.placesTotal}`);
            console.log(`   Bookable: ${cls.bookable}`);
            console.log(`   ID: ${cls.id}\n`);
        });
        
        if (bootcampClasses.length === 0) {
            console.log('❌ No bootcamp classes found at 07:30 on Wednesday');
            
            // Show all bootcamp classes for debugging
            const allBootcamps = classes.filter(cls => 
                cls.name.toLowerCase().includes('bootcamp')
            );
            
            console.log('\n🔍 All bootcamp classes found:');
            allBootcamps.forEach((cls, index) => {
                const date = new Date(cls.startDate || cls.startTime);
                const dayOfWeek = date.getDay();
                const time = date.toTimeString().substring(0, 5);
                const dayName = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'][dayOfWeek];
                
                console.log(`${index + 1}. ${cls.name} at ${time} on ${dayName} (${cls.placesFree}/${cls.placesTotal}) - ${cls.coach?.name || 'TBA'}`);
            });
        }
        
    } catch (error) {
        console.error('❌ Error:', error.message);
    }
}

testBootcamp();
