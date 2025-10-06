import fetch from 'node-fetch';
import AuthManager from './auth_manager.js';
import { CONFIG } from './auth_manager.js';

// API client functions extracted from booking_bot.js
// This provides a clean interface for the waitlist bot

export async function getClasses(daysInAdvance = 7) {
    const auth = new AuthManager();
    await auth.getValidToken();
    
    const today = new Date();
    const endDate = new Date(today);
    endDate.setDate(today.getDate() + daysInAdvance);
    
    const startDateStr = today.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    const url = `${CONFIG.baseURL}/members/v2/user_accounts/${CONFIG.userAccountId}/bookings/slots?from=${startDateStr}`;
    
    const response = await fetch(url, {
        headers: {
            ...auth.getHeaders()
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch classes: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.items || [];
}

export async function bookClass(classId) {
    const auth = new AuthManager();
    await auth.getValidToken();
    
    const url = `${CONFIG.baseURL}/members/v2/user_accounts/${CONFIG.userAccountId}/bookings/slots/${classId}/book`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            ...auth.getHeaders()
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
            success: false,
            error: errorData.message || `Booking failed: ${response.status} ${response.statusText}`
        };
    }
    
    const data = await response.json();
    return {
        success: true,
        bookingId: data.bookingId || data.id || 'unknown',
        data: data
    };
}

export async function cancelBooking(bookingId) {
    const auth = new AuthManager();
    await auth.getValidToken();
    
    const url = `${CONFIG.baseURL}/members/v2/user_accounts/${CONFIG.userAccountId}/bookings/${bookingId}/cancel`;
    
    const response = await fetch(url, {
        method: 'POST',
        headers: {
            ...auth.getHeaders()
        }
    });
    
    if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        return {
            success: false,
            error: errorData.message || `Cancellation failed: ${response.status} ${response.statusText}`
        };
    }
    
    return {
        success: true,
        data: await response.json()
    };
}

export async function getMyBookings() {
    const auth = new AuthManager();
    await auth.getValidToken();
    
    const url = `${CONFIG.baseURL}/members/v2/user_accounts/${CONFIG.userAccountId}/bookings`;
    
    const response = await fetch(url, {
        headers: {
            ...auth.getHeaders()
        }
    });
    
    if (!response.ok) {
        throw new Error(`Failed to fetch bookings: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json();
    return data.bookings || [];
}
