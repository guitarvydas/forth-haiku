#!/usr/bin/env node
'use strict';

// DIAGNOSTIC - What's happening with WebSocket?

const WebSocket = require('ws');

console.log('=== WebSocket Diagnostic ===');
console.log('');
console.log('Connecting to ws://localhost:8080...');

const ws = new WebSocket('ws://localhost:8080');

let connected = false;
let sentMessage = false;
let receivedResponse = false;

// Timeout to force exit after 3 seconds
const timeout = setTimeout(() => {
  console.log('');
  console.log('--- After 3 seconds ---');
  console.log('Connected:', connected);
  console.log('Sent message:', sentMessage);
  console.log('Received response:', receivedResponse);
  console.log('');
  
  if (connected && sentMessage && !receivedResponse) {
    console.log('DIAGNOSIS: Browser is NOT responding');
    console.log('');
    console.log('Possible causes:');
    console.log('1. Browser page is not open at http://localhost:8080/minimal');
    console.log('2. Browser page is open but has JavaScript errors');
    console.log('3. Browser page is open at wrong URL (should be /minimal)');
    console.log('');
    console.log('Action: Open http://localhost:8080/minimal in your browser NOW');
    console.log('        Then run this diagnostic again');
  } else if (!connected) {
    console.log('DIAGNOSIS: Cannot connect to WebSocket server');
    console.log('');
    console.log('Action: Make sure ./ws_server.js is running');
  }
  
  process.exit(1);
}, 3000);

ws.on('open', () => {
  connected = true;
  console.log('✓ Connected');
  
  const testMsg = {
    type: 'code',
    javascript: 'var go = function() { return [1, 0, 0, 1]; }; go'
  };
  
  console.log('Sending test message...');
  ws.send(JSON.stringify(testMsg));
  sentMessage = true;
  console.log('✓ Message sent');
  console.log('Waiting for response from browser...');
});

ws.on('message', (data) => {
  receivedResponse = true;
  clearTimeout(timeout);
  
  console.log('✓✓✓ Got response from browser! ✓✓✓');
  console.log('');
  console.log('Response:', data.toString());
  
  try {
    const msg = JSON.parse(data);
    console.log('Status:', msg.status);
    if (msg.testResult) {
      console.log('Test result:', msg.testResult);
    }
  } catch (e) {
    // ignore
  }
  
  console.log('');
  console.log('SUCCESS: WebSocket communication is working!');
  console.log('');
  console.log('You should see a RED SQUARE in your browser.');
  
  ws.close();
  process.exit(0);
});

ws.on('error', (err) => {
  console.log('✗ WebSocket error:', err.message);
  clearTimeout(timeout);
  process.exit(1);
});

ws.on('close', () => {
  if (!receivedResponse) {
    console.log('Connection closed without receiving response');
  }
});
