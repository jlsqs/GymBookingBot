#!/usr/bin/env node

import fs from 'fs';
import readline from 'readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function question(prompt) {
  return new Promise((resolve) => {
    rl.question(prompt, resolve);
  });
}

async function main() {
  console.log('🔐 GitHub Secrets Setup Helper\n');
  
  // Check if tokens.json exists
  if (!fs.existsSync('tokens.json')) {
    console.log('❌ No tokens.json found. Please authenticate first:');
    console.log('   1. Set FIRST_TIME_SETUP = true in auth_manager.js');
    console.log('   2. Run: node auth_manager.js');
    console.log('   3. Then run this script again\n');
    rl.close();
    return;
  }
  
  // Load current tokens
  const tokens = JSON.parse(fs.readFileSync('tokens.json', 'utf8'));
  
  console.log('📋 Current token info:');
  console.log(`   Access Token: ${tokens.accessToken.substring(0, 20)}...`);
  console.log(`   Refresh Token: ${tokens.refreshToken.substring(0, 20)}...`);
  console.log(`   Expires: ${new Date(tokens.tokenExpiry * 1000).toLocaleString()}\n`);
  
  console.log('🔧 To set up GitHub Secrets:');
  console.log('   1. Go to: https://github.com/jlsqs/GymBookingBot/settings/secrets/actions');
  console.log('   2. Click "New repository secret" for each of these:\n');
  
  console.log('📝 Required Secrets:');
  console.log(`   CLIENT_ID: 8kTC2WKnd3ZrjXt8gD1GZyN78uWAPFgN`);
  console.log(`   CLIENT_SECRET: 8QLHnxvAlKaX85KVy42REI9tyBSnqxrBSTewt4bmQATWyNxmcxQo0nElQOMAm1994zNcIggBefqawdXq5qMbh7rmcRVozli12IV0ebWVenenQBYDYW9HPtZqPz841OBc`);
  console.log(`   USER_ACCOUNT_ID: 3d48d22c-4e09-430e-a4d0-d65d58a5bd0d`);
  console.log(`   DEVICE_ID: 9C329D35-7479-4979-A38A-D6DA27DC4074`);
  console.log(`   USER_EMAIL: j.sarquis@hotmail.com`);
  console.log(`   ACCESS_TOKEN: ${tokens.accessToken}`);
  console.log(`   REFRESH_TOKEN: ${tokens.refreshToken}`);
  console.log(`   TOKEN_EXPIRY: ${tokens.tokenExpiry}\n`);
  
  console.log('⚠️  Important Notes:');
  console.log('   - Tokens expire and need to be updated in GitHub Secrets');
  console.log('   - Keep your local tokens.json for development');
  console.log('   - GitHub Actions will run automatically on weekdays at 6:30 AM UTC');
  console.log('   - You can manually trigger runs from the Actions tab\n');
  
  const answer = await question('Would you like to open the GitHub Secrets page? (y/n): ');
  if (answer.toLowerCase() === 'y') {
    console.log('\n🌐 Opening GitHub Secrets page...');
    console.log('https://github.com/jlsqs/GymBookingBot/settings/secrets/actions');
  }
  
  rl.close();
}

main().catch(console.error);
