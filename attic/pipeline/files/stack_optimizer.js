#!/usr/bin/env node
'use strict';

// Usage: cat compiled.json | ./stack_optimizer.js
// Input: JSON array of JavaScript statements (with stack operations)
// Output: JSON array of optimized JavaScript statements (with temp variables)

function mod(v1, v2) {
  return v1 - v2 * Math.floor(v1 / v2);
}

const FUNC_SIGNATURE =
    'var go = function( ' +
    '  time_val, time_delta_val, ' +
    '  xpos, ypos, ' +
    '  mouse_x, mouse_y, ' +
    '  button_val, '+
    '  memory) { ' +
    '  var PI = Math.PI; ' +
    '  var random = Math.random; ' +
    '  var floor = Math.floor; ' +
    '  var ceil = Math.ceil; ' +
    '  var min = Math.min; ' +
    '  var max = Math.max; ' +
    '  var log = Math.log; ' +
    '  var sqrt = Math.sqrt; ' +
    '  var pow = Math.pow; ' +
    '  var abs = Math.abs; ' +
    '  var sin = Math.sin; ' +
    '  var cos = Math.cos; ' +
    '  var tan = Math.tan; ' +
    '  var atan2 = Math.atan2; ' +
    '  var exp = Math.exp; ' +
    '  var audio_sample = 0.0; ' +
    '  function hasbit(val, b) { ' +
    '    b = Math.floor(b); ' +
    '    return mod(val, Math.pow(2.0, b + 1)) >= Math.pow(2.0, b); ' +
    '  } ' +
    '  function sample(x, y) {} ' +
    '  function sample_r() { return 0.0; } ' +
    '  function sample_g() { return 0.9; } ' +
    '  function sample_b() { return 0.7; } ' +
    '  function store(v, addr) { ' +
    '    memory[mod(Math.floor(addr), 16)] = v; } ' +
    '  function load(addr) { ' +
    '    return memory[mod(Math.floor(addr), 16)]; } ' +
    '  function mod(v1, v2) { ' +
    '    return v1 - v2 * Math.floor(v1 / v2); ' +
    '  } ';

const BOGUS = [FUNC_SIGNATURE + 'return [1.0, 0.0, 0.7, 1.0, 0.0]; }; go'];

function optimize(code, result_limit) {
  if (code === BOGUS) return BOGUS;

  // Use alternate pre/post-amble and optimize away dstack/rstack.
  code = code.slice(0, code.length - 1);
  code[0] = FUNC_SIGNATURE + ' var work1, work2, work3, work4; ';

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

  // Ensure we have exactly 4 values for RGBA
  while (dstack.length < 4) {
    if (dstack.length === 3) {
      dstack.push('1.0');  // Alpha defaults to 1.0
    } else {
      dstack.push('0.0');  // R, G, B default to 0.0
    }
  }
  
  code.push('return [' + dstack.join(', ') + ']; }; go');

  // Verify no stack operations remain
  for (let i = 0; i < code.length; i++) {
    if (code[i].search(/stack/) >= 0) {
      return BOGUS;
    }
  }

  return code;
}

// Read from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk.toString());
process.stdin.on('end', () => {
  try {
    const code = JSON.parse(input);
    const optimized = optimize(code, 4);
    
    if (optimized === BOGUS) {
      console.error('Optimization failed - returning BOGUS code');
      console.log(JSON.stringify(BOGUS));
    } else {
      console.log(JSON.stringify(optimized));
    }
  } catch (e) {
    console.error('Optimization error:', e.message);
    process.exit(1);
  }
});
