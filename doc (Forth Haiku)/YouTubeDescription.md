Two-Stage Compilation in Fourth Haiku: Command-Line Pipelines for CPU & GPU Shaders

The speaker shares what they learned dissecting Fourth Haiku’s code using the Primrose example, clarifying that basic shader code is a stateless per-pixel pure function and that stateful effects like Conway’s Game of Life require double-buffered texture memory. They describe splitting Fourth Haiku into a command-line-driven pipeline where only the final stage opens a WebSocket to a browser “slave” renderer, with separate HTML viewers for CPU (JavaScript/canvas) and GPU (GLSL). Both pipelines use a file watcher (e.g., hardwired to test.forth) that sends updates marked with //EOF, a compiler/optimizer/wrapper, and a WebSocket daemon that forwards code to the browser. The core idea is “two-stage compilation”: stage one does simple dictionary-based string concatenation code generation, and stage two optimizes by replacing stack push/pop with temporary variables and adapting output for GLSL’s limited types via regex.

00:00 Dissecting Fourth Haiku
00:26 Shaders and State
01:22 Command Line Pipeline
03:10 CPU vs GPU Rendering
04:43 Side Project Pong
05:36 Two Stage Compilation
05:59 Stage One Generation
07:17 Stage Two Optimization
08:07 CPU Output Walkthrough
09:10 GPU Shader Output
09:43 Repo and Wrap Up

repo: https://github.com/guitarvydas/forth-haiku

---


Two-Stage Compilation in Fourth Haiku: CPU vs GPU Pipelines, Shaders, and State

The episode explains lessons learned from dissecting Fourth Haiku’s code, using the Primrose example to introduce a simple “two-stage compilation” technique. It clarifies that basic shader code is a stateless pure function per pixel, and that stateful simulations like Conway’s Game of Life require two buffers, often using GPU texture memory as a state buffer. The script describes splitting Fourth Haiku into a command-line pipeline that watches a source file, compiles/optimizes/wraps it, and sends output via a persistent WebSocket daemon to a browser “slave” renderer, with separate HTML viewers for CPU (JavaScript) and GPU (GLSL fragment shader) rendering. It also outlines a Pong side project using command-line keystrokes to control browser-rendered graphics. Two-stage compilation is presented as stage-one dictionary-driven code generation and stage-two regex-based optimization that replaces stack push/pop with temporary variables and adapts output for GLSL’s fundamental types.

00:00 Dissecting Fourth Haiku

00:26 Shaders And State

01:22 Command Line Pipeline

03:10 CPU Render Passes

04:16 GPU Shader Pipeline

04:41 Pong Side Project

05:34 Two Stage Compilation

05:58 Stage One Generation

07:16 Stage Two Optimization

08:57 CPU And GPU Output

09:41 Repo And Next Steps

repo: https://github.com/guitarvydas/forth-haiku
