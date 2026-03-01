#!/bin/bash

echo "════════════════════════════════════════════════════════════"
echo "  CORRECTED PIPELINE TEST"
echo "════════════════════════════════════════════════════════════"
echo ""
echo "This demonstrates the CORRECTED 5-part pipeline where"
echo "ws_sender.js is completely generic (just forwards stdin)."
echo ""

# Check if server is running
if ! lsof -i :8080 > /dev/null 2>&1; then
  echo "✗ Server is not running on port 8080"
  echo ""
  echo "Start the server:"
  echo "  ./ws_server.js"
  echo ""
  exit 1
fi

echo "✓ Server is running"
echo ""

echo "Pipeline has 5 command-line parts:"
echo "  1. forth_compiler.js    (Forth → JS array)"
echo "  2. stack_optimizer.js   (optimize stack ops)"
echo "  3. prepare_message.js   (wrap in message format)"
echo "  4. ws_sender.js         (forward stdin to WebSocket)"
echo "  5. renderer.html        (browser - receives & renders)"
echo ""

echo "Testing each stage:"
echo "══════════════════════════════════════════════════════════"
echo ""

echo "Stage 1: Compiler"
echo "-----------------"
cat example_red.forth | ./forth_compiler.js > /tmp/stage1.json
echo "✓ Output: $(cat /tmp/stage1.json | wc -c) bytes (JSON array)"
echo ""

echo "Stage 2: Optimizer"
echo "------------------"
cat /tmp/stage1.json | ./stack_optimizer.js > /tmp/stage2.json
echo "✓ Output: $(cat /tmp/stage2.json | wc -c) bytes (optimized JSON array)"
echo ""

echo "Stage 3: Message Preparation"
echo "-----------------------------"
cat /tmp/stage2.json | ./prepare_message.js > /tmp/stage3.json
echo "✓ Output: $(cat /tmp/stage3.json | wc -c) bytes (JSON message)"
echo "  Format: {\"type\":\"code\",\"javascript\":\"...\"}"
echo "  First 100 chars: $(cat /tmp/stage3.json | head -c 100)"
echo ""

echo "Stage 4: WebSocket Sender"
echo "--------------------------"
echo "ws_sender.js is GENERIC - it just forwards whatever is on stdin"
echo "It doesn't parse, join, or understand the content"
echo ""
echo "Demonstration: Send plain text"
echo "  echo 'Hello World' | ./ws_sender.js"
echo ""

echo "Stage 5: Full Pipeline Test"
echo "============================"
echo ""
echo "IMPORTANT: Browser must be open at http://localhost:8080/minimal"
echo ""
read -p "Press Enter when browser is ready..."
echo ""

echo "Running full pipeline:"
echo "  cat example_red.forth | \\"
echo "    ./forth_compiler.js | \\"
echo "    ./stack_optimizer.js | \\"
echo "    ./prepare_message.js | \\"
echo "    ./ws_sender.js"
echo ""

cat example_red.forth | \
  ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./prepare_message.js | \
  ./ws_sender.js

if [ $? -eq 0 ]; then
  echo ""
  echo "✓✓✓ PIPELINE WORKS! ✓✓✓"
  echo ""
  echo "You should see:"
  echo "  - Terminal: Response from browser"
  echo "  - Browser: RED SQUARE on canvas"
  echo ""
else
  echo ""
  echo "✗ Pipeline failed"
  echo ""
fi

echo ""
echo "Key insight:"
echo "------------"
echo "ws_sender.js is now REUSABLE for any WebSocket task!"
echo "It just forwards stdin → WebSocket, nothing more."
echo ""
echo "Try:"
echo "  echo '{\"hello\":\"world\"}' | ./ws_sender.js"
echo ""
