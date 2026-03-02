#!/usr/bin/env node
'use strict';

const WebSocket = require('ws');
const readline = require('readline');

const PORT = 8080;

// Create WebSocket server
const wss = new WebSocket.Server({ port: PORT });

console.error(`WebSocket server listening on port ${PORT}`);
console.error('Waiting for browser connection...');

let clients = [];

wss.on('connection', (ws) => {
  console.error('Browser connected!');
  clients.push(ws);
  
  ws.on('close', () => {
    console.error('Browser disconnected');
    clients = clients.filter(c => c !== ws);
  });
});

// Read from stdin line by line and accumulate JavaScript code
let codeBuffer = '';
let inFunction = false;

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

rl.on('line', (line) => {
  codeBuffer += line + '\n';
  
  // Detect start of function
  if (line.includes('var go = function')) {
    inFunction = true;
  }
  
  // Detect end of function (the final 'go' by itself)
  if (inFunction && line.trim() === 'go') {
    // Complete function received, send to all clients
    console.error(`Sending ${codeBuffer.length} bytes of code to ${clients.length} client(s)`);
    
    clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) {
        client.send(codeBuffer);
      }
    });
    
    // Reset for next update
    codeBuffer = '';
    inFunction = false;
  }
});

rl.on('close', () => {
  console.error('Input stream closed');
});

// Keep process alive
process.stdin.resume();
