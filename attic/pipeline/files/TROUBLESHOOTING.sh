#!/bin/bash
# TROUBLESHOOTING - Debug the pipeline step by step

echo "Forth Haiku Pipeline Troubleshooting"
echo "====================================="
echo ""

# Test 1: Simple static example
echo "Test 1: Pure red square (simplest possible)"
echo "Code: 1 0 0 1"
echo ""
echo "1 0 0 1" | ./forth_compiler.js | ./stack_optimizer.js > /tmp/debug_red.json
echo "Compiled successfully. Output:"
cat /tmp/debug_red.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
js = data[0]
# Extract just the return statement
import re
match = re.search(r'return \[(.*?)\];', js)
if match:
    print('Returns:', match.group(1))
"
echo ""
echo "Expected: temp1, temp2, temp3, temp4 (which are 1.0, 0.0, 0.0, 1.0)"
echo "This should render as solid RED"
echo ""
echo "To test: cat example_red.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js"
echo ""
echo "---"
echo ""

# Test 2: Gradient
echo "Test 2: Gradient (uses x coordinate)"
echo "Code: x dup dup 1"
cat example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js > /tmp/debug_gradient.json
echo ""
cat /tmp/debug_gradient.json | python3 -c "
import json, sys
data = json.load(sys.stdin)
js = data[0]
import re
match = re.search(r'return \[(.*?)\];', js)
if match:
    print('Returns:', match.group(1))
"
echo ""
echo "Expected: temp1, temp2, temp3, temp4 (which are xpos, xpos, xpos, 1.0)"
echo "This should render as GRAYSCALE GRADIENT from black (left) to white (right)"
echo ""
echo "To test: cat example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js"
echo ""
echo "---"
echo ""

# Common issues
echo "Common Issues:"
echo ""
echo "1. 'Optimization failed - returning BOGUS code'"
echo "   Problem: Your Forth code doesn't leave exactly 4 values on the stack"
echo "   Solution: Make sure your code ends with exactly 4 values (R G B A)"
echo "   Example: 'x y +' leaves 1 value (WRONG)"
echo "            'x y + dup dup 1' leaves 4 values (CORRECT)"
echo ""
echo "2. 'Nothing happens in browser'"
echo "   - Check browser console (F12) for JavaScript errors"
echo "   - Verify WebSocket connection in Network tab"
echo "   - Make sure ws_server.js is running"
echo "   - Check that you opened http://localhost:8080"
echo ""
echo "3. 'Black screen in browser'"
echo "   - Your code might be returning all zeros"
echo "   - Try the simple red test: echo '1 0 0 1' | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js"
echo ""
echo "4. 'WebSocket connection failed'"
echo "   - Is ws_server.js running?"
echo "   - Is port 8080 available?"
echo "   - Try: lsof -i :8080"
echo ""

echo "Debug Commands:"
echo ""
echo "# See what the compiler generates:"
echo "cat example_red.forth | ./forth_compiler.js | python3 -m json.tool"
echo ""
echo "# See what the optimizer generates:"  
echo "cat example_red.forth | ./forth_compiler.js | ./stack_optimizer.js | python3 -m json.tool"
echo ""
echo "# Test WebSocket without the full pipeline:"
echo "echo '[\"var go = function() { return [1, 0, 0, 1]; }; go\"]' | ./ws_sender.js"
echo ""
