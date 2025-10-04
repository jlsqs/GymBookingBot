#!/usr/bin/env node

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Simple webhook server for cron-job.org
const PORT = process.env.PORT || 3000;

// Parse request body
function parseBody(req) {
  return new Promise((resolve) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => resolve(body));
  });
}

// Run the booking bot
async function runBookingBot() {
  return new Promise((resolve, reject) => {
    const botPath = join(__dirname, 'booking_bot.js');
    const logPath = join(__dirname, 'gym_booking.log');
    
    console.log(`[${new Date().toISOString()}] Starting booking bot...`);
    
    const child = spawn('node', [botPath], {
      stdio: ['ignore', 'pipe', 'pipe']
    });
    
    let output = '';
    let error = '';
    
    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      console.log(text.trim());
    });
    
    child.stderr.on('data', (data) => {
      const text = data.toString();
      error += text;
      console.error(text.trim());
    });
    
    child.on('close', (code) => {
      const timestamp = new Date().toISOString();
      const logEntry = `\n[${timestamp}] Booking bot finished with code ${code}\n`;
      
      // Append to log file
      fs.appendFileSync(logPath, logEntry + output + error);
      
      if (code === 0) {
        console.log(`[${timestamp}] Booking bot completed successfully`);
        resolve({ success: true, output, error });
      } else {
        console.log(`[${timestamp}] Booking bot failed with code ${code}`);
        resolve({ success: false, output, error, code });
      }
    });
    
    child.on('error', (err) => {
      console.error(`[${new Date().toISOString()}] Failed to start booking bot:`, err.message);
      reject(err);
    });
  });
}

// Simple HTTP server
import http from 'http';
const server = http.createServer(async (req, res) => {
  const timestamp = new Date().toISOString();
  
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  
  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }
  
  if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ 
      status: 'healthy', 
      timestamp,
      uptime: process.uptime()
    }));
    return;
  }
  
  if (req.method === 'POST' && req.url === '/webhook') {
    try {
      const body = await parseBody(req);
      console.log(`[${timestamp}] Webhook triggered`);
      
      const result = await runBookingBot();
      
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: result.success,
        timestamp,
        message: result.success ? 'Booking bot executed successfully' : 'Booking bot failed',
        code: result.code
      }));
      
    } catch (error) {
      console.error(`[${timestamp}] Webhook error:`, error.message);
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        success: false,
        timestamp,
        error: error.message
      }));
    }
    return;
  }
  
  // Default response
  res.writeHead(404, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify({ error: 'Not found' }));
});

server.listen(PORT, () => {
  console.log(`[${new Date().toISOString()}] Webhook server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Webhook endpoint: http://localhost:${PORT}/webhook`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log(`[${new Date().toISOString()}] Shutting down webhook server...`);
  server.close(() => {
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log(`[${new Date().toISOString()}] Shutting down webhook server...`);
  server.close(() => {
    process.exit(0);
  });
});
