# Forth Haiku Pipeline System

A modular, Unix-style pipeline for compiling and rendering Forth haiku visual programs.

## Architecture

This system is built as 5 independent parts following the Unix philosophy:

```
┌──────────────────┐
│ Part 1:          │  Forth source
│ file_watcher.js  │  (watches file)
└────────┬─────────┘
         │ stdout
         ▼
┌──────────────────┐
│ Part 2:          │  JavaScript array
│ forth_compiler.js│  (with stack ops)
└────────┬─────────┘
         │ stdout
         ▼
┌──────────────────┐
│ Part 3:          │  JavaScript array
│ stack_optimizer  │  (optimized)
└────────┬─────────┘
         │ stdout
         ▼
┌──────────────────┐
│ Part 4:          │  ──WebSocket──▶
│ ws_sender.js     │
└──────────────────┘
                                    ┌──────────────────┐
                                    │ Part 5:          │  Canvas
                                    │ renderer.html    │  pixels
                                    └──────────────────┘
```

## Installation

```bash
# Make scripts executable
chmod +x file_watcher.js
chmod +x forth_compiler.js
chmod +x stack_optimizer.js
chmod +x ws_sender.js
chmod +x ws_server.js

# Install dependencies (WebSocket library)
npm install ws
```

## Quick Start

**Terminal 1 - Start the WebSocket server:**
```bash
./ws_server.js
# Opens on http://localhost:8080
```

**Terminal 2 - Open browser:**
```
Open http://localhost:8080 in your browser
```

**Terminal 3 - Run the pipeline:**
```bash
# One-shot: compile and send
cat example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js

# Watch mode: auto-recompile on file changes
./file_watcher.js example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js
```

## Usage Examples

### Basic Pipeline

```bash
# Compile a single haiku
cat example_circle.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js
```

### Debug Individual Stages

```bash
# See compiler output
echo "x y +" | ./forth_compiler.js | jq

# See optimizer output
echo "x y +" | ./forth_compiler.js | ./stack_optimizer.js | jq

# Save intermediate results
echo "x y +" | ./forth_compiler.js | tee unoptimized.json | ./stack_optimizer.js | tee optimized.json | ./ws_sender.js
```

### Watch Mode

```bash
# Edit example_gradient.forth in your editor
# The pipeline will auto-recompile on save
./file_watcher.js example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js
```

### Skip Optimizer (for debugging)

```bash
cat example.forth | ./forth_compiler.js | ./ws_sender.js
```

## Forth Language Reference

### Stack Operations
- `dup` - Duplicate top of stack
- `drop` - Remove top of stack
- `swap` - Swap top two items
- `over` - Copy second item to top
- `rot` - Rotate top three items

### Arithmetic
- `+` `-` `*` `/` - Basic math
- `sin` `cos` `tan` - Trigonometry
- `sqrt` `abs` `floor` `ceil` - Math functions
- `mod` `pow` - Modulo and power

### Variables
- `x` `y` - Pixel coordinates (0.0 to 1.0)
- `mx` `my` - Mouse coordinates
- `t` `dt` - Time and delta time
- `pi` `random` - Constants

### Control Flow
- `if ... else ... then` - Conditional
- `: name ... ;` - Define new word

### Memory
- `@` - Load from memory
- `!` - Store to memory

### Output
Return 4 values (RGBA): `red green blue alpha`
Each value should be 0.0 to 1.0

## Example Programs

### Gradient
```forth
x dup dup 1
```
Returns: [x, x, x, 1] - grayscale gradient

### Red Circle
```forth
x 0.5 - dup *
y 0.5 - dup *
+ sqrt 0.3 <
if 1 0 0 1
else 0 0 0 1
then
```

### Animated Pulse
```forth
t sin 0.5 * 0.5 +
dup dup 1
```

## Pipeline Part Details

### Part 1: file_watcher.js
- Watches a Forth source file
- Outputs file contents on change
- Adds `---END---` delimiter

### Part 2: forth_compiler.js
- Compiles Forth to JavaScript
- Uses stack-based operations
- Outputs JSON array of JS statements

### Part 3: stack_optimizer.js
- Converts stack operations to temp variables
- Performs dataflow analysis
- Outputs optimized JSON array

### Part 4: ws_sender.js
- Joins JS array into single string
- Sends over WebSocket to browser
- Reports success/failure

### Part 5: renderer.html
- Receives JavaScript via WebSocket
- Evals to executable function
- Renders pixel-by-pixel to canvas

## Testing Individual Parts

```bash
# Test compiler
echo "x y +" | ./forth_compiler.js
# Output: JSON array of JavaScript statements

# Test optimizer
echo '["var dstack=[];", "dstack.push(1);", "return dstack;"]' | ./stack_optimizer.js
# Output: Optimized JSON array

# Test sender (requires server running)
echo '["var go = function() { return [1,0,0,1]; }; go"]' | ./ws_sender.js
```

## Extending the Pipeline

Each part is independent and can be:
- **Replaced**: Write your own optimizer in Python
- **Chained**: Add more stages (e.g., linter, type checker)
- **Forked**: Send to multiple renderers simultaneously
- **Debugged**: Insert `tee` or logging at any stage

Example - Add a pretty-printer:
```bash
cat haiku.forth | ./forth_compiler.js | ./pretty_print.js | ./stack_optimizer.js | ./ws_sender.js
```

## Troubleshooting

**WebSocket connection fails:**
- Ensure `ws_server.js` is running
- Check browser console for errors
- Verify port 8080 is available

**Code doesn't compile:**
- Check Forth syntax (balanced stack)
- Look for unclosed `if` statements
- Ensure words are defined before use

**Render appears black:**
- Check output values are 0.0-1.0 range
- Verify 4 values returned (RGBA)
- Look for NaN in calculations

## License

MIT - Feel free to modify and extend!
