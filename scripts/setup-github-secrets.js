#!/usr/bin/env node

import fs from 'fs';

console.log('🔐 GitHub Secrets Setup Helper');
console.log('==============================');
console.log('');

// Read current tokens
let tokens;
try {
  const tokensData = fs.readFileSync('tokens.json', 'utf8');
  tokens = JSON.parse(tokensData);
} catch (error) {
  console.log('❌ Error reading tokens.json:', error.message);
  process.exit(1);
}

console.log('📋 Add these secrets to GitHub:');
console.log('🔗 URL: https://github.com/jlsqs/GymBookingBot/settings/secrets/actions');
console.log('');

const secrets = [
  {
    name: 'CLIENT_ID',
    value: '8kTC2WKnd3ZrjXt8gD1GZyN78uWAPFgN',
    description: 'API Client ID'
  },
  {
    name: 'CLIENT_SECRET', 
    value: '8QLHnxvAlKaX85KVy42REI9tyBSnqxrBSTewt4bmQATWyNxmcxQo0nElQOMAm1994zNcIggBefqawdXq5qMbh7rmcRVozli12IV0ebWVenenQBYDYW9HPtZqPz841OBc',
    description: 'API Client Secret'
  },
  {
    name: 'USER_ACCOUNT_ID',
    value: '3d48d22c-4e09-430e-a4d0-d65d58a5bd0d',
    description: 'Your User Account ID'
  },
  {
    name: 'DEVICE_ID',
    value: '9C329D35-7479-4979-A38A-D6DA27DC4074',
    description: 'Device ID for API calls'
  },
  {
    name: 'USER_EMAIL',
    value: 'j.sarquis@hotmail.com',
    description: 'Your email address'
  },
  {
    name: 'ACCESS_TOKEN',
    value: tokens.accessToken,
    description: 'Current access token'
  },
  {
    name: 'REFRESH_TOKEN',
    value: tokens.refreshToken,
    description: 'Current refresh token'
  },
  {
    name: 'TOKEN_EXPIRY',
    value: tokens.tokenExpiry.toString(),
    description: 'Token expiry timestamp'
  }
];

secrets.forEach((secret, index) => {
  console.log(`${index + 1}. ${secret.name}`);
  console.log(`   Description: ${secret.description}`);
  console.log(`   Value: ${secret.value}`);
  console.log('');
});

console.log('🎯 Instructions:');
console.log('1. Go to the URL above');
console.log('2. Click "New repository secret" for each item');
console.log('3. Copy the name and value exactly as shown');
console.log('4. Save each secret');
console.log('');
console.log('✅ After adding all secrets, your GitHub Actions will work!');
console.log('');
console.log('🧪 Test your setup:');
console.log('   npm run trigger-monday');
console.log('   npm run trigger-tuesday');
console.log('   npm run trigger-wednesday');
console.log('   npm run trigger-thursday');
console.log('   npm run trigger-friday');

