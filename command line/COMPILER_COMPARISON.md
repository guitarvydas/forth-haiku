# Comparison: forth_compiler.js vs forth_compiler_to_js.js

## Quick Summary

**forth_compiler.js**: Outputs JSON array (for pipeline)
**forth_compiler_to_js.js**: Outputs complete JavaScript function (standalone)

## Example Input

```forth
x y +
```

## forth_compiler.js Output

```json
[
  "dstack.push(xpos);",
  "dstack.push(ypos);",
  "dstack.push(dstack.pop() + dstack.pop());"
]
```

This is a JSON array of JavaScript statements. Needs additional processing:
- Stack optimizer to clean it up
- Message wrapper for browser
- WebSocket sender

## forth_compiler_to_js.js Output

```javascript
var go = function(
  time_val, time_delta_val,
  xpos, ypos,
  mouse_x, mouse_y,
  button_val,
  memory) {
  var PI = Math.PI;
  var random = Math.random;
  // ... helper functions ...
  
  var dstack = [];
  var rstack = [];
  var work1, work2, work3, work4;

  
  dstack.push(xpos);
  dstack.push(ypos);
  dstack.push(dstack.pop() + dstack.pop());
  
  return dstack;
};
go
```

This is a complete, runnable JavaScript function. Can be:
- Eval'd immediately in Node or browser
- Saved to a .js file
- Executed without any additional processing

## When to Use Each

### Use forth_compiler.js when:

- Building the full pipeline (compiler → optimizer → WebSocket)
- You want optimized output
- Working with the haiku visualization system
- Need the two-phase compilation

Pipeline:
```
forth_compiler.js → JSON → stack_optimizer.js → JSON → prepare_message.js → ws_sender.js
```

### Use forth_compiler_to_js.js when:

- You want standalone JavaScript files
- Testing/debugging Forth code quickly
- Don't need optimization
- Integrating with other tools
- Learning how the compiler works

Standalone:
```
forth_compiler_to_js.js → JavaScript file (ready to run)
```

## Example Workflows

### Pipeline Workflow (forth_compiler.js)

```bash
# Full pipeline with optimization
cat haiku.forth | \
  ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./prepare_message.js | \
  ./ws_sender.js
```

### Standalone Workflow (forth_compiler_to_js.js)

```bash
# Generate JavaScript file
cat haiku.forth | ./forth_compiler_to_js.js > haiku.js

# Run it in Node
node -e "const f = eval(require('fs').readFileSync('haiku.js', 'utf8')); \
  console.log(f(0,0,0.5,0.5,0,0,0,new Float32Array(16)))"

# Or include in HTML
<script src="haiku.js"></script>
<script>
  const result = go(0, 0, 0.5, 0.5, 0, 0, 0, new Float32Array(16));
  console.log(result);
</script>
```

## Output Comparison

For the primrose example:

```forth
: i 2dup z* log ;
x .5 - y .5 - i i i log over
```

**forth_compiler.js output:**
- JSON array with ~70 elements
- Each element is a JavaScript statement string
- Needs JSON.parse() and joining
- Size: ~2KB of JSON

**forth_compiler_to_js.js output:**
- Complete JavaScript function
- 95 lines of code
- Ready to eval() or save as .js file
- Size: ~2.5KB of JavaScript

## Key Differences

| Feature | forth_compiler.js | forth_compiler_to_js.js |
|---------|-------------------|-------------------------|
| Output format | JSON array | JavaScript function |
| Runnable immediately | No | Yes |
| Needs optimizer | Recommended | Optional |
| Pipeline component | Yes | No |
| Standalone tool | No | Yes |
| Browser ready | No | Yes |
| File extension | .json | .js |

## Both Are Useful!

**forth_compiler.js** is essential for the full pipeline where you want optimized code.

**forth_compiler_to_js.js** is great for quick testing, learning, and standalone use.

They produce the same "dumb" code internally—the difference is just the packaging.
