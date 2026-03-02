# Forth Haiku: Inside the Optimizer

## Part 4: Optimization Techniques

We've seen what the optimizer does (Part 2) and how it fits into a larger architecture (Part 3). Now let's look at **how it works**—the algorithms and techniques that make static stack analysis possible.

### The Core Idea: Symbolic Execution

The optimizer doesn't execute the code—it **simulates** execution at compile-time using symbolic values instead of concrete numbers.

Instead of tracking "the stack contains the value 42," it tracks "the stack contains temp1, which holds xpos."

This symbolic execution lets the optimizer:
1. Track what's on the stack at every point
2. Know which temporary variable to use instead of pushing/popping
3. Verify that branches leave the stack balanced

### The Simulation Loop

Here's the optimizer's main loop, simplified:

```javascript
let dstack = [];  // Simulated data stack
let tmp_index = 1;

for (let i = 0; i < code.length; i++) {
  // Handle push operations
  if (code[i].match(/^dstack\.push\((.*)\);$/)) {
    let tmp = 'temp' + tmp_index++;
    code[i] = 'var ' + tmp + ' = ' + expr + ';';
    dstack.push(tmp);  // Track temp variable name
  }
  
  // Handle pop operations
  if (code[i].search(/dstack\.pop\(\)/) >= 0) {
    let tmp = dstack.pop();  // Get variable name
    code[i] = code[i].replace(/dstack\.pop\(\)/, tmp);
  }
}
```

When it sees `dstack.push(xpos)`, it generates `var temp1 = xpos` and records that the stack now contains `['temp1']`.

When it sees `dstack.pop()`, it replaces it with `temp1` and removes it from the simulated stack.

The original stack operations are transformed into direct variable references.

### Example Walkthrough

Let's trace through `x dup +`:

```javascript
// Initial state
code = ['dstack.push(xpos);',
        'work1 = dstack.pop(); dstack.push(work1); dstack.push(work1);',
        'dstack.push(dstack.pop() + dstack.pop());']
dstack = []
tmp_index = 1

// Step 1: Process 'dstack.push(xpos)'
code[0] = 'var temp1 = xpos;'
dstack = ['temp1']
tmp_index = 2

// Step 2: Process 'dup' (simplified for clarity)
// First dstack.pop() in work1 = dstack.pop()
code[1] = 'work1 = temp1; dstack.push(work1); dstack.push(work1);'
dstack = []

// Then the two pushes
code[1] = 'var temp2 = work1;'  // (and more temp variables for the second push)
dstack = ['temp2', 'temp3']  
tmp_index = 4

// Step 3: Process addition
// Replace dstack.pop() + dstack.pop() with temp3 + temp2
code[2] = 'var temp4 = temp3 + temp2;'
dstack = ['temp4']
```

At the end, `dstack` contains just `['temp4']`, which becomes the return value.

### Handling Control Flow

Control flow is where it gets interesting. The optimizer must ensure that both branches of an `if` statement leave the stack at the same depth.

```javascript
if (code[i] === 'if(...)  {') {
  // Save current stack state
  let saved = dstack.slice(0);
  branch_stack.push(saved);
}

if (code[i] === '} else {') {
  // Check that stack depth matches
  let saved = branch_stack.pop();
  if (dstack.length !== saved.length) {
    return BOGUS;  // Stack imbalanced!
  }
  // Reset to saved state for else branch
  dstack = saved;
}

if (code[i] === '}') {
  let saved = branch_stack.pop();
  if (dstack.length !== saved.length) {
    return BOGUS;  // Branches leave different depths!
  }
}
```

This ensures static stack balance: the code won't compile if the `if` and `else` branches consume or produce different numbers of stack values.

### The Fixup Dance

What if the two branches create different temporary variables but the same stack depth?

```forth
x 0 > if 1 else 0.5 then
```

After the `if` branch, we might have `temp5` on the stack.
After the `else` branch, we might have `temp7` on the stack.

They're different variables, but both represent "the top stack value after this conditional."

The optimizer creates a **fixup variable** to reconcile them:

```javascript
var tempN;
if (...) {
  tempN = temp5;
} else {
  tempN = temp7;
}
```

Now the code after the `if` statement can use `tempN` consistently, regardless of which branch executed.

This is **φ-function** behavior from SSA (Static Single Assignment) form, discovered independently in this optimizer.

### Return Stack Handling

Forth has two stacks: the data stack and the return stack. The optimizer tracks both:

```javascript
let dstack = [];
let rstack = [];

// For >r (move from data to return stack)
if (word === '>r') {
  let tmp = dstack.pop();
  rstack.push(tmp);
}

// For r> (move from return to data stack)
if (word === 'r>') {
  let tmp = rstack.pop();
  dstack.push(tmp);
}
```

The return stack is mainly used for temporary storage in Forth, and the optimizer tracks it the same way it tracks the data stack.

### Failure Modes

The optimizer can fail for several reasons:

**Stack Underflow**
```forth
drop  \ Nothing to drop!
```
`dstack.pop()` when `dstack` is empty → BOGUS

**Unbalanced Branches**
```forth
if 1 2 else 3 then  \ If leaves 2 values, else leaves 1
```
Branch depths don't match → BOGUS

**Too Many Values**
```forth
1 2 3 4 5 6 7 8  \ Way more than 4 RGBA values
```
More than 4 values at end → BOGUS

**Infinite Loops**
```forth
: forever 1 forever ;  \ Recursive without exit
```
Code length exceeds limit → BOGUS

In all these cases, the optimizer returns fallback code that renders a default color.

### Why This Works

The optimizer succeeds because Forth has **static stack effects**. Each word consumes and produces a known number of stack values. There are no:
- Dynamic stack depths
- Stack introspection
- Variable-length operations

This makes symbolic execution tractable. The optimizer can reason about all possible executions without actually executing anything.

### The Broader Pattern

This optimization technique appears in many compilers:

**JVM → Native Code**: JIT compilers optimize stack-based bytecode similarly

**Python Bytecode**: CPython's peephole optimizer does limited stack analysis

**WebAssembly**: WASM's stack machine gets compiled to registers using similar techniques

The haiku.js optimizer implements ideas from production compilers in ~100 lines of readable JavaScript.

### Coming Up

In Part 5, we'll examine the dictionary-based code generation in Phase 1. How does a simple lookup table generate correct code? What makes this approach extensible? And why is "dumb code generation" sometimes the smartest choice?

---

*Part 4 of the Forth Haiku series. [Read Part 1: Overview](article_01_overview.md) | [Read Part 2: Examples](article_02_examples.md) | [Read Part 3: Pipeline Architecture](article_03_pipeline.md)*
