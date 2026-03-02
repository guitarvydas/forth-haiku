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
    
    let responded = false;
    
    ws.on('open', () => {
      console.error('Connected to', WS_URL);
      
      // Send the JavaScript code
      ws.send(JSON.stringify({
        type: 'code',
        javascript: jsString
      }));
      
      console.error('Sent', jsString.length, 'bytes of JavaScript');
      console.error('Waiting for browser response...');
      
      // Timeout after 5 seconds if no response
      setTimeout(() => {
        if (!responded) {
          console.error('Timeout: No response from browser after 5 seconds');
          console.error('Check browser console (F12) for errors');
          ws.close();
          process.exit(1);
        }
      }, 5000);
    });
    
    ws.on('message', (data) => {
      responded = true;
      const msg = JSON.parse(data);
      console.error('Response from browser:', JSON.stringify(msg, null, 2));
      
      if (msg.status === 'ok') {
        console.error('✓ SUCCESS: Code executed and rendered');
      } else {
        console.error('✗ ERROR:', msg.message);
      }
      
      // Close after receiving response
      ws.close();
      process.exit(msg.status === 'ok' ? 0 : 1);
    });
    
    ws.on('error', (err) => {
      console.error('WebSocket error:', err.message);
      process.exit(1);
    });
    
    ws.on('close', () => {
      if (!responded) {
        console.error('Connection closed without response');
        console.error('Make sure browser at http://localhost:8080 is open');
      }
      process.exit(responded ? 0 : 1);
    });
    
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
});
