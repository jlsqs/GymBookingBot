import fetch from 'node-fetch';
import AuthManager, { CONFIG } from './auth_manager.js';

// Get classes from a specific date
async function getClasses(auth, fromDate) {
    console.log(`Fetching classes from ${fromDate}...`);
    
    try {
        // Get valid token (will auto-refresh if needed)
        const token = await auth.getValidToken();
        
        const url = `${CONFIG.baseURL}/members/v2/user_accounts/${CONFIG.userAccountId}/bookings/slots?from=${fromDate}`;
        
        const response = await fetch(url, {
            method: 'GET',
            headers: auth.getHeaders()
        });

        console.log(`Response status: ${response.status} ${response.statusText}`);

        const data = await response.json();
        
        if (response.ok) {
            console.log(`\n✓ Successfully fetched classes!`);
            return data;
        } else {
            console.error('\n✗ API Error:', data);
            return null;
        }
    } catch (error) {
        console.error('\n✗ Request failed:', error.message);
        return null;
    }
}

// Display classes in a readable format
function displayClasses(data) {
    const classes = data.items || [];
    
    if (classes.length === 0) {
        console.log('No classes available for this date range.');
        return;
    }

    console.log('=== AVAILABLE CLASSES ===\n');
    console.log(`Date range: ${data.from} to ${data.to}`);
    console.log(`Total classes: ${classes.length}\n`);
    
    // Separate bookable and full classes
    const bookableClasses = classes.filter(c => c.bookable);
    const bookedClasses = classes.filter(c => c.status === 'booked');
    const fullClasses = classes.filter(c => c.status === 'full');
    
    console.log(`✅ Bookable: ${bookableClasses.length}`);
    console.log(`📅 Already booked by you: ${bookedClasses.length}`);
    console.log(`❌ Full: ${fullClasses.length}\n`);
    
    if (bookableClasses.length > 0) {
        console.log('=== BOOKABLE CLASSES ===\n');
        
        bookableClasses.forEach((cls, index) => {
            const name = cls.name || cls.activity?.name || 'Unknown Class';
            const date = new Date(cls.startDate).toLocaleDateString('fr-FR');
            const timeStart = new Date(cls.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const timeEnd = new Date(cls.endDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const instructor = cls.coach?.name || 'TBA';
            const location = cls.locationName || 'Unknown';
            const duration = Math.round(cls.duration / 60);
            const spots = `${cls.placesFree}/${cls.placesTotal}`;
            
            console.log(`${index + 1}. ${name.toUpperCase()}`);
            console.log(`   📅 ${date} | ${timeStart} - ${timeEnd} (${duration}min)`);
            console.log(`   👤 Instructor: ${instructor}`);
            console.log(`   📍 Location: ${location}`);
            console.log(`   🪑 Available spots: ${spots}`);
            console.log(`   🆔 ID: ${cls.id}`);
            console.log('');
        });
    }
    
    if (bookedClasses.length > 0) {
        console.log('\n=== YOUR BOOKED CLASSES ===\n');
        bookedClasses.forEach((cls, index) => {
            const name = cls.name || cls.activity?.name || 'Unknown Class';
            const date = new Date(cls.startDate).toLocaleDateString('fr-FR');
            const time = new Date(cls.startDate).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const instructor = cls.coach?.name || 'TBA';
            console.log(`${index + 1}. ${name} - ${date} at ${time} (${instructor})`);
        });
    }
    
    // Show class types summary
    const classTypes = {};
    classes.forEach(c => {
        const name = c.name || c.activity?.name || 'Unknown';
        classTypes[name] = (classTypes[name] || 0) + 1;
    });
    
    console.log('\n=== CLASS TYPES SUMMARY ===');
    Object.entries(classTypes)
        .sort((a, b) => b[1] - a[1])
        .forEach(([type, count]) => {
            console.log(`${type}: ${count} session(s)`);
        });
}

// Save to JSON file
async function saveToFile(data, fromDate) {
    try {
        const fs = await import('fs');
        const filename = `classes_${fromDate}.json`;
        fs.writeFileSync(filename, JSON.stringify(data, null, 2));
        console.log(`\n💾 Full response saved to ${filename}`);
    } catch (error) {
        console.error('Failed to save file:', error.message);
    }
}

// Main execution
async function main() {
    const today = new Date().toISOString().split('T')[0];
    const fromDate = process.argv[2] || today;
    
    console.log('=== GYM CLASS RETRIEVAL ===');
    console.log(`📅 Searching from: ${fromDate}\n`);
    
    // Initialize auth manager
    const auth = new AuthManager();
    
    // Check if we have tokens
    if (!auth.refreshToken) {
        console.error('⚠️  No saved tokens found!');
        console.error('\nPlease run the first-time setup:');
        console.error('1. Set FIRST_TIME_SETUP = true in auth_manager.js');
        console.error('2. Add your identity_request from mitmproxy');
        console.error('3. Run: node auth_manager.js');
        return;
    }
    
    // Get classes
    const data = await getClasses(auth, fromDate);
    
    if (data) {
        await saveToFile(data, fromDate);
        displayClasses(data);
    }
}

main().catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
});