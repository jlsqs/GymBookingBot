import fetch from 'node-fetch';
import fs from 'fs';

const CONFIG = {
    baseURL: 'https://api.xplor-active.com',
    clientId: '8kTC2WKnd3ZrjXt8gD1GZyN78uWAPFgN',
    clientSecret: '8QLHnxvAlKaX85KVy42REI9tyBSnqxrBSTewt4bmQATWyNxmcxQo0nElQOMAm1994zNcIggBefqawdXq5qMbh7rmcRVozli12IV0ebWVenenQBYDYW9HPtZqPz841OBc',
    deviceId: '9C329D35-7479-4979-A38A-D6DA27DC4074',
    userAccountId: '3d48d22c-4e09-430e-a4d0-d65d58a5bd0d',
    tokenFile: './tokens.json' // Store tokens locally
};

class AuthManager {
    constructor() {
        this.accessToken = null;
        this.refreshToken = null;
        this.tokenExpiry = null;
        this.loadTokens();
    }

    // Load tokens from file if they exist
    loadTokens() {
        try {
            if (fs.existsSync(CONFIG.tokenFile)) {
                const data = JSON.parse(fs.readFileSync(CONFIG.tokenFile, 'utf8'));
                this.accessToken = data.accessToken;
                this.refreshToken = data.refreshToken;
                this.tokenExpiry = data.tokenExpiry;
                console.log('Loaded tokens from file');
            }
        } catch (error) {
            console.log('No saved tokens found');
        }
    }

    // Save tokens to file
    saveTokens() {
        const data = {
            accessToken: this.accessToken,
            refreshToken: this.refreshToken,
            tokenExpiry: this.tokenExpiry
        };
        fs.writeFileSync(CONFIG.tokenFile, JSON.stringify(data, null, 2));
        console.log('Tokens saved to file');
    }

    // Parse JWT to get expiry time
    parseJWT(token) {
        try {
            const base64Url = token.split('.')[1];
            const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
            const jsonPayload = decodeURIComponent(
                Buffer.from(base64, 'base64')
                    .toString('ascii')
                    .split('')
                    .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
                    .join('')
            );
            return JSON.parse(jsonPayload);
        } catch (error) {
            console.error('Failed to parse JWT:', error.message);
            return null;
        }
    }

    // Check if token is expired or about to expire (within 1 minute)
    isTokenExpired() {
        if (!this.tokenExpiry) return true;
        const now = Math.floor(Date.now() / 1000);
        return now >= (this.tokenExpiry - 60); // Refresh 1 minute before expiry
    }

    // Initial authentication with identity_request
    async authenticate(email, identityRequest) {
        console.log('Authenticating with identity_request...');
        
        try {
            const response = await fetch(`${CONFIG.baseURL}/auth/v2/token`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-app-name': 'frapp-montgolfiere-ios',
                    'x-appspace-id': 'montgolfiere',
                    'x-device-remoteid': CONFIG.deviceId
                },
                body: JSON.stringify({
                    grant_type: 'identity_request',
                    client_id: CONFIG.clientId,
                    client_secret: CONFIG.clientSecret,
                    username: email,
                    identity_request: identityRequest
                })
            });

            const data = await response.json();
            
