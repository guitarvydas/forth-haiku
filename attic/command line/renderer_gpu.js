// GPU Renderer - converts optimized JS to GLSL
const canvas = document.getElementById('canvas');
const statusEl = document.getElementById('status');
const glslEl = document.getElementById('glsl');
const fpsEl = document.getElementById('fps');
const modeEl = document.getElementById('mode');
const animateCheckbox = document.getElementById('animate');
const w = canvas.width;
const h = canvas.height;
let currentProgram = null, gl = null, useGPU = false;
let startTime = Date.now(), lastTime = 0, frameCount = 0, lastFpsUpdate = Date.now();
let mouseX = 0, mouseY = 0, mouseButtons = 0;
const memory = new Float32Array(16);

canvas.addEventListener('mousemove', (e) => {
  const rect = canvas.getBoundingClientRect();
  mouseX = (e.clientX - rect.left) / rect.width;
  mouseY = (e.clientY - rect.top) / rect.height;
});
canvas.addEventListener('mousedown', () => { mouseButtons |= 1; });
canvas.addEventListener('mouseup', () => { mouseButtons &= ~1; });

try {
  gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (gl) {
    const vertices = new Float32Array([-1,-1, 1,-1, 1,1, -1,-1, 1,1, -1,1]);
    const vbuffer = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, vbuffer);
    gl.bufferData(gl.ARRAY_BUFFER, vertices, gl.STATIC_DRAW);
    gl.vertexBuffer = vbuffer;
    console.log('WebGL ready');
  }
} catch (e) { console.log('No WebGL:', e); }

function convertToGLSL(jsCode) {
  const lines = jsCode.split('\n');
  const code = [];
  let started = false;
  
  for (let line of lines) {
    if (line.includes('var dstack = []') || line.includes('var work1')) { started = true; continue; }
    if (line.includes('return dstack')) break;
    if (started && line.trim()) code.push(line.trim());
  }
  
  for (let i = 0; i < code.length; i++) {
    code[i] = code[i].replace(/var /g, 'float ');
    code[i] = code[i].replace(/xpos/g, 'tpos.x');
    code[i] = code[i].replace(/ypos/g, 'tpos.y');
    code[i] = code[i].replace(/Math\./g, '');
    code[i] = code[i].replace(/atan2/g, 'atan');
    code[i] = code[i].replace(/sin/g, 'gsin');
    code[i] = code[i].replace(/cos/g, 'gcos');
    code[i] = code[i].replace(/([^a])tan/g, '$1gtan');
  }
  
  const lastPushes = [];
  while (code.length > 0 && code[code.length - 1].includes('dstack.push')) {
    lastPushes.unshift(code.pop());
  }
  
  const values = lastPushes.map(line => {
    const match = line.match(/dstack\.push\((.*)\);/);
    return match ? match[1] : '0.0';
  });
  
  while (values.length < 4) values.push('1.0');
  
  code.push(`gl_FragColor = vec4(${values.slice(0, 4).join(', ')});`);
  code.push('gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);');
  code.push('gl_FragColor.rgb *= gl_FragColor.a;');
  
  return `
precision highp float;
varying vec2 tpos;
uniform float time_val, time_delta_val, mouse_x, mouse_y, button_val;
uniform float memory_val[16];
float PI = 3.1415926535897931;
float PI2 = PI * 2.0;
float gsin(float v) { return sin(mod(v, PI2)); }
float gcos(float v) { return cos(mod(v, PI2)); }
float gtan(float v) { return tan(mod(v, PI2)); }
float mod(float v1, float v2) { return v1 - v2 * floor(v1 / v2); }
float hasbit(float v, float b) {
  b = floor(b);
  return mod(v, pow(2.0, b + 1.0)) >= pow(2.0, b) ? 1.0 : 0.0;
}
void main(void) {
  float work1, work2, work3, work4;
${code.map(l => '  ' + l).join('\n')}
}`;
}

function compileGLSLShader(jsCode) {
  if (!gl) return false;
  try {
    const glslCode = convertToGLSL(jsCode);
    glslEl.textContent = glslCode;
    
    const vshader = gl.createShader(gl.VERTEX_SHADER);
    gl.shaderSource(vshader, `
attribute vec2 ppos;
varying highp vec2 tpos;
void main(void) {
  tpos = (ppos + 1.0) / 2.0;
  gl_Position = vec4(ppos, 0.0, 1.0);
}`);
    gl.compileShader(vshader);
    if (!gl.getShaderParameter(vshader, gl.COMPILE_STATUS)) {
      console.error('Vshader:', gl.getShaderInfoLog(vshader));
      return false;
    }
    
    const fshader = gl.createShader(gl.FRAGMENT_SHADER);
    gl.shaderSource(fshader, glslCode);
    gl.compileShader(fshader);
    if (!gl.getShaderParameter(fshader, gl.COMPILE_STATUS)) {
      glslEl.textContent += '\n\nERROR:\n' + gl.getShaderInfoLog(fshader);
      return false;
    }
    
    const program = gl.createProgram();
    gl.attachShader(program, vshader);
    gl.attachShader(program, fshader);
    gl.linkProgram(program);
    if (!gl.getProgramParameter(program, gl.LINK_STATUS)) return false;
    
    const vattrib = gl.getAttribLocation(program, 'ppos');
    gl.enableVertexAttribArray(vattrib);
    gl.bindBuffer(gl.ARRAY_BUFFER, gl.vertexBuffer);
    gl.vertexAttribPointer(vattrib, 2, gl.FLOAT, false, 0, 0);
    
    currentProgram = program;
    return true;
  } catch (e) {
    glslEl.textContent += '\n\nERROR: ' + e.message;
    return false;
  }
}

const ws = new WebSocket('ws://localhost:8080');
ws.onopen = () => { statusEl.className = 'status connected'; statusEl.textContent = 'Connected'; };
ws.onmessage = (event) => {
  if (gl && compileGLSLShader(event.data)) {
    useGPU = true;
    modeEl.textContent = 'GPU';
    modeEl.style.color = '#0f0';
    statusEl.className = 'status gpu';
    statusEl.textContent = 'GPU shader compiled!';
  } else {
    statusEl.className = 'status error';
    statusEl.textContent = 'GPU failed - see GLSL';
  }
  startTime = Date.now();
};

function render() {
  if (useGPU && currentProgram && gl) {
    const now = Date.now();
    const time = (now - startTime) / 1000.0;
    const dt = time - lastTime;
    lastTime = time;
    
    gl.viewport(0, 0, w, h);
    gl.useProgram(currentProgram);
    gl.uniform1f(gl.getUniformLocation(currentProgram, 'time_val'), time);
    gl.uniform1f(gl.getUniformLocation(currentProgram, 'time_delta_val'), dt);
    gl.uniform1f(gl.getUniformLocation(currentProgram, 'mouse_x'), mouseX);
    gl.uniform1f(gl.getUniformLocation(currentProgram, 'mouse_y'), mouseY);
    gl.uniform1f(gl.getUniformLocation(currentProgram, 'button_val'), mouseButtons);
    gl.uniform1fv(gl.getUniformLocation(currentProgram, 'memory_val'), memory);
    gl.clearColor(0, 0, 0, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLES, 0, 6);
  }
  
  frameCount++;
  if (Date.now() - lastFpsUpdate > 1000) {
    fpsEl.textContent = frameCount;
    frameCount = 0;
    lastFpsUpdate = Date.now();
  }
  
  if (animateCheckbox.checked) requestAnimationFrame(render);
}
render();
animateCheckbox.addEventListener('change', () => { if (animateCheckbox.checked) render(); });
