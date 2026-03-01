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
