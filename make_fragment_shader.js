#!/usr/bin/env node
'use strict';

// Usage: receives optimized JSON array, outputs GLSL shader code
// Input: JSON array with EOF marker
// Output: GLSL shader code string with EOF marker

function makeFragmentShader(inputCode) {
  const prefix = [
    'precision highp float;',
    'varying vec2 tpos;',
    'uniform float time_val, time_delta_val, button_val, mouse_x, mouse_y;',
    'uniform float memory_val[16];',
    'float memory[16]; float audio_sample;'
  ];
  
  const main = [
    'void main(void) {',
    'float work1, work2, work3, work4, seed;',
    'for (int i = 0; i < 16; ++i) { memory[i] = memory_val[i]; }'
  ];
  
  // Start with prefix + main + user code (NO helpers yet!)
  let code = prefix.concat(main).concat(inputCode);
  
  // Do replacements on user code
  for (let i = 0; i < code.length; i++) {
    code[i] = code[i].replace(/var /g, 'float ');
    code[i] = code[i].replace(/xpos/g, 'tpos.x');
    code[i] = code[i].replace(/ypos/g, 'tpos.y');
    code[i] = code[i].replace(/Math\./g, '');
    code[i] = code[i].replace(/\bsin\(/g, 'gsin(');
    code[i] = code[i].replace(/\bcos\(/g, 'gcos(');
    code[i] = code[i].replace(/\btan\(/g, 'gtan(');
    const pushMatch = code[i].match(/dstack\.push\((.*)\);/);
    if (pushMatch) code[i] = '// PUSH: ' + pushMatch[1];
  }
  
  // NOW add helper functions AFTER replacements
  const helpers = [
    'float gsin(float v) { return sin(mod(v, 6.283185307)); }',
    'float gcos(float v) { return cos(mod(v, 6.283185307)); }',
    'float gtan(float v) { return tan(mod(v, 6.283185307)); }',
    'float hasbit(float v, float b) { b = floor(b); return mod(v, pow(2.0, b + 1.0)) >= pow(2.0, b) ? 1.0 : 0.0; }',
    'float load(float a) { int ai = int(mod(floor(a), 16.0)); for (int i = 0; i < 16; ++i) { if (i == ai) return memory[i]; } return 0.0; }',
    'void store(float v, float a) { int ai = int(mod(floor(a), 16.0)); for (int i = 0; i < 16; ++i) { if (i == ai) memory[i] = v; } }'
  ];
  
  code.splice(prefix.length, 0, ...helpers);
  
  // Collect RGBA values
  const rgbaValues = [];
  for (let i = code.length - 1; i >= 0 && rgbaValues.length < 4; i--) {
    const match = code[i].match(/^\/\/ PUSH: (.+)$/);
    if (match) { 
      rgbaValues.unshift(match[1]); 
      code.splice(i, 1); 
    }
  }
  
  if (rgbaValues.length === 4) {
    code.push('  gl_FragColor = vec4(' + rgbaValues.join(', ') + ');');
  } else {
    code.push('  gl_FragColor = vec4(1.0, 0.0, 0.0, 1.0);');
  }
  
  code.push('  gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);');
  code.push('  gl_FragColor.rgb *= gl_FragColor.a;');
  code.push('}');
  
  return code.join('\n');
}

// Read from stdin - process when we see EOF marker
let buffer = '';

process.stdin.on('data', chunk => {
  buffer += chunk.toString();
  
  const markerIdx = buffer.indexOf('// ---EOF---');
  if (markerIdx >= 0) {
    const input = buffer.substring(0, markerIdx).trim();
    buffer = buffer.substring(markerIdx + 12);
    
    if (input) {
      try {
        const statements = JSON.parse(input);
        
        if (!Array.isArray(statements)) {
          throw new Error('Input must be a JSON array');
        }
        
        const glslCode = makeFragmentShader(statements);
        console.log(glslCode);
        console.log('// ---EOF---');
        
      } catch (e) {
        console.error('GLSL conversion error:', e.message);
      }
    }
  }
});