            if (response.ok && data.access_token) {
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token;
                
                const payload = this.parseJWT(this.accessToken);
                this.tokenExpiry = payload?.exp;
                
                this.saveTokens();
                console.log('✓ Authentication successful');
                console.log(`Token expires at: ${new Date(this.tokenExpiry * 1000).toLocaleString()}`);
                return true;
            } else {
                console.error('✗ Authentication failed:', data);
                return false;
            }
        } catch (error) {
            console.error('✗ Authentication error:', error.message);
            return false;
        }
    }

    // Refresh the access token using refresh_token
    async refreshAccessToken() {
        if (!this.refreshToken) {
            console.error('No refresh token available');
            return false;
        }

        console.log('Refreshing access token...');
        
        try {
            const response = await fetch(`${CONFIG.baseURL}/auth/v2/token`, {
                method: 'POST',
                headers: {
                    'content-type': 'application/json',
                    'x-app-name': 'frapp-montgolfiere-ios',
                    'x-appspace-id': 'montgolfiere',
                    'x-device-remoteid': CONFIG.deviceId
                },
                body: JSON.stringify({
                    grant_type: 'refresh_token',
                    client_id: CONFIG.clientId,
                    client_secret: CONFIG.clientSecret,
                    refresh_token: this.refreshToken
                })
            });

            const data = await response.json();
            
            if (response.ok && data.access_token) {
                this.accessToken = data.access_token;
                this.refreshToken = data.refresh_token;
                
                const payload = this.parseJWT(this.accessToken);
                this.tokenExpiry = payload?.exp;
                
                this.saveTokens();
                console.log('✓ Token refreshed successfully');
                console.log(`New token expires at: ${new Date(this.tokenExpiry * 1000).toLocaleString()}`);
                return true;
            } else {
                console.error('✗ Token refresh failed:', data);
                return false;
            }
        } catch (error) {
            console.error('✗ Token refresh error:', error.message);
            return false;
        }
    }

    // Get valid access token (refresh if needed)
    async getValidToken() {
        if (this.isTokenExpired()) {
            console.log('Token expired or about to expire, refreshing...');
            const refreshed = await this.refreshAccessToken();
            if (!refreshed) {
                throw new Error('Failed to refresh token. Please re-authenticate.');
            }
        }
        return this.accessToken;
    }

    // Standard headers for API requests
    getHeaders(includeAuth = true) {
        const headers = {
            'accept': 'application/json, text/plain, */*',
            'x-app-name': 'frapp-montgolfiere-ios',
            'x-timezone': 'Europe/Paris',
            'x-device-remoteid': CONFIG.deviceId,
            'x-appspace-id': 'montgolfiere',
            'user-agent': 'la montgolfiere-ios-26.0-2025.9.5-31564710',
            'x-app-version': '2025.9.5'
        };

        if (includeAuth && this.accessToken) {
            headers['authorization'] = `Bearer ${this.accessToken}`;
        }

        return headers;
    }
}

// Example usage
async function main() {
    const auth = new AuthManager();

    // FIRST TIME SETUP: You need to authenticate once with identity_request
    // Get this from mitmproxy when you log into the app
    const FIRST_TIME_SETUP = false; // Set to true only for first authentication
    
    if (FIRST_TIME_SETUP) {
        const email = 'j.sarquis@hotmail.com';
        const identityRequest = 'YOUR_IDENTITY_REQUEST_FROM_MITMPROXY';
        
        const success = await auth.authenticate(email, identityRequest);
        if (!success) {
            console.error('Initial authentication failed');
            return;
        }
    } else {
        // After first setup, tokens will be loaded from file
        if (!auth.refreshToken) {
            console.error('No saved tokens found. Set FIRST_TIME_SETUP = true and provide identity_request');
            return;
        }
    }

    // Get a valid token (will auto-refresh if needed)
    try {
        const token = await auth.getValidToken();
        console.log('\n✓ Have valid access token');
        
        // Now you can make API calls
        const fromDate = new Date().toISOString().split('T')[0];
        const response = await fetch(
            `${CONFIG.baseURL}/members/v2/user_accounts/${CONFIG.userAccountId}/bookings/slots?from=${fromDate}`,
            {
                method: 'GET',
                headers: auth.getHeaders()
            }
        );

        const data = await response.json();
        console.log(`\nFound ${data.items?.length || 0} classes`);
        
    } catch (error) {
        console.error('Error:', error.message);
    }
}

// Export for use in other scripts
export default AuthManager;
export { CONFIG };

// Run if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    main().catch(console.error);
}