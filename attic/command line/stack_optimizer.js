#!/usr/bin/env node
'use strict';

// Usage: cat compiled.json | ./stack_optimizer.js
// Input: JSON array of JavaScript statements (with stack operations)
// Output: JSON array of optimized JavaScript statements (with temp variables)

function mod(v1, v2) {
  return v1 - v2 * Math.floor(v1 / v2);
}

const BOGUS = [
  'dstack.push(1.0);',
  'dstack.push(0.0);',
  'dstack.push(0.7);',
  'dstack.push(1.0);',
  'dstack.push(0.0);'
];


function optimize(code, result_limit) {
  if (code === BOGUS) return BOGUS;

  let dstack = [];
  let rstack = [];
  let cstack = [];
  let tmp_index = 1;
  
  for (let i = 0; i < code.length; i++) {
    // Replace dstack.pop() with temp variables
    for (;;) {
      if (code[i].search(/dstack\.pop\(\)/) >= 0) {
        if (dstack.length === 0) return BOGUS;
        const tmp = dstack.pop();
        code[i] = code[i].replace(/dstack\.pop\(\)/, tmp);
        continue;
      }
      if (code[i].search(/rstack\.pop\(\)/) >= 0) {
        if (rstack.length === 0) return BOGUS;
        const tmp = rstack.pop();
        code[i] = code[i].replace(/rstack\.pop\(\)/, tmp);
        continue;
      }
      break;
    }
    
    // Replace dstack.push() with temp variable declarations
    let m = code[i].match(/^dstack\.push\((.*)\);$/);
    if (m) {
      const tmp = 'temp' + tmp_index++;
      code[i] = 'var ' + tmp + ' = ' + m[1] + ';';
      dstack.push(tmp);
    }
    
    m = code[i].match(/^rstack\.push\((.*)\);$/);
    if (m) {
      const tmp = 'temp' + tmp_index++;
      code[i] = 'var ' + tmp + ' = ' + m[1] + ';';
      rstack.push(tmp);
    }
    
    // Handle control flow
    m = code[i].match(/^if\((.*)\) \{$/);
    if (m) {
      cstack.push([0, dstack.slice(0), rstack.slice(0), i]);
    }
    
    if (code[i] === '} else {') {
      if (cstack.length === 0) return BOGUS;
      const frame = cstack.pop();
      if (frame[0] !== 0) return BOGUS;
      cstack.push([1, dstack.slice(0), rstack.slice(0), frame[3], i]);
      dstack = frame[1];
      rstack = frame[2];
    }
    
    if (code[i] === '}') {
      if (cstack.length === 0) return BOGUS;
      const frame = cstack.pop();
      if (dstack.length !== frame[1].length ||
          rstack.length !== frame[2].length) return BOGUS;
      
      let decls = '';
      let fixup1 = '';
      let fixup2 = '';
      
      for (let j = 0; j < dstack.length; j++) {
        if (dstack[j] !== frame[1][j]) {
          const tmp = 'temp' + tmp_index++;
          decls += 'var ' + tmp + ';';
          fixup1 += tmp + ' = ' + dstack[j] + ';';
          fixup2 += tmp + ' = ' + frame[1][j] + ';';
          dstack[j] = tmp;
        }
      }
      
      for (let j = 0; j < rstack.length; j++) {
        if (rstack[j] !== frame[2][j]) {
          const tmp = 'temp' + tmp_index++;
          decls += 'var ' + tmp + ';';
          fixup1 += tmp + ' = ' + rstack[j] + ';';
          fixup2 += tmp + ' = ' + frame[2][j] + ';';
          rstack[j] = tmp;
        }
      }
      
      code[frame[3]] = decls + code[frame[3]];
      if (frame[0] === 0) {
        code[i] = fixup1 + '} else {' + fixup2 + '}';
      } else {
        code[i] = fixup1 + '}';
        code[frame[4]] = fixup2 + '} else {';
      }
    }
  }

  if (rstack.length !== 0) return BOGUS;
  if (dstack.length > 4) return BOGUS;

  // Verify no stack operations remain in optimized code
  for (let i = 0; i < code.length; i++) {
    if (code[i].search(/stack/) >= 0) {
      return BOGUS;
    }
  }

  // Ensure we have exactly 4 values for RGBA
  while (dstack.length < 4) {
    if (dstack.length === 3) {
      dstack.push('1.0');  // Alpha defaults to 1.0
    } else {
      dstack.push('0.0');  // R, G, B default to 0.0
    }
  }
  
  // Push final values onto runtime dstack for wrapper's 'return dstack;'
  for (let i = 0; i < dstack.length; i++) {
    code.push('dstack.push(' + dstack[i] + ');');
  }

  return code;
}

// Read from stdin - process on double newline separator
let buffer = '';

process.stdin.on('data', chunk => {
  buffer += chunk.toString();
  
  const idx = buffer.indexOf('\n\n');
  if (idx >= 0) {
    const input = buffer.substring(0, idx).trim();
    buffer = buffer.substring(idx + 2);
    
    if (input) {
      try {
        const code = JSON.parse(input);
        const optimized = optimize(code, 4);
        
        if (optimized === BOGUS) {
          console.error('Optimization failed - returning BOGUS code');
          console.log(JSON.stringify(BOGUS));
        } else {
          console.log(JSON.stringify(optimized));
        }
        console.log(''); // Blank line separator
      } catch (e) {
        console.error('Optimization error:', e.message);
      }
    }
  }
});
