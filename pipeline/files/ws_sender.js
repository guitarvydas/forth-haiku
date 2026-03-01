#!/usr/bin/env node
'use strict';

// Usage: cat optimized.json | ./ws_sender.js [ws://localhost:8080]
// Input: JSON array of JavaScript statements from stdin
// Output: Sends joined JavaScript string over WebSocket

const WebSocket = require('ws');

const WS_URL = process.argv[2] || 'ws://localhost:8080';

// Read from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk.toString());
process.stdin.on('end', () => {
  try {
    const jsArray = JSON.parse(input);
    const jsString = jsArray.join('\n');
    
    // Connect to WebSocket server
    const ws = new WebSocket(WS_URL);
    
    ws.on('open', () => {
      console.error('Connected to', WS_URL);
      
      // Send the JavaScript code
      ws.send(JSON.stringify({
        type: 'code',
        javascript: jsString
      }));
      
      console.error('Sent', jsString.length, 'bytes of JavaScript');
    });
    
    ws.on('message', (data) => {
      const msg = JSON.parse(data);
      console.error('Response from browser:', msg);
      
      // Close after receiving response
      ws.close();
      process.exit(0);
    });
    
    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
      process.exit(1);
    });
    
    ws.on('close', () => {
      console.error('Connection closed');
      process.exit(0);
    });
    
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
});
