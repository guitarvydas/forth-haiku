# WebSocket Live Shader Development Pipeline

## Complete Architecture

```
haiku.forth  →  file_watcher.js  →  forth_compiler.js  →  stack_optimizer.js  →  wrap_function.js  →  ws_sender.js
     ↑                                                                                                      ↓
   (edit)                                                                                            (WebSocket)
                                                                                                          ↓
                                                                                                   renderer.html
                                                                                                  (live preview!)
```

## Setup (One-Time)

### 1. Install WebSocket Package

```bash
cd /home/claude
npm install ws
```

### 2. Copy Files to Outputs

```bash
cp /home/claude/file_watcher.js /mnt/user-data/outputs/
cp /home/claude/ws_sender.js /mnt/user-data/outputs/
cp /home/claude/renderer.html /mnt/user-data/outputs/
cp /home/claude/test_haiku.forth /mnt/user-data/outputs/
cp /home/claude/primrose.forth /mnt/user-data/outputs/
```

## Usage

### Step 1: Open Renderer in Browser

```bash
# Open renderer.html in your browser
# It will show "Connecting to WebSocket..."
open /home/claude/renderer.html
# or: xdg-open /home/claude/renderer.html (Linux)
# or: start /home/claude/renderer.html (Windows)
```

### Step 2: Start the Pipeline

In a terminal:

```bash
cd /home/claude

# For the simple test haiku:
echo "test_haiku.forth" | node file_watcher.js | \
  ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./wrap_function.js | \
  node ws_sender.js
```

Or for Primrose:

```bash
echo "primrose.forth" | node file_watcher.js | \
  ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./wrap_function.js | \
  node ws_sender.js
```

### Step 3: Edit and See Live Updates!

```bash
# In another terminal, edit the Forth file:
nano test_haiku.forth

# Try changing it to:
x y * t cos +

# Save the file - the browser will update automatically!
```

## What You'll See

1. **Terminal output:**
   ```
   Watching: test_haiku.forth
   WebSocket server listening on port 8080
   Waiting for browser connection...
   Browser connected!
   Sending 1234 bytes of code to 1 client(s)
   ```

2. **Browser shows:**
   - Live-rendered haiku canvas (512×512)
   - Connection status
   - The compiled JavaScript code
   - FPS counter
   - Animation controls

## Example Haikus to Try

### 1. Simple Gradient (test_haiku.forth)
```forth
x t sin + y +
```
Result: Animated diagonal gradient

### 2. Primrose (primrose.forth)
```forth
: i 2dup z* log ;
x .5 - y .5 - i i i log over
```
Result: Complex fractal pattern

### 3. Mouse-Interactive
```forth
\ Create new file: mouse_test.forth
mx x - my y - * 0 swap
```
Result: Interactive pattern that follows your mouse!

### 4. Animated Circles
```forth
\ Create new file: circles.forth
x .5 - dup * y .5 - dup * + sqrt t sin +
```
Result: Pulsing circle

## Pipeline Details

Each stage:

1. **file_watcher.js** - Watches Forth file, sends content on changes
2. **forth_compiler.js** - Compiles Forth to JSON array (stack operations)
3. **stack_optimizer.js** - Optimizes to temp variables (no stack ops)
4. **wrap_function.js** - Wraps in complete JavaScript function
5. **ws_sender.js** - Sends complete function via WebSocket
6. **renderer.html** - Receives, evals, renders to canvas

## Troubleshooting

### "Cannot find module 'ws'"
```bash
cd /home/claude
npm install ws
```

### "WebSocket connection refused"
Make sure ws_sender.js is running (step 2)

### "No code yet..."
Wait a few seconds, or edit the .forth file to trigger an update

### Red canvas
Check browser console (F12) for JavaScript errors

## Advanced: Creating Your Own Haikus

The Forth language available:

**Stack operations:** `dup`, `drop`, `swap`, `over`, `rot`, `2dup`

**Math:** `+`, `-`, `*`, `/`, `mod`, `sin`, `cos`, `tan`, `sqrt`, `abs`, `log`

**Variables:** `x`, `y` (pixel position 0..1), `t` (time), `dt` (delta time), `mx`, `my` (mouse position)

**Complex:** `z+`, `z*` (complex number operations)

**Control:** `if ... else ... then`

**User definitions:** `: name ... ;`

Output is RGBA (4 values):
- If you leave 1 value: R=value, G=0, B=0, A=1 (red channel)
- If you leave 3 values: RGB, A=1
- If you leave 4 values: RGBA

## Performance

- Compiles in ~10-50ms
- Sends update via WebSocket instantly
- Browser re-evals and starts rendering
- FPS depends on complexity (simple: 60fps, complex: 1-10fps)

CPU rendering is slow but works! For production, you'd convert to GLSL and use WebGL (like original haiku.js).

## Stop the Pipeline

Press `Ctrl+C` in the terminal running the pipeline.

The browser will show "Disconnected from WebSocket server".
