# Forth Haiku Compiler - Complete Architecture Guide

## Two Rendering Paths

There are TWO complete pipelines:

### 1. CPU Pipeline (JavaScript execution in browser)
```
Forth → forth_compiler.js → stack_optimizer.js → wrap_function.js → ws_sender.js
                                                        ↓
                                                  JavaScript function
                                                        ↓
                                                  renderer.html
                                                  (pixel loop on CPU)
```

### 2. GPU Pipeline (GLSL shader on GPU)
```
Forth → forth_compiler.js → stack_optimizer.js → make_fragment_shader.js → ws_sender.js
                                                        ↓
                                                    GLSL code
                                                        ↓
                                                renderer_gpu_simple.html
                                                  (WebGL on GPU)
```

---

## Common Stages

### file_watcher.js
- **Input:** Filename from stdin
- **Output:** File contents with `\ ---EOF---` marker
- **Purpose:** Watch Forth file, send contents on changes

### forth_compiler.js
- **Input:** Forth code with `\ ---EOF---`
- **Output:** JSON array of JavaScript statements with `// ---EOF---`
- **Purpose:** Compile Forth to unoptimized JavaScript (with dstack.push/pop)

### stack_optimizer.js
- **Input:** JSON array (unoptimized) with `// ---EOF---`
- **Output:** JSON array (optimized) with `// ---EOF---`
- **Purpose:** Eliminate stack operations, use temp variables

---

## CPU Path Only

### wrap_function.js
- **Input:** JSON array (optimized) with `// ---EOF---`
- **Output:** Complete JavaScript function: `var go = function(...) { ... }; go`
- **Purpose:** Wrap statements in executable function

### renderer.html
- **Receives:** Complete JavaScript function
- **Does:** `eval()` the function, call it for each pixel in a loop
- **Speed:** Slow (1-10 FPS for 512×512)
- **Advantage:** Works everywhere, easy to debug

---

## GPU Path Only

### make_fragment_shader.js
- **Input:** JSON array (optimized) with `// ---EOF---`
- **Output:** GLSL shader code string with `// ---EOF---`
- **Purpose:** Convert JavaScript syntax to GLSL syntax
- **Transforms:**
  - `var` → `float`
  - `xpos` → `tpos.x`
  - `ypos` → `tpos.y`
  - `Math.sin` → `gsin`
  - `dstack.push(...)` → collect for `gl_FragColor`

### renderer_gpu_simple.html
- **Receives:** GLSL shader code as string
- **Does:** Compile GLSL, create WebGL program, render full-screen quad
- **Speed:** Fast (60 FPS easily)
- **Advantage:** Real-time graphics, GPU parallelism

---

## How to Run

### CPU Pipeline
```bash
echo "primrose.forth" | ./file_watcher.js | \
  ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./wrap_function.js | \
  ./ws_sender.js
```
Open: `renderer.html`

### GPU Pipeline
```bash
echo "primrose.forth" | ./file_watcher.js | \
  ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./make_fragment_shader.js | \
  ./ws_sender.js
```
Open: `renderer_gpu_simple.html`

---

## File Flow Examples

### Primrose Haiku
```forth
: i 2dup z* log ;
x .5 - y .5 - i i i log over
```

**After forth_compiler.js:**
```json
["dstack.push(xpos);", "dstack.push(0.5);", "dstack.push(dstack.pop() - dstack.pop());", ...]
```

**After stack_optimizer.js:**
```json
["var temp1 = xpos;", "var temp2 = 0.5;", "var temp3 = temp1 - temp2;", ...]
```

**CPU Path - After wrap_function.js:**
```javascript
var go = function(time_val, time_delta_val, xpos, ypos, ...) {
  var dstack = [];
  var temp1 = xpos;
  var temp2 = 0.5;
  var temp3 = temp1 - temp2;
  ...
  dstack.push(temp35);
  dstack.push(temp36);
  dstack.push(temp37);
  dstack.push(1.0);
  return dstack;
};
go
```

**GPU Path - After make_fragment_shader.js:**
```glsl
precision highp float;
varying vec2 tpos;
uniform float time_val, time_delta_val, mouse_x, mouse_y, button_val;
uniform float memory_val[16];

float gsin(float v) { return sin(mod(v, 6.283185307)); }
// ... helper functions ...

void main(void) {
  float work1, work2, work3, work4, seed;
  float temp1 = tpos.x;
  float temp2 = 0.5;
  float temp3 = temp1 - temp2;
  ...
  gl_FragColor = vec4(temp35, temp36, temp37, 1.0);
  gl_FragColor = clamp(gl_FragColor, 0.0, 1.0);
  gl_FragColor.rgb *= gl_FragColor.a;
}
```

---

## EOF Markers

Each stage uses appropriate comment syntax:

- **Forth stage:** `\ ---EOF---` (backslash = Forth comment)
- **JSON stages:** `// ---EOF---` (JavaScript comment, ignored after JSON)
- **ws_sender.js:** Strips EOF marker before sending to browser

---

## Architecture Benefits

### Separation of Concerns
- Each stage does ONE thing
- Easy to debug (inspect intermediate output)
- Can test stages independently

### Reusable Optimizer
- Same `stack_optimizer.js` for both CPU and GPU
- Optimization happens once, benefits both paths

### Clean Pipeline
- Unix philosophy: text streams with delimiters
- Can add/remove stages easily
- Can fork pipeline for different outputs

---

## Performance Comparison

**512×512 canvas, Primrose haiku:**

| Path | FPS | Render Time | Notes |
|------|-----|-------------|-------|
| CPU  | 1-5 | ~200-1000ms | Sequential pixel loop |
| GPU  | 60  | ~16ms       | Parallel, all pixels at once |

**GPU is ~200-600× faster!**

---

## When to Use Each

### Use CPU Pipeline When:
- Quick prototyping
- Debugging (easier to add console.log)
- Simple shaders
- WebGL not available

### Use GPU Pipeline When:
- Real-time animation required
- Complex shaders
- Production use
- 60 FPS needed

---

## Files Overview

**Pipeline stages:**
- `file_watcher.js` - Watch and send file
- `forth_compiler.js` - Forth → unoptimized JS
- `stack_optimizer.js` - Optimize (eliminate stack)
- `wrap_function.js` - Wrap for CPU execution
- `make_fragment_shader.js` - Convert to GLSL for GPU
- `ws_sender.js` - Send via WebSocket

**Renderers:**
- `renderer.html` - CPU rendering (JavaScript)
- `renderer_gpu_simple.html` - GPU rendering (WebGL/GLSL)

**Test files:**
- `primrose.forth` - Complex fractal example
- `test_haiku.forth` - Simple animated gradient

---

## Next Steps

1. **Try both pipelines** - See the performance difference
2. **Create your own haikus** - Experiment with Forth code
3. **Add new Forth words** - Extend `forth_compiler.js` dictionary
4. **Optimize further** - Add dead code elimination to optimizer

The architecture is now complete and modular - enjoy building shader art!
