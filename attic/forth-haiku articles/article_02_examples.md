# Forth Haiku: From Dumb to Smart Code

## Part 2: Compilation Examples

In Part 1, we looked at the two-phase compilation strategy. Now let's see it in action with concrete examples.

### Example 1: A Simple Expression

Let's start with a trivial Forth program:

```forth
x dup *
```

This takes the x-coordinate, duplicates it, and multiplies them together (effectively `x²`).

#### Phase 1: The Dumb Code

The first phase generates this JavaScript:

```javascript
var go = function(time_val, time_delta_val, xpos, ypos, mouse_x, mouse_y, button_val, memory) {
  var dstack = [];
  var rstack = [];
  
  dstack.push(xpos);           // x
  
  work1 = dstack.pop();        // dup
  dstack.push(work1);
  dstack.push(work1);
  
  dstack.push(dstack.pop() * dstack.pop());  // *
  
  return dstack;
};
```

Notice the characteristics of dumb code:
- Explicit runtime stacks (`dstack`, `rstack`)
- Lots of push/pop operations
- Temporary work variables (`work1`)
- Stack operations even for simple arithmetic

This code is **correct** but **inefficient**. Every operation involves array manipulation at runtime.

#### Phase 2: The Smart Code

The optimizer analyzes the stack depth at each point and generates:

```javascript
var go = function(time_val, time_delta_val, xpos, ypos, mouse_x, mouse_y, button_val, memory) {
  var work1, work2, work3, work4;
  
  var temp1 = xpos;     // x
  var temp2 = temp1;    // dup creates temp2
  var temp3 = temp2 * temp1;  // multiply
  
  return [temp3, 0.0, 0.0, 1.0];  // pad to RGBA
};
```

The stack has **completely disappeared**. We're left with simple variable assignments that any JavaScript engine can optimize further.

### Example 2: Stack Manipulation

Here's a more complex example:

```forth
x y swap -
```

This swaps x and y, then subtracts (computing `x - y` after the swap, which is `y - x`).

#### Phase 1: Dumb Code

```javascript
dstack.push(xpos);        // x
dstack.push(ypos);        // y

work1 = dstack.pop();     // swap
work2 = dstack.pop();
dstack.push(work1);
dstack.push(work2);

work1 = dstack.pop();     // -
dstack.push(dstack.pop() - work1);
```

Six lines of stack manipulation for a simple swap and subtract.

#### Phase 2: Smart Code

```javascript
var temp1 = xpos;         // x
var temp2 = ypos;         // y
var temp3 = temp1 - temp2;  // subtract (note: optimizer figured out the swap!)

return [temp3, 0.0, 0.0, 1.0];
```

The optimizer **reasoned about the stack statically**. It knew that after pushing x and y, then swapping, the stack contains `[x, y]` from bottom to top. So the subtraction becomes `temp1 - temp2`, which is exactly `x - y` (the result after the swap).

### Example 3: Control Flow

The optimizer's real cleverness shows in control flow:

```forth
x 0.5 > if 1 else 0 then
```

#### Phase 1: Dumb Code

```javascript
dstack.push(xpos);
dstack.push(0.5);
dstack.push((dstack.pop() < dstack.pop()) ? 1.0 : 0.0);  // >

if(dstack.pop() != 0.0) {    // if
  dstack.push(1.0);          // 1
} else {                      // else
  dstack.push(0.0);          // 0
}                             // then
```

#### Phase 2: Smart Code

```javascript
var temp1 = xpos;
var temp2 = 0.5;
var temp3 = (temp2 < temp1) ? 1.0 : 0.0;

var temp4;
if(temp3 != 0.0) {
  temp4 = 1.0;
} else {
  temp4 = 0.0;
}

return [temp4, 0.0, 0.0, 1.0];
```

Notice something crucial: the optimizer ensures both branches of the `if` end with the **same stack depth**. It creates `temp4` to hold the result regardless of which branch executes. This is **static stack balance verification** at work.

### When Optimization Fails

Not all Forth code can be optimized. The optimizer returns `BOGUS` (fallback code) if:

1. **Stack underflow**: Trying to pop from an empty stack
2. **Unbalanced branches**: `if` and `else` branches leave different stack depths
3. **Too many values**: More than 4 values left on the stack (RGBA limit)
4. **Code too long**: More than 2000 statements (safety limit)

When this happens, the system falls back to a simple BOGUS function that returns a default color.

### The Key Insight

The optimizer is performing **abstract interpretation**. It's simulating the program's execution at compile-time, tracking the abstract state (stack depth and contents) rather than concrete values.

This lets it make transformations that would be impossible without whole-program knowledge:
- Eliminating the stack entirely
- Verifying stack balance across branches
- Allocating exactly the right number of temporaries

### Why Two Phases?

Why not generate optimal code directly? Because **simplicity compounds**.

Phase 1 is 50 lines of dictionary lookups. Easy to understand, easy to extend with new Forth words.

Phase 2 is 100 lines of dataflow analysis. Complex, but completely independent of Forth semantics.

Together, they're more powerful and maintainable than a single monolithic compiler would be.

### Coming Up

In Part 3, we'll look at how this compiler architecture maps onto a Unix-style pipeline, where each phase becomes an independent command-line tool. The principles of simple, composable parts extend beyond the compiler itself to the entire system architecture.

---

*Part 2 of the Forth Haiku series. [Read Part 1: Overview](article_01_overview.md)*
