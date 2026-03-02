# Forth Haiku: Compilers as Unix Pipelines

## Part 3: Pipeline Architecture

In Parts 1 and 2, we explored haiku.js's two-phase compilation strategy. But there's a deeper principle at work: the same composability that makes the compiler elegant can extend to the entire system architecture.

### From Monolith to Pipeline

The original haiku.js was a browser-only application. Everything—compilation, optimization, rendering—happened in one JavaScript file loaded by a web page.

This works, but it's limiting. You can't:
- Compile Forth code from the command line
- Test the compiler without a browser
- Insert new transformation stages
- Swap out components

What if we applied the same separation-of-concerns principle to the whole system?

### The Pipeline Vision

Here's a Unix-style pipeline that implements the same functionality:

```bash
cat example.forth | \
  forth_compiler.js | \
  stack_optimizer.js | \
  prepare_message.js | \
  ws_sender.js
```

Each tool reads from stdin, writes to stdout, and does **one thing well**:

**forth_compiler.js**: Forth source → JSON array of JavaScript (Phase 1)
**stack_optimizer.js**: Dumb JavaScript → Smart JavaScript (Phase 2)  
**prepare_message.js**: JavaScript → Browser message format
**ws_sender.js**: Any text → WebSocket forwarding

### The Key Insight: Generic Components

Notice that `ws_sender.js` knows nothing about Forth, JavaScript, or compilers. It just forwards stdin to a WebSocket. This makes it reusable:

```bash
echo '{"type":"hello"}' | ws_sender.js
cat anyfile.json | ws_sender.js
./other_pipeline | ws_sender.js
```

Similarly, the compiler and optimizer don't know about WebSockets or browsers. They just transform text.

This is the Unix philosophy in action: **small tools that work together**.

### Testing and Debugging

With a pipeline, you can test each stage independently:

```bash
# Test just the compiler
echo "x y +" | forth_compiler.js

# Test compiler + optimizer
echo "x y +" | forth_compiler.js | stack_optimizer.js

# Save intermediate results
cat haiku.forth | forth_compiler.js | tee unoptimized.json | \
  stack_optimizer.js | tee optimized.json | \
  prepare_message.js | ws_sender.js
```

Try doing that with a monolithic browser application.

### Flexibility

Want to skip optimization during debugging?

```bash
cat haiku.forth | forth_compiler.js | prepare_message.js | ws_sender.js
```

Want to add a minifier?

```bash
cat haiku.forth | forth_compiler.js | stack_optimizer.js | \
  minifier.js | prepare_message.js | ws_sender.js
```

Want to add a linter that checks for common mistakes?

```bash
cat haiku.forth | linter.js | forth_compiler.js | \
  stack_optimizer.js | prepare_message.js | ws_sender.js
```

Each new tool is just another filter in the pipeline.

### The WebSocket Relay

The browser becomes just another stage in the pipeline—the final rendering stage. A WebSocket server acts as a message relay, forwarding data between the command-line tools and the browser:

```
Command Line                    WebSocket Server                 Browser
─────────────                   ────────────────                 ───────

ws_sender.js  ──sends code──►  Relay Server  ──forwards──►  renderer.html
                                                                  │
ws_sender.js  ◄─receives ok──  Relay Server  ◄─forwards───  (executes & 
                                                              renders)
```

The server doesn't understand the messages. It just forwards them. Another generic, reusable component.

### Composability at Every Level

The haiku.js compiler demonstrates composability at two levels:

**Inside the compiler**: Two phases that compose to transform Forth to JavaScript

**Outside the compiler**: Multiple independent tools that compose to form a complete system

Both follow the same principle: simple parts with clear interfaces.

### The Alternative

Compare this to the typical modern approach:

- A monolithic application
- Everything in one codebase
- Tight coupling between components
- Complex build systems
- Difficult to test individual pieces

The pipeline approach gives us:

- Independent, testable components
- Clear, simple interfaces (stdin/stdout)
- Easy to understand (each part does one thing)
- Easy to extend (just add another filter)
- No build system needed

### Why This Matters

This isn't just about Forth compilers or graphics haikus. It's about **architectural philosophy**.

When you design a system as composable parts:
- Each part is simpler
- Testing is easier
- Extension is natural
- Understanding is achievable

The original haiku.js taught us that compilers can be simple. The pipeline architecture teaches us that **entire systems** can be simple.

### Coming Up

In Part 4, we'll look at specific optimization techniques used in Phase 2. How does the optimizer track stack state? How does it handle control flow? What algorithms make static stack analysis possible?

The beauty is in the details, but the principles are universal.

---

*Part 3 of the Forth Haiku series. [Read Part 1: Overview](article_01_overview.md) | [Read Part 2: Examples](article_02_examples.md)*
