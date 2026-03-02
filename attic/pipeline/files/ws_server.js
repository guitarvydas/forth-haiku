#!/usr/bin/env node
'use strict';

// WebSocket server that bridges browser and command-line pipeline
// Usage: ./ws_server.js [port]

const WebSocket = require('ws');
const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = process.argv[2] || 8080;

// Create HTTP server to serve the renderer.html
const server = http.createServer((req, res) => {
  if (req.url === '/' || req.url === '/index.html') {
    fs.readFile(path.join(__dirname, 'renderer.html'), (err, data) => {
      if (err) {
        res.writeHead(500);
        res.end('Error loading renderer.html');
        return;
      }
      res.writeHead(200, {'Content-Type': 'text/html'});
      res.end(data);
    });
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

wss.on('connection', (ws) => {
  console.log('Browser connected');
  
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      console.log('Received from browser:', msg);
    } catch (e) {
      console.error('Error parsing message:', e.message);
    }
  });
  
  ws.on('close', () => {
    console.log('Browser disconnected');
  });
  
  ws.on('error', (err) => {
    console.error('WebSocket error:', err.message);
  });
});

server.listen(PORT, () => {
  console.log(`WebSocket server running on port ${PORT}`);
  console.log(`Open http://localhost:${PORT}/ in your browser`);
  console.log('');
  console.log('Then run the pipeline:');
  console.log(`  cat example.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js`);
});
