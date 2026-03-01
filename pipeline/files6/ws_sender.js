#!/usr/bin/env node
'use strict';

// Usage: cat something | ./ws_sender.js [ws://localhost:8080]
// Input: Any text from stdin
// Output: Sends that text via WebSocket to browser

const WebSocket = require('ws');

const WS_URL = process.argv[2] || 'ws://localhost:8080';

// Read from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk.toString());
process.stdin.on('end', () => {
  try {
    // Connect to WebSocket server
    const ws = new WebSocket(WS_URL);
    
    let responded = false;
    
    ws.on('open', () => {
      console.error('Connected to', WS_URL);
      
      // Send whatever we received on stdin
      ws.send(input);
      
      console.error('Sent', input.length, 'bytes');
      console.error('Waiting for response...');
      
      // Timeout after 5 seconds if no response
      setTimeout(() => {
        if (!responded) {
          console.error('Timeout: No response after 5 seconds');
          console.error('Make sure browser is open at http://localhost:8080/minimal');
          ws.close();
          process.exit(1);
        }
      }, 5000);
    });
    
    ws.on('message', (data) => {
      responded = true;
      console.error('Response:', data.toString());
      
      // Also output response to stdout so it can be piped
      console.log(data.toString());
      
      ws.close();
      process.exit(0);
    });
    
    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
      process.exit(1);
    });
    
    ws.on('close', () => {
      if (!responded) {
        console.error('Connection closed without response');
        process.exit(1);
      }
    });
    
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
});
