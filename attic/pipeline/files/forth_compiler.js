#!/usr/bin/env node
'use strict';

// Usage: cat haiku.forth | ./forth_compiler.js
// Input: Forth source code from stdin
// Output: JSON array of JavaScript statements to stdout

function mod(v1, v2) {
  return v1 - v2 * Math.floor(v1 / v2);
}

function core_words() {
  const dict = {};
  
  // Stack access
  dict['x'] = ['dstack.push(xpos);'];
  dict['y'] = ['dstack.push(ypos);'];
  dict['mx'] = ['dstack.push(mouse_x);'];
  dict['my'] = ['dstack.push(mouse_y);'];
  dict['t'] = ['dstack.push(time_val);'];
  dict['dt'] = ['dstack.push(time_delta_val);'];
  dict['button'] = ['work1 = dstack.pop();',
                    'dstack.push(hasbit(button_val, work1));'];
  dict['buttons'] = ['dstack.push(button_val);'];
  dict['audio'] = ['audio_sample = dstack.pop();'];
  dict['sample'] = ['work2 = dstack.pop();',
                    'work1 = dstack.pop();',
                    'sample(work1, work2);',
                    'dstack.push(sample_r());',
                    'dstack.push(sample_g());',
                    'dstack.push(sample_b());'];
  dict['bwsample'] = ['work2 = dstack.pop();',
                      'work1 = dstack.pop();',
                      'sample(work1, work2);',
                      'dstack.push(sample_r() * 0.299 + ' +
                      'sample_g() * 0.587 + sample_b() * 0.114);'];

  // Return stack
  dict['push'] = ['rstack.push(dstack.pop());'];
  dict['pop'] = ['dstack.push(rstack.pop());'];
  dict['>r'] = dict['push'];
  dict['r>'] = dict['pop'];
  dict['r@'] = ['work1 = rstack.pop();',
                'rstack.push(work1);',
                'dstack.push(work1);'];

  // Memory
  dict['@'] = ['work1 = dstack.pop();',
               'dstack.push(load(work1));'];
  dict['!'] = ['work1 = dstack.pop();',
               'work2 = dstack.pop();',
               'store(work2, work1);'];

  // Stack manipulation
  dict['dup'] = ['work1 = dstack.pop();',
                 'dstack.push(work1);',
                 'dstack.push(work1);'];
  dict['over'] = ['work1 = dstack.pop();',
                  'work2 = dstack.pop();',
                  'dstack.push(work2);',
                  'dstack.push(work1);',
                  'dstack.push(work2);'];
  dict['2dup'] = dict['over'].concat(dict['over']);
  dict['drop'] = ['work1 = dstack.pop();'];
  dict['swap'] = ['work1 = dstack.pop();',
                  'work2 = dstack.pop();',
                  'dstack.push(work1);',
                  'dstack.push(work2);'];
  dict['rot'] = ['work1 = dstack.pop();',
                 'work2 = dstack.pop();',
                 'work3 = dstack.pop();',
                 'dstack.push(work2);',
                 'dstack.push(work1);',
                 'dstack.push(work3);'];
  dict['-rot'] = ['work1 = dstack.pop();',
                  'work2 = dstack.pop();',
                  'work3 = dstack.pop();',
                  'dstack.push(work1);',
                  'dstack.push(work3);',
                  'dstack.push(work2);'];

  // Complex number operations
  dict['z+'] = ['work1 = dstack.pop();',
                'work2 = dstack.pop();',
                'work3 = dstack.pop();',
                'work4 = dstack.pop();',
                'dstack.push(work2 + work4);',
                'dstack.push(work1 + work3);'];
  dict['z*'] = ['work1 = dstack.pop();',
                'work2 = dstack.pop();',
                'work3 = dstack.pop();',
                'work4 = dstack.pop();',
                'dstack.push(work4 * work2 - work3 * work1);',
                'dstack.push(work4 * work1 + work3 * work2);'];

  // Comparisons
  dict['='] = ['dstack.push((dstack.pop() == dstack.pop())?1.0:0.0);'];
  dict['<>'] = ['dstack.push((dstack.pop() != dstack.pop())?1.0:0.0);'];
  dict['<'] = ['dstack.push((dstack.pop() > dstack.pop())?1.0:0.0);'];
  dict['>'] = ['dstack.push((dstack.pop() < dstack.pop())?1.0:0.0);'];
  dict['<='] = ['dstack.push((dstack.pop() >= dstack.pop())?1.0:0.0);'];
  dict['>='] = ['dstack.push((dstack.pop() <= dstack.pop())?1.0:0.0);'];

  // Arithmetic
  dict['+'] = ['dstack.push(dstack.pop() + dstack.pop());'];
  dict['*'] = ['dstack.push(dstack.pop() * dstack.pop());'];
  dict['-'] = ['work1 = dstack.pop();',
               'dstack.push(dstack.pop() - work1);'];
  dict['/'] = ['work1 = dstack.pop();',
               'dstack.push(dstack.pop() / work1);'];
  dict['mod'] = ['work1 = dstack.pop();',
                 'work2 = dstack.pop();',
                 'dstack.push(mod(work2, work1));'];
  dict['pow'] = ['work1 = dstack.pop();',
                 'dstack.push(Math.pow(Math.abs(dstack.pop()), work1));'];
  dict['**'] = dict['pow'];
  dict['atan2'] = ['work1 = dstack.pop();',
                   'dstack.push(Math.atan2(dstack.pop(), work1));'];

  // Logic
  dict['and'] = ['work1 = dstack.pop();',
                 'dstack.push((dstack.pop()!=0.0 && work1!=0.0)?1.0:0.0);'];
  dict['or'] = ['work1 = dstack.pop();',
                'dstack.push((dstack.pop()!=0.0 || work1!=0.0)?1.0:0.0);'];
  dict['not'] = ['dstack.push(dstack.pop()!=0.0?0.0:1.0);'];

  dict['min'] = ['dstack.push(Math.min(dstack.pop(), dstack.pop()));'];
  dict['max'] = ['dstack.push(Math.max(dstack.pop(), dstack.pop()));'];

  // Math functions
  dict['negate'] = ['dstack.push(-dstack.pop());'];
  dict['sin'] = ['dstack.push(Math.sin(dstack.pop()));'];
  dict['cos'] = ['dstack.push(Math.cos(dstack.pop()));'];
  dict['tan'] = ['dstack.push(Math.tan(dstack.pop()));'];
  dict['log'] = ['dstack.push(Math.log(Math.abs(dstack.pop())));'];
  dict['exp'] = ['dstack.push(Math.exp(dstack.pop()));'];
  dict['sqrt'] = ['dstack.push(Math.sqrt(Math.abs(dstack.pop())));'];
  dict['floor'] = ['dstack.push(Math.floor(dstack.pop()));'];
  dict['ceil'] = ['dstack.push(Math.ceil(dstack.pop()));'];
  dict['abs'] = ['dstack.push(Math.abs(dstack.pop()));'];

  dict['pi'] = ['dstack.push(Math.PI);'];
  dict['random'] = ['dstack.push(Math.random());'];

  // Control flow
  dict['if'] = ['if(dstack.pop() != 0.0) {'];
  dict['else'] = ['} else {'];
  dict['then'] = ['}'];

  return dict;
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

function compile(src_code) {
  const code = [FUNC_SIGNATURE + ' var dstack=[]; var rstack=[]; '];
  const dict = core_words();
  let pending_name = 'bogus';
  const code_stack = [];
  let paren_comment = false;
  
  src_code = src_code.replace(/[ \r\t]+/g, ' ').trim();
  const lines = src_code.split('\n');
  
  for (let j = 0; j < lines.length; j++) {
    const src = lines[j].split(' ');
    for (let i = 0; i < src.length; i++) {
      let word = src[i];
      word = word.toLowerCase();
      
      if (paren_comment) {
        if (word === ')') {
          paren_comment = false;
        }
        continue;
      }
      
      if (word === '') {
        continue;
      } else if (word in dict) {
        code.push(...dict[word]);
      } else if (word === '\\') {
        break;
      } else if (word === '(') {
        paren_comment = true;
        continue;
      } else if (word === ':') {
        i++;
        pending_name = src[i];
        if (code_stack.length !== 0) {
          console.error('Error: Nested word definitions not allowed');
          process.exit(1);
        }
        code_stack.push(code.slice());
        code.length = 0;
      } else if (word === ';') {
        if (code_stack.length !== 1) {
          console.error('Error: ; without matching :');
          process.exit(1);
        }
        dict[pending_name] = code.slice();
        code.length = 0;
        code.push(...code_stack.pop());
        pending_name = 'bogus';
      } else {
        let num = '' + parseFloat(word);
        if (num.match(/^[-]?[0-9]+$/)) {
          num += '.0';
        }
        if (num === 'NaN') {
          num = '0.0';
        }
        code.push('dstack.push(' + num + ');');
      }
    }
  }
  
  code.push('return dstack; }; go');
  
  if (code.length > 2000) {
    console.error('Error: Code too long (>2000 statements)');
    process.exit(1);
  }
  
  return code;
}

// Read from stdin
let input = '';
process.stdin.on('data', chunk => input += chunk.toString());
process.stdin.on('end', () => {
  // Handle delimiter from file_watcher
  input = input.replace(/\n---END---\n/g, '');
  
  try {
    const compiled = compile(input);
    // Output as JSON array to stdout
    console.log(JSON.stringify(compiled));
  } catch (e) {
    console.error('Compilation error:', e.message);
    process.exit(1);
  }
});
