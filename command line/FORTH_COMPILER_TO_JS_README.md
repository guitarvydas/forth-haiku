# forth_compiler_to_js.js

A Forth-to-JavaScript compiler that outputs complete JavaScript functions.

## Usage

```bash
cat haiku.forth | ./forth_compiler_to_js.js > output.js
```

## Input

Forth source code from stdin. Example:

```forth
\ This is a comment
: square dup * ;
x square y square + sqrt
```

## Output

A complete JavaScript function to stdout:

```javascript
var go = function(
  time_val, time_delta_val,
  xpos, ypos,
  mouse_x, mouse_y,
  button_val,
  memory) {
  var PI = Math.PI;
  // ... helper functions ...
  
  var dstack = [];
  var rstack = [];
  var work1, work2, work3, work4;

  
  // Compiled Forth code here
  dstack.push(xpos);
  work1 = dstack.pop();
  dstack.push(work1);
  dstack.push(work1);
  dstack.push(dstack.pop() * dstack.pop());
  // ... etc ...
  
  return dstack;
};
go
```

## Examples

### Simple example

```bash
echo "x y +" | ./forth_compiler_to_js.js
```

Output: JavaScript function that adds x and y coordinates.

### From file

```bash
cat example_red.forth | ./forth_compiler_to_js.js > red.js
```

This creates a standalone JavaScript file that can be:
- Eval'd in a browser
- Passed to an optimizer
- Saved for later use

### With user-defined words

```bash
cat << 'EOF' | ./forth_compiler_to_js.js
: square dup * ;
: distance x square y square + sqrt ;
distance
EOF
```

Output: Complete function with the `square` word compiled inline.

## Difference from forth_compiler.js

**forth_compiler.js** (original):
- Input: Forth source
- Output: JSON array of JavaScript statements
- Usage: Part of a pipeline with stack_optimizer.js

**forth_compiler_to_js.js** (this version):
- Input: Forth source
- Output: Complete JavaScript function
- Usage: Standalone, produces runnable code

## Output Format

The generated function has this signature:

```javascript
var go = function(
  time_val,      // Current time value
  time_delta_val, // Time since last frame
  xpos,          // X coordinate (0-1)
  ypos,          // Y coordinate (0-1)
  mouse_x,       // Mouse X coordinate
  mouse_y,       // Mouse Y coordinate
  button_val,    // Button state
  memory         // Persistent memory array
)
```

Returns: An array (the data stack) which should contain 4 values for RGBA.

## Running the Output

To execute the generated JavaScript:

```javascript
// In Node.js
const code = require('fs').readFileSync('output.js', 'utf8');
const func = eval(code);
const result = func(0, 0, 0.5, 0.5, 0, 0, 0, new Float32Array(16));
console.log(result); // [R, G, B, A, ...]
```

```javascript
// In browser
const code = await fetch('output.js').then(r => r.text());
const func = eval(code);
const result = func(0, 0, 0.5, 0.5, 0, 0, 0, new Float32Array(16));
// Use result for rendering
```

## Supported Forth Words

### Stack Operations
- `dup` `drop` `swap` `over` `rot` `2dup`

### Arithmetic
- `+` `-` `*` `/` `mod`

### Math Functions
- `sin` `cos` `tan` `sqrt` `abs` `log`

### Comparisons
- `>` `<` `=`

### Control Flow
- `if` `else` `then`

### Variables
- `x` `y` `t` `dt` `mx` `my` `button`

### Memory
- `@` (fetch) `!` (store)

### Return Stack
- `>r` `r>` `r@`

### Complex Numbers
- `z+` (complex add)
- `z*` (complex multiply)

### Comments
- `\` (line comment)
- `( ... )` (inline comment)

### User Definitions
- `: name ... ;` (define new word)

## Pipeline Usage

You can still use this in a pipeline:

```bash
# Generate unoptimized JavaScript
cat haiku.forth | ./forth_compiler_to_js.js > unoptimized.js

# (Optional) Pass to an optimizer
# node optimize_js.js < unoptimized.js > optimized.js

# Run directly
node -e "const f = $(cat unoptimized.js); console.log(f(0,0,0.5,0.5,0,0,0,new Float32Array(16)))"
```

## Differences from Original Pipeline

**Original pipeline:**
```
forth_compiler.js → JSON → stack_optimizer.js → JSON → prepare_message.js → ws_sender.js
```

**Using this version:**
```
forth_compiler_to_js.js → JavaScript file (runnable immediately)
```

This version is useful when you:
- Want standalone JavaScript files
- Don't need the optimizer
- Want to inspect the generated code
- Need to run the code outside the pipeline

## Notes

- The output is "dumb" code with explicit stack operations
- No optimization is performed
- The code is verbose but correct
- For optimized code, use the original pipeline with stack_optimizer.js
