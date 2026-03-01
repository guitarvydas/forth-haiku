# Forth Haiku Pipeline System - CORRECTED

A modular, Unix-style pipeline for compiling and rendering Forth haiku visual programs.

## Architecture - 6 Parts

```
┌──────────────────┐
│ Part 1:          │  Forth source
│ file_watcher.js  │  (or use `cat`)
└────────┬─────────┘
         │ stdout
         ▼
┌──────────────────┐
│ Part 2:          │  JSON array
│ forth_compiler.js│  (with stack ops)
└────────┬─────────┘
         │ stdout
         ▼
┌──────────────────┐
│ Part 3:          │  JSON array
│ stack_optimizer  │  (optimized)
└────────┬─────────┘
         │ stdout
         ▼
┌──────────────────┐
│ Part 4:          │  JSON message
│ prepare_message  │  {type: 'code', ...}
└────────┬─────────┘
         │ stdout
         ▼
┌──────────────────┐
│ Part 5:          │  ──WebSocket──▶
│ ws_sender.js     │  (forwards stdin)
└──────────────────┘
                                    ┌──────────────────┐
                                    │ Part 6:          │  Canvas
                                    │ renderer.html    │  pixels
                                    └──────────────────┘
```

## Key Design Principle

**Each part reads from stdin, writes to stdout, does ONE thing.**

- `ws_sender.js` is completely generic - it just forwards stdin to WebSocket
- `prepare_message.js` formats the message for the browser
- All parts are independent and testable

## Quick Start

**Terminal 1 - Start server:**
```bash
./ws_server.js
```

**Terminal 2 - Open browser:**
```
http://localhost:8080/minimal
```

**Terminal 3 - Run pipeline:**
```bash
cat example_red.forth | \
  ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./prepare_message.js | \
  ./ws_sender.js
```

## Pipeline Examples

### Full pipeline
```bash
cat example_gradient.forth | \
  ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./prepare_message.js | \
  ./ws_sender.js
```

### Watch mode
```bash
./file_watcher.js example.forth | \
  ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./prepare_message.js | \
  ./ws_sender.js
```

### Skip optimizer (for debugging)
```bash
cat example.forth | \
  ./forth_compiler.js | \
  ./prepare_message.js | \
  ./ws_sender.js
```

### Debug individual stages
```bash
# See compiler output
cat example.forth | ./forth_compiler.js

# See optimizer output
cat example.forth | ./forth_compiler.js | ./stack_optimizer.js

# See message format
cat example.forth | ./forth_compiler.js | ./stack_optimizer.js | ./prepare_message.js
```

## Part Details

### Part 1: file_watcher.js (optional)
- Watches a file and outputs on change
- Alternative: just use `cat filename`

### Part 2: forth_compiler.js
- Input: Forth source code
- Output: JSON array of JavaScript statements (with stack ops)

### Part 3: stack_optimizer.js
- Input: JSON array of JavaScript statements
- Output: JSON array of optimized JavaScript (with temp variables)

### Part 4: prepare_message.js
- Input: JSON array of JavaScript
- Output: JSON message object `{type: 'code', javascript: '...'}`

### Part 5: ws_sender.js
- Input: **ANY TEXT** from stdin
- Output: Forwards that text via WebSocket
- **Completely generic** - doesn't care about content

### Part 6: renderer.html (browser)
- Receives messages via WebSocket
- Parses JSON, evals JavaScript
- Renders to canvas

## Testing

```bash
# Test the full pipeline
./TEST_RELAY.sh

# Test WebSocket relay
./diagnostic_ws.js

# Test just ws_sender (generic forwarding)
echo "Hello World" | ./ws_sender.js
```

## ws_sender.js - Generic Design

`ws_sender.js` is now **completely generic**:

```bash
# Send JSON
echo '{"type":"code","javascript":"..."}' | ./ws_sender.js

# Send plain text
echo "Hello" | ./ws_sender.js

# Send anything
cat anyfile.txt | ./ws_sender.js
```

It just forwards stdin to WebSocket. The browser decides how to handle it.

## Architecture Benefits

1. **ws_sender.js** is reusable for ANY WebSocket forwarding task
2. **prepare_message.js** handles browser-specific message format
3. Each part has ONE job and can be tested independently
4. Easy to insert new stages (e.g., linter, minifier)
5. Pure Unix pipeline philosophy

## WebSocket Server

The server acts as a **message relay**:
- Forwards all messages between connected clients
- No application logic - just a dumb forwarder
- See `RELAY_ARCHITECTURE.txt` for details

## Troubleshooting

See:
- `RELAY_ARCHITECTURE.txt` - How message relay works
- `FIX_HANGING.txt` - Why messages weren't being forwarded
- `SIMPLE_TEST.txt` - Step-by-step test instructions
