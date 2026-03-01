## Step-by-Step: How Pass 2 Optimizes `x y +`

### Input to stack_optimizer.js:
```json
[
  "dstack.push(xpos);",
  "dstack.push(ypos);",
  "dstack.push(dstack.pop() + dstack.pop());"
]
```

---

## The Optimizer's Main Loop

The optimizer maintains:
- **`code[]`** - the output statements being built
- **`dstack[]`** - simulated stack (holds temp variable names, not values)
- **`tmp_index`** - counter for creating temp variables (temp1, temp2, temp3...)

---

## Processing Statement 1: `"dstack.push(xpos);"`

### Step 1.1: Replace dstack.pop() calls
```javascript
// No dstack.pop() in this statement, skip this step
```

### Step 1.2: Handle dstack.push()
```javascript
// Pattern: dstack.push(VALUE)
// Extract VALUE: "xpos"

// Create temp variable
var tmpname = 'temp' + tmp_index;  // tmp_index = 1 → 'temp1'
tmp_index++;  // Now tmp_index = 2

// Generate assignment
code.push('var temp1 = xpos;');

// Add to simulated stack
dstack.push('temp1');
```

**State after statement 1:**
- `code = ['var temp1 = xpos;']`
- `dstack = ['temp1']`  ← simulated stack
- `tmp_index = 2`

---

## Processing Statement 2: `"dstack.push(ypos);"`

### Step 2.1: Replace dstack.pop() calls
```javascript
// No dstack.pop() in this statement, skip
```

### Step 2.2: Handle dstack.push()
```javascript
// Pattern: dstack.push(VALUE)
// Extract VALUE: "ypos"

// Create temp variable
var tmpname = 'temp2';  // tmp_index = 2
tmp_index++;  // Now tmp_index = 3

// Generate assignment
code.push('var temp2 = ypos;');

// Add to simulated stack
dstack.push('temp2');
```

**State after statement 2:**
- `code = ['var temp1 = xpos;', 'var temp2 = ypos;']`
- `dstack = ['temp1', 'temp2']`
- `tmp_index = 3`

---

## Processing Statement 3: `"dstack.push(dstack.pop() + dstack.pop());"`

This is the interesting one! It has **two** `dstack.pop()` calls.

### Step 3.1: Replace dstack.pop() calls

The optimizer has a loop that replaces **each** `dstack.pop()` with a variable from the simulated stack:

```javascript
// Start with: "dstack.push(dstack.pop() + dstack.pop());"
var s = "dstack.push(dstack.pop() + dstack.pop());";

// Loop finds first dstack.pop()
while (s.search(/dstack\.pop\(\)/) >= 0) {
  // Pop from simulated stack (LIFO - top first)
  var top = dstack.pop();  // top = 'temp2' (was at top)
  
  // Replace FIRST occurrence of dstack.pop() with temp2
  s = s.replace(/dstack\.pop\(\)/, top);
  // Now: "dstack.push(temp2 + dstack.pop());"
}

// Loop continues, finds second dstack.pop()
while (s.search(/dstack\.pop\(\)/) >= 0) {
  var top = dstack.pop();  // top = 'temp1' (next on stack)
  
  // Replace FIRST occurrence of dstack.pop() with temp1
  s = s.replace(/dstack\.pop\(\)/, top);
  // Now: "dstack.push(temp2 + temp1);"
}
```

**After replacing pops:**
- `s = "dstack.push(temp2 + temp1);"`
- `dstack = []`  ← simulated stack is now empty!

### Step 3.2: Handle dstack.push()

```javascript
// Pattern: dstack.push(VALUE)
// Extract VALUE: "temp2 + temp1"

// Create temp variable
var tmpname = 'temp3';  // tmp_index = 3
tmp_index++;  // Now tmp_index = 4

// Generate assignment
code.push('var temp3 = temp2 + temp1;');

// Add to simulated stack
dstack.push('temp3');
```

**State after statement 3:**
- `code = ['var temp1 = xpos;', 'var temp2 = ypos;', 'var temp3 = temp2 + temp1;']`
- `dstack = ['temp3']`  ← just the result!
- `tmp_index = 4`

---

## Padding to 4 Values (RGBA)

```javascript
// Verify no stack operations remain
for (let i = 0; i < code.length; i++) {
  if (code[i].search(/stack/) >= 0) {
    return BOGUS;  // If any stack ops remain, optimization failed
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
```

**After padding:**
- `dstack = ['temp3', '0.0', '0.0', '1.0']`

---

## Generate Final Pushes

Now we push the simulated stack values back onto the **runtime** dstack:

```javascript
// Push final values onto runtime dstack for wrapper's 'return dstack;'
for (let i = 0; i < dstack.length; i++) {
  code.push('dstack.push(' + dstack[i] + ');');
}
```

**Final code array:**
```javascript
code = [
  'var temp1 = xpos;',
  'var temp2 = ypos;',
  'var temp3 = temp2 + temp1;',
  'dstack.push(temp3);',   // Push R
  'dstack.push(0.0);',      // Push G
  'dstack.push(0.0);',      // Push B
  'dstack.push(1.0);'       // Push A
]

return code;
```

---

## Output as JSON:

```json
[
  "var temp1 = xpos;",
  "var temp2 = ypos;",
  "var temp3 = temp2 + temp1;",
  "dstack.push(temp3);",
  "dstack.push(0.0);",
  "dstack.push(0.0);",
  "dstack.push(1.0);"
]
```

---

## Summary: What Was Optimized

### Before (Pass 1):
```javascript
dstack.push(xpos);                          // Push to array
dstack.push(ypos);                          // Push to array
dstack.push(dstack.pop() + dstack.pop());   // Pop from array, compute, push to array
// 3 array operations, 2 pops + 3 pushes
```

### After (Pass 2):
```javascript
var temp1 = xpos;       // Direct variable
var temp2 = ypos;       // Direct variable
var temp3 = temp2 + temp1;  // Direct computation
dstack.push(temp3);     // Push result
dstack.push(0.0);       // Pad
dstack.push(0.0);       // Pad
dstack.push(1.0);       // Pad
// 0 intermediate array operations! Just final 4 pushes for output
```

---

## Key Optimizations:

1. **Eliminated intermediate stack operations** - No push/pop during computation
2. **Used local variables** - `temp1`, `temp2`, `temp3` instead of array indexing
3. **Symbolic execution** - Simulated stack tracked variable names, not values
4. **RGBA padding** - Ensured exactly 4 output values for color

**Result:** Much faster! No array allocations, bounds checking, or memory operations during the core computation.
