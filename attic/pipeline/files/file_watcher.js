#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

// Usage: ./file_watcher.js <filename>
// Outputs: Forth source code to stdout whenever file changes

if (process.argv.length < 3) {
  console.error('Usage: file_watcher.js <forth-file>');
  console.error('Example: ./file_watcher.js haiku.forth | forth_compiler.js');
  process.exit(1);
}

const filename = process.argv[2];

function outputFile() {
  try {
    const content = fs.readFileSync(filename, 'utf8');
    // Output to stdout - this is what gets piped to next stage
    process.stdout.write(content);
    process.stdout.write('\n---END---\n');  // Delimiter for next stage
  } catch (e) {
    console.error('Error reading file:', e.message);
  }
}

// Output file immediately on start
outputFile();

// Watch for changes
fs.watch(filename, (eventType) => {
  if (eventType === 'change') {
    outputFile();
  }
});

console.error(`Watching ${filename} for changes...`);
