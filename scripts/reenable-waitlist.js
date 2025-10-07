#!/usr/bin/env node

/**
 * Re-enable Waitlist Bot Workflow
 * 
 * This script re-enables the waitlist bot workflow by renaming
 * the disabled workflow file back to its original name.
 */

import fs from 'fs';
import { execSync } from 'child_process';

const workflowPath = '.github/workflows/waitlist-bot.yml';
const disabledPath = '.github/workflows/waitlist-bot.yml.disabled';

console.log('🔧 Re-enabling Waitlist Bot workflow...');

try {
    if (fs.existsSync(disabledPath)) {
        // Rename disabled file back to active
        fs.renameSync(disabledPath, workflowPath);
        
        // Commit the change
        execSync('git add .github/workflows/waitlist-bot.yml', { stdio: 'inherit' });
        execSync('git rm .github/workflows/waitlist-bot.yml.disabled', { stdio: 'inherit' });
        execSync('git commit -m "🤖 Re-enable waitlist bot workflow"', { stdio: 'inherit' });
        execSync('git push', { stdio: 'inherit' });
        
        console.log('✅ Waitlist Bot workflow re-enabled successfully!');
        console.log('📅 The bot will start monitoring again on the next scheduled run.');
    } else {
        console.log('ℹ️ No disabled workflow found. The workflow is already active.');
    }
} catch (error) {
    console.error(`❌ Error re-enabling workflow: ${error.message}`);
    process.exit(1);
}
