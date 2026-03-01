# Forth Haiku: A Series on Compiler Design and Software Architecture

*Exploring the techniques, principles, and lessons from a tiny JavaScript compiler*

## About This Series

The haiku.js compiler ([original source](https://forthsalon.appspot.com/static/haiku.js)) is a visual programming system that compiles Forth code to JavaScript. But it's more than that—it's a masterclass in software design.

This series explores:
- How two-phase compilation separates concerns
- Why "dumb" code generation is actually smart
- How static analysis eliminates runtime overhead
- How Unix pipelines extend compiler principles to system architecture
- What simple, composable software looks like in practice

Whether you're interested in compilers, software architecture, or just building better systems, there's something here for you.

## The Articles

### Part 1: Overview
**[Forth Haiku: A Two-Phase Compiler in JavaScript](article_01_overview.md)**

An introduction to the haiku.js compiler and its two-phase compilation strategy. Learn why separating code generation from optimization makes both simpler and more powerful.

*Read this first to understand the big picture.*

### Part 2: Examples
**[Forth Haiku: From Dumb to Smart Code](article_02_examples.md)**

Concrete examples showing the compilation process step-by-step. Watch simple Forth expressions transform from inefficient stack operations to optimized JavaScript.

*Read this to see the compiler in action.*

### Part 3: Pipeline Architecture
**[Forth Haiku: Compilers as Unix Pipelines](article_03_pipeline.md)**

How the same separation-of-concerns principle that makes the compiler elegant extends to system architecture. Unix pipelines as architectural philosophy.

*Read this to understand how compiler design principles apply to entire systems.*

### Part 4: Optimizer
**[Forth Haiku: Inside the Optimizer](article_04_optimizer.md)**

A deep dive into Phase 2: symbolic execution, static stack analysis, control flow handling, and the algorithms that make optimization possible.

*Read this to understand how the optimizer works.*

### Part 5: Dictionary
**[Forth Haiku: The Beauty of Dumb Code](article_05_dictionary.md)**

Inside Phase 1: dictionary-based code generation. How a simple lookup table generates correct code, and why simplicity enables extensibility.

*Read this to understand why "dumb" generation is the smart choice.*

### Part 6: Conclusion
**[Forth Haiku: Lessons in Simplicity](article_06_conclusion.md)**

Stepping back to examine the bigger lessons. What does this compiler teach us about software design? How do these principles apply beyond compilers?

*Read this for the synthesis and takeaways.*

## Key Themes

Throughout this series, you'll encounter these recurring ideas:

**Separation of Concerns**: Each component does one thing well

**Composability**: Simple parts combine to create complex behavior

**Clear Interfaces**: Well-defined boundaries between components

**Simplicity**: Achieving complexity through composition, not monoliths

**Practical Engineering**: These aren't academic ideals—they're working techniques

## Who This Is For

**Compiler enthusiasts**: See how a real compiler handles parsing, optimization, and code generation

**Software architects**: Learn principles of composable system design

**Forth programmers**: Understand how Forth can compile to JavaScript

**Pipeline advocates**: See Unix philosophy in practice

**Anyone interested in simple, elegant software**: Learn from a system that gets it right

## The Code

The original haiku.js source code is available at:
[https://forthsalon.appspot.com/static/haiku.js](https://forthsalon.appspot.com/static/haiku.js)

This series also references a modular pipeline implementation that separates the compiler into independent Unix-style tools. The techniques apply whether you're working with the original monolithic version or a decomposed pipeline.

## Reading Order

**Sequential**: Read Parts 1-6 in order for the full narrative arc

**À la carte**: Each article stands alone if you're interested in specific topics
- Want to understand optimization? Start with Part 4
- Interested in pipelines? Jump to Part 3
- Looking for big-picture lessons? Go straight to Part 6

**Reference**: Use this index to return to specific topics

## Start Reading

Begin with **[Part 1: Overview](article_01_overview.md)** to understand the foundation, then explore the topics that interest you most.

The code is simple. The ideas are powerful. Let's dive in.

---

*A series exploring how simplicity, separation of concerns, and composability create better software—whether you're building compilers, pipelines, or applications.*

*All articles reference the original haiku.js source code: [https://forthsalon.appspot.com/static/haiku.js](https://forthsalon.appspot.com/static/haiku.js)*
