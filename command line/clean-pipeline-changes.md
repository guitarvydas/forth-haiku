# Clean Pipeline Architecture Changes

## Goal
Separate compilation, optimization, and wrapping into three distinct phases, each outputting pure JSON arrays (except the final wrapper).

## Changes Summary

### 1. forth_compiler.js Changes

**Line 193** - Change from:
```javascript
const code = [FUNC_SIGNATURE + ' var dstack=[]; var rstack=[]; '];
```
To:
```javascript
const code = [];
```

**Line 255** - Delete entirely:
```javascript
code.push('return dstack; }; go');  // DELETE THIS LINE
```

**Result**: Outputs pure JSON array of body statements only.

---

### 2. stack_optimizer.js Changes

**Delete** the entire `const FUNC_SIGNATURE = ...` declaration

**Change BOGUS** to:
```javascript
const BOGUS = [
  'dstack.push(1.0);',
  'dstack.push(0.0);',
  'dstack.push(0.7);',
  'dstack.push(1.0);',
  'dstack.push(0.0);'
];
```

**Replace the ending section** (around the dstack padding and return):
```javascript
// OLD CODE (delete this):
  while (dstack.length < 4) {
    if (dstack.length === 3) {
      dstack.push('1.0');
    } else {
      dstack.push('0.0');
    }
  }
  
  code.push('return [' + dstack.join(', ') + ']; }; go');
  for (let i = 0; i < code.length; i++) {
    if (code[i].search(/stack/) >= 0) {
      return BOGUS;
    }
  }
  return code;

// NEW CODE (replace with this):
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
```

**Result**: Outputs pure JSON array of optimized statements that end with 4 pushes.

---

### 3. wrap_function.js (New File)

Already created and copied to outputs. This file:
- Takes a JSON array of statements
- Adds function signature and helper functions
- Adds variable declarations (dstack, rstack, work vars)
- Appends `return dstack; }; go`

---

## The New Pipeline

### Individual Steps:
```bash
# Pass 1: Forth → JSON array of dumb statements
cat haiku.forth | ./forth_compiler.js > pass1.json

# Pass 2: JSON array → JSON array of optimized statements
cat pass1.json | ./stack_optimizer.js > pass2.json

# Pass 3: JSON array → Complete JavaScript function
cat pass2.json | ./wrap_function.js > final.js
```

### Combined Pipeline:
```bash
cat haiku.forth | ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./wrap_function.js > output.js
```

### With Intermediate Inspection:
```bash
cat haiku.forth | ./forth_compiler.js | tee pass1.json | \
  ./stack_optimizer.js | tee pass2.json | \
  ./wrap_function.js > final.js

# Now you can study:
cat pass1.json | python -m json.tool  # See unoptimized statements
cat pass2.json | python -m json.tool  # See optimized statements
diff <(cat pass1.json | python -m json.tool) \
     <(cat pass2.json | python -m json.tool)  # Compare
```

---

## Output Examples

### forth_compiler.js output (pass1.json):
```json
[
  "dstack.push(xpos);",
  "dstack.push(ypos);",
  "dstack.push(dstack.pop() + dstack.pop());"
]
```

Pure array of statements with stack operations.

### stack_optimizer.js output (pass2.json):
```json
[
  "var temp1 = xpos;",
  "var temp2 = ypos;",
  "var temp3 = temp1 + temp2;",
  "dstack.push(temp3);",
  "dstack.push(0.0);",
  "dstack.push(0.0);",
  "dstack.push(1.0);"
]
```

Pure array of optimized statements ending with 4 pushes for RGBA.

### wrap_function.js output (final.js):
```javascript
var go = function(
  time_val, time_delta_val,
  xpos, ypos,
  mouse_x, mouse_y,
  button_val,
  memory) {
  var PI = Math.PI;
  // ... all helper functions ...
  var dstack = [];
  var rstack = [];
  var work1, work2, work3, work4;

  var temp1 = xpos;
  var temp2 = ypos;
  var temp3 = temp1 + temp2;
  dstack.push(temp3);
  dstack.push(0.0);
  dstack.push(0.0);
  dstack.push(1.0);

  return dstack;
};
go
```

Complete runnable JavaScript function.

---

## Benefits

1. **Clean Separation**: Each pass does exactly one thing
2. **Easy to Study**: Pure JSON arrays are easy to inspect and compare
3. **No Noise**: No function boilerplate in intermediate outputs
4. **Composable**: Can skip optimizer if you want unoptimized code
5. **Debuggable**: Can inspect pass1.json and pass2.json directly

---

## Testing

After making changes, test with:

```bash
# Simple test
echo "x y +" | ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./wrap_function.js > test.js

node -e "const f = eval(require('fs').readFileSync('test.js', 'utf8')); \
  console.log(f(0,0,0.3,0.4,0,0,0,new Float32Array(16)))"

# Expected output: [ 0.7, 0, 0, 1 ]
```

```bash
# Complex test (primrose)
cat << 'EOF' | ./forth_compiler.js | tee p1.json | \
  ./stack_optimizer.js | tee p2.json | \
  ./wrap_function.js > primrose.js
: i 2dup z* log ;
x .5 - y .5 - i i i log over
EOF

# Check sizes
echo "Pass 1: $(cat p1.json | python -m json.tool | wc -l) lines"
echo "Pass 2: $(cat p2.json | python -m json.tool | wc -l) lines"

# Run it
node -e "const f = eval(require('fs').readFileSync('primrose.js', 'utf8')); \
  console.log(f(0,0,0.5,0.5,0,0,0,new Float32Array(16)))"
```

---

## Files Modified/Created

- **forth_compiler.js** - Modified (remove wrapper code)
- **stack_optimizer.js** - Modified (remove wrapper code, fix BOGUS)
- **wrap_function.js** - Created (new wrapper tool)

All three tools now follow Unix philosophy: do one thing well, output clean data.
