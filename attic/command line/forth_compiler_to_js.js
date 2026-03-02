#!/usr/bin/env node
'use strict';

// Usage: cat haiku.forth | ./forth_compiler_to_js.js > output.js
// Input: Forth source code from stdin
// Output: Complete JavaScript function to stdout

const FUNC_SIGNATURE = `var go = function(
  time_val, time_delta_val,
  xpos, ypos,
  mouse_x, mouse_y,
  button_val,
  memory) {
  var PI = Math.PI;
  var random = Math.random;
  var floor = Math.floor;
  var sin = Math.sin;
  var cos = Math.cos;
  var tan = Math.tan;
  var sqrt = Math.sqrt;
  var abs = Math.abs;
  
  function mod(a, b) { return ((a % b) + b) % b; }
  function hasbit(num, bit) { return ((num >> bit) & 1) === 1; }
  function sample(arr, x, y) { return arr[floor(x) + floor(y) * 16]; }
  function store(arr, x, y, val) { arr[floor(x) + floor(y) * 16] = val; }
  function load(arr, x, y) { return arr[floor(x) + floor(y) * 16] || 0; }
  
  var dstack = [];
  var rstack = [];
  var work1, work2, work3, work4;
`;

// Dictionary of Forth words -> JavaScript code
const dict = {};

// Stack operations
dict['dup'] = [
  'work1 = dstack.pop();',
  'dstack.push(work1);',
  'dstack.push(work1);'
];

dict['drop'] = [
  'dstack.pop();'
];

dict['swap'] = [
  'work1 = dstack.pop();',
  'work2 = dstack.pop();',
  'dstack.push(work1);',
  'dstack.push(work2);'
];

dict['over'] = [
  'work1 = dstack.pop();',
  'work2 = dstack.pop();',
  'dstack.push(work2);',
  'dstack.push(work1);',
  'dstack.push(work2);'
];

dict['rot'] = [
  'work1 = dstack.pop();',
  'work2 = dstack.pop();',
  'work3 = dstack.pop();',
  'dstack.push(work2);',
  'dstack.push(work1);',
  'dstack.push(work3);'
];

dict['2dup'] = dict['over'].concat(dict['over']);

// Arithmetic operations
dict['+'] = ['dstack.push(dstack.pop() + dstack.pop());'];
dict['-'] = [
  'work1 = dstack.pop();',
  'dstack.push(dstack.pop() - work1);'
];
dict['*'] = ['dstack.push(dstack.pop() * dstack.pop());'];
dict['/'] = [
  'work1 = dstack.pop();',
  'dstack.push(dstack.pop() / work1);'
];
dict['mod'] = [
  'work1 = dstack.pop();',
  'dstack.push(mod(dstack.pop(), work1));'
];

// Math functions
dict['sin'] = ['dstack.push(sin(dstack.pop()));'];
dict['cos'] = ['dstack.push(cos(dstack.pop()));'];
dict['tan'] = ['dstack.push(tan(dstack.pop()));'];
dict['sqrt'] = ['dstack.push(sqrt(dstack.pop()));'];
dict['abs'] = ['dstack.push(abs(dstack.pop()));'];
dict['log'] = ['dstack.push(Math.log(Math.abs(dstack.pop())));'];

// Comparison operations
dict['>'] = [
  'dstack.push((dstack.pop() < dstack.pop()) ? 1.0 : 0.0);'
];
dict['<'] = [
  'dstack.push((dstack.pop() > dstack.pop()) ? 1.0 : 0.0);'
];
dict['='] = [
  'dstack.push((dstack.pop() === dstack.pop()) ? 1.0 : 0.0);'
];

// Control flow
dict['if'] = ['if(dstack.pop() != 0.0) {'];
dict['else'] = ['} else {'];
dict['then'] = ['}'];

// Variables
dict['x'] = ['dstack.push(xpos);'];
dict['y'] = ['dstack.push(ypos);'];
dict['t'] = ['dstack.push(time_val);'];
dict['dt'] = ['dstack.push(time_delta_val);'];
dict['mx'] = ['dstack.push(mouse_x);'];
dict['my'] = ['dstack.push(mouse_y);'];
dict['button'] = ['dstack.push(button_val);'];

// Memory operations
dict['@'] = [
  'work2 = dstack.pop();',
  'work1 = dstack.pop();',
  'dstack.push(load(memory, work1, work2));'
];
dict['!'] = [
  'work3 = dstack.pop();',
  'work2 = dstack.pop();',
  'work1 = dstack.pop();',
  'store(memory, work1, work2, work3);'
];

// Return stack operations
dict['>r'] = [
  'rstack.push(dstack.pop());'
];
dict['r>'] = [
  'dstack.push(rstack.pop());'
];
dict['r@'] = [
  'dstack.push(rstack[rstack.length - 1]);'
];

// Complex number operations
dict['z+'] = [
  'work1 = dstack.pop();',
  'work2 = dstack.pop();',
  'work3 = dstack.pop();',
  'work4 = dstack.pop();',
  'dstack.push(work4 + work2);',
  'dstack.push(work3 + work1);'
];

dict['z*'] = [
  'work1 = dstack.pop();',
  'work2 = dstack.pop();',
  'work3 = dstack.pop();',
  'work4 = dstack.pop();',
  'dstack.push(work4 * work2 - work3 * work1);',
  'dstack.push(work4 * work1 + work3 * work2);'
];

// Compile function
function compile(source) {
  const code = [];
  const lines = source.split('\n');
  
  for (let line of lines) {
    // Handle line comments - remove everything after \
    const commentIdx = line.indexOf('\\');
    if (commentIdx >= 0) {
      line = line.substring(0, commentIdx);
    }
    
    const words = line.split(/\s+/).filter(w => w.length > 0);
    
    let i = 0;
    while (i < words.length) {
      const word = words[i];
      
      // Handle colon definitions
      if (word === ':') {
        i++;
        const name = words[i];
        i++;
        const body = [];
        while (i < words.length && words[i] !== ';') {
          body.push(words[i]);
          i++;
        }
        // Recursively compile the body
        const bodySource = body.join(' ');
        const bodyCode = compileTokens(bodySource);
        dict[name] = bodyCode;
        i++; // skip the ';'
        continue;
      }
      
      // Handle paren comments
      if (word === '(') {
        // Skip until closing )
        while (i < words.length && words[i] !== ')') {
          i++;
        }
        i++;
        continue;
      }
      
      // Look up in dictionary
      if (word in dict) {
        code.push(...dict[word]);
      } else {
        // Try to parse as number
        const num = parseFloat(word);
        if (!isNaN(num)) {
          code.push('dstack.push(' + num + ');');
        } else {
          // Unknown word - could be error, but let's just skip
          console.error('Warning: Unknown word:', word);
        }
      }
      
      i++;
    }
  }
  
  return code;
}

function compileTokens(source) {
  const code = [];
  const words = source.split(/\s+/).filter(w => w.length > 0);
  
  for (const word of words) {
    if (word in dict) {
      code.push(...dict[word]);
    } else {
      const num = parseFloat(word);
      if (!isNaN(num)) {
        code.push('dstack.push(' + num + ');');
      }
    }
  }
  
  return code;
}

// Read from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk.toString());
process.stdin.on('end', () => {
  try {
    // Compile the Forth source
    const bodyCode = compile(input);
    
    // Build complete JavaScript function
    const js = [
      FUNC_SIGNATURE,
      '  ',
      '  ' + bodyCode.join('\n  '),
      '  ',
      '  return dstack;',
      '};',
      'go'
    ].join('\n');
    
    // Output to stdout
    console.log(js);
    
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
});
