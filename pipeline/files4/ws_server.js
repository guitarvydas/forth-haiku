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
  let filepath;
  
  if (req.url === '/' || req.url === '/index.html') {
    filepath = 'renderer.html';
  } else if (req.url === '/test' || req.url === '/test.html') {
    filepath = 'test_websocket.html';
  } else if (req.url === '/minimal' || req.url === '/minimal.html') {
    filepath = 'minimal_test.html';
  } else {
    res.writeHead(404);
    res.end('Not found');
    return;
  }
  
  fs.readFile(path.join(__dirname, filepath), (err, data) => {
    if (err) {
      res.writeHead(500);
      res.end('Error loading ' + filepath);
      return;
    }
    res.writeHead(200, {'Content-Type': 'text/html'});
    res.end(data);
  });
});

// Create WebSocket server
const wss = new WebSocket.Server({ server });

let browserConnected = false;

wss.on('connection', (ws) => {
  browserConnected = true;
  console.log('\n[' + new Date().toLocaleTimeString() + '] ✓ Browser connected');
  
  ws.on('message', (message) => {
    try {
      const msg = JSON.parse(message);
      console.log('[' + new Date().toLocaleTimeString() + '] ← Received from browser:', msg.status || msg.type || 'unknown');
      if (msg.status) {
        console.log('    Message:', msg.message || 'no message');
      }
    } catch (e) {
      console.log('[' + new Date().toLocaleTimeString() + '] ← Received (raw):', message.toString().substring(0, 50));
    }
  });
  
  ws.on('close', () => {
    browserConnected = false;
    console.log('[' + new Date().toLocaleTimeString() + '] ✗ Browser disconnected');
  });
  
  ws.on('error', (err) => {
    console.log('[' + new Date().toLocaleTimeString() + '] ✗ WebSocket error:', err.message);
  });
});

// Show status every 5 seconds
setInterval(() => {
  if (!browserConnected) {
    console.log('\n[Status] No browser connected. Open http://localhost:' + PORT + '/minimal');
  }
}, 5000);

server.listen(PORT, () => {
  console.log(`
╔════════════════════════════════════════════════════════════════╗
║  Forth Haiku WebSocket Server - Running on port ${PORT}          ║
╚════════════════════════════════════════════════════════════════╝

Available pages:
  Main renderer:  http://localhost:${PORT}/
  Minimal test:   http://localhost:${PORT}/minimal  ← START HERE
  Debug test:     http://localhost:${PORT}/test

Quick test:
  1. Open http://localhost:${PORT}/minimal in your browser
  2. Run: echo '["var go = function() { return [1, 0, 0, 1]; }; go"]' | ./ws_sender.js
  3. You should see a RED square

Full pipeline:
  cat example_red.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js
  `);
});
