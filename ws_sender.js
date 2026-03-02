#!/usr/bin/env node
'use strict';

const WebSocket = require('ws');

const PORT = 8080;
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

// Read from stdin and accumulate until EOF marker
let buffer = '';

process.stdin.on('data', chunk => {
  buffer += chunk.toString();

  // Look for EOF marker
  const markerIdx = buffer.indexOf('// ---EOF---');
  if (markerIdx >= 0) {
    // Extract just the JSON (before the marker)
    const jsonData = buffer.substring(0, markerIdx).trim();
    buffer = buffer.substring(markerIdx + 12); // Skip past marker
    
    if (jsonData && clients.length > 0) {
      console.error(`Sending ${jsonData.length} bytes to ${clients.length} client(s)`);
      console.error('First 100 chars:', jsonData.substring(0, 100));
      
      clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
	    console.log ('sending...');
	    console.log (jsonData);
            client.send(jsonData);  // Send WITHOUT the EOF marker!
        }
      });
    }
  }
});

process.stdin.resume();
