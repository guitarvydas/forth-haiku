#!/usr/bin/env node
'use strict';

// Usage: cat optimized.json | ./prepare_message.js
// Input: JSON array of JavaScript statements from stdin
// Output: Browser message format to stdout

// Read from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk.toString());
process.stdin.on('end', () => {
  try {
    const jsArray = JSON.parse(input);
    const jsString = jsArray.join('\n');
    
    // Create message in format browser expects
    const message = {
      type: 'code',
      javascript: jsString
    };
    
    // Output as JSON to stdout
    console.log(JSON.stringify(message));
    
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
});
