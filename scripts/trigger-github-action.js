#!/usr/bin/env node

import fetch from 'node-fetch';

// GitHub API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN || 'YOUR_GITHUB_TOKEN';
const REPO_OWNER = 'jlsqs';
const REPO_NAME = 'GymBookingBot';

// GitHub API endpoint for triggering workflow
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/dispatches`;

// Class types and their corresponding cron schedules
const CLASS_SCHEDULES = {
  monday: '57 29 7 * * 3',    // Wednesday 07:29:57
  tuesday: '57 59 10 * * 4',  // Thursday 10:59:57
  wednesday: '57 29 7 * * 5', // Friday 07:29:57
  thursday: '57 34 8 * * 6',  // Saturday 08:34:57
  friday: '57 59 12 * * 0'    // Sunday 12:59:57
};

async function triggerWorkflow(classType = 'auto') {
  try {
    console.log(`🚀 Triggering GitHub Action for ${classType} class...`);
    
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        event_type: 'booking-request',
        client_payload: {
          class_type: classType,
          triggered_at: new Date().toISOString(),
          cron_schedule: CLASS_SCHEDULES[classType] || 'manual'
        }
      })
    });

    if (response.ok) {
      console.log('✅ GitHub Action triggered successfully!');
      console.log(`📋 Check status at: https://github.com/${REPO_OWNER}/${REPO_NAME}/actions`);
      return true;
    } else {
      const error = await response.text();
      console.error('❌ Failed to trigger GitHub Action:', error);
      return false;
    }
  } catch (error) {
    console.error('❌ Error triggering GitHub Action:', error.message);
    return false;
  }
}

// Main function
async function main() {
  const classType = process.argv[2] || 'auto';
  
  if (!GITHUB_TOKEN || GITHUB_TOKEN === 'YOUR_GITHUB_TOKEN') {
    console.error('❌ Please set GITHUB_TOKEN environment variable');
    console.error('   Get token from: https://github.com/settings/tokens');
    console.error('   Required scopes: repo');
    process.exit(1);
  }

  if (classType !== 'auto' && !CLASS_SCHEDULES[classType]) {
    console.error('❌ Invalid class type. Use: monday, tuesday, wednesday, thursday, friday, or auto');
    process.exit(1);
  }

  console.log('🤖 GymBookingBot GitHub Action Trigger');
  console.log('=====================================');
  console.log(`📅 Class type: ${classType}`);
  console.log(`⏰ Time: ${new Date().toLocaleString()}`);
  console.log('');

  const success = await triggerWorkflow(classType);
  process.exit(success ? 0 : 1);
}

main().catch(console.error);
