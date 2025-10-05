#!/usr/bin/env node

import fetch from 'node-fetch';

// GitHub API configuration
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const REPO_OWNER = 'jlsqs';
const REPO_NAME = 'GymBookingBot';

// GitHub API endpoint for workflow runs
const API_URL = `https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/actions/runs`;

async function getLatestRuns() {
  try {
    console.log('🔍 Fetching latest GitHub Actions runs...\n');
    
    const response = await fetch(API_URL, {
      headers: {
        'Authorization': `token ${GITHUB_TOKEN}`,
        'Accept': 'application/vnd.github.v3+json'
      }
    });

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    const data = await response.json();
    const runs = data.workflow_runs.slice(0, 5); // Get last 5 runs

    console.log('📋 Latest GitHub Actions Runs:');
    console.log('==============================\n');

    runs.forEach((run, index) => {
      const status = run.status === 'completed' ? 
        (run.conclusion === 'success' ? '✅ Success' : '❌ Failed') : 
        '🔄 Running';
      
      const trigger = run.event === 'repository_dispatch' ? 
        `API Trigger (${run.head_branch})` : 
        run.event;
      
      console.log(`${index + 1}. Run #${run.run_number}`);
      console.log(`   Status: ${status}`);
      console.log(`   Trigger: ${trigger}`);
      console.log(`   Started: ${new Date(run.created_at).toLocaleString()}`);
      console.log(`   Duration: ${run.run_attempt} attempt(s)`);
      console.log(`   URL: ${run.html_url}`);
      console.log('');
    });

    console.log('🎯 To view detailed logs:');
    console.log('1. Click on any URL above');
    console.log('2. Click on "book-class" job');
    console.log('3. Scroll down to see all the bot logs');
    console.log('');
    console.log('📊 Or go directly to: https://github.com/jlsqs/GymBookingBot/actions');

  } catch (error) {
    console.error('❌ Error fetching runs:', error.message);
  }
}

// Main function
async function main() {
  console.log('🤖 GymBookingBot - GitHub Actions Log Viewer');
  console.log('============================================\n');
  
  await getLatestRuns();
}

main().catch(console.error);

