# Forth Haiku: A Two-Phase Compiler in JavaScript

## Part 1: Overview

### What is Forth Haiku?

Forth Haiku is a creative visual programming system that executes Forth-style code to generate graphics and music in the browser. The original code can be found at [https://forthsalon.appspot.com/static/haiku.js](https://forthsalon.appspot.com/static/haiku.js).

What makes this code particularly interesting from a compiler design perspective is its elegant two-phase compilation strategy that transforms stack-based Forth code into efficient JavaScript.

### The Challenge

Forth uses a stack-based architecture. Operations like `dup`, `swap`, and `+` all manipulate values on a data stack. JavaScript, on the other hand, doesn't have native stack operations. How do you bridge this gap?

The naive approach would be to implement a runtime stack in JavaScript and interpret Forth word-by-word. But that's slow. The haiku.js compiler takes a different approach: it compiles Forth directly to JavaScript, eliminating the stack abstraction entirely.

### The Two-Phase Strategy

The compiler works in two distinct phases:

#### Phase 1: Simple Code Generation

The first phase is deliberately "dumb." It uses a straightforward dictionary lookup to map each Forth word to a few lines of JavaScript code that manipulate runtime stacks.

For example:
- The Forth word `dup` maps to JavaScript that pops a value, then pushes it twice
- The word `+` maps to JavaScript that pops two values, adds them, and pushes the result
- Numbers simply push themselves onto the stack

This phase doesn't try to be clever. It just does a direct, mechanical translation. The generated code is inefficient—full of `dstack.push()` and `dstack.pop()` operations—but it's correct and easy to generate.

#### Phase 2: Optimization

The second phase is where the magic happens. It performs **static stack analysis** to eliminate the runtime stack entirely.

The optimizer simulates the execution of the code at compile-time, tracking what's on the stack at each point. When it encounters a `dstack.push()`, it generates a temporary variable instead. When it encounters a `dstack.pop()`, it substitutes the appropriate temporary variable.

The result? Code that looks like hand-written JavaScript, with no stack operations at all. What started as a dozen push/pop operations becomes a few simple variable assignments.

### Why This Matters

This two-phase approach demonstrates an important principle: **separation of concerns in compiler design**.

Phase 1 focuses on **correctness**: translating Forth semantics accurately, without worrying about performance.

Phase 2 focuses on **optimization**: making the code fast, without worrying about the complexities of parsing and translation.

Each phase is simple because it does one thing well. The compiler as a whole is powerful because the phases compose.

### The Bigger Picture

This isn't just an academic exercise. The two-phase strategy appears in many real compilers:
- GCC's RTL (Register Transfer Language) intermediate representation
- LLVM's optimization passes
- JVM bytecode that gets JIT-compiled

The haiku.js compiler demonstrates these same principles in a few hundred lines of readable JavaScript.

### What's Next

In the next article, we'll dive into specific examples. We'll watch the compiler transform simple Forth expressions through both phases, seeing exactly how "dumb" code becomes efficient code. We'll look at:

- How stack operations disappear
- How the optimizer handles control flow
- What happens when optimization fails

The devil—and the beauty—is in the details.

---

*This is Part 1 of a series exploring the compilation techniques in haiku.js. The code is a testament to the power of simple, composable design.*
