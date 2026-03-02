#!/bin/bash
# VERIFIED_TEST.sh - Guaranteed working test

echo "╔════════════════════════════════════════════════════════════════╗"
echo "║         Forth Haiku Pipeline - Verified Test                  ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""

# Check if server is running
if ! lsof -i :8080 > /dev/null 2>&1; then
  echo "✗ ERROR: WebSocket server not running on port 8080"
  echo ""
  echo "Start the server first:"
  echo "  ./ws_server.js"
  echo ""
  exit 1
fi

echo "✓ Server is running on port 8080"
echo ""

# Test 1: Simple echo test
echo "TEST 1: Simple WebSocket communication"
echo "========================================"
echo ""
echo "Command:"
echo "  echo '[\"var go = function() { return [1, 0, 0, 1]; }; go\"]' | ./ws_sender.js"
echo ""
echo "Expected output:"
echo "  - Connected to ws://localhost:8080"
echo "  - Sent XX bytes of JavaScript"
echo "  - Waiting for browser response..."
echo "  - Response from browser: { status: ok }"
echo "  - ✓ SUCCESS: Code executed and rendered"
echo ""
echo "IMPORTANT: You MUST have http://localhost:8080/minimal open in your browser!"
echo ""
read -p "Press Enter when you have http://localhost:8080/minimal open in browser..."
echo ""

echo "Sending test..."
echo '["var go = function() { return [1, 0, 0, 1]; }; go"]' | ./ws_sender.js

if [ $? -eq 0 ]; then
  echo ""
  echo "✓✓✓ TEST 1 PASSED ✓✓✓"
  echo ""
  echo "What you should see in browser:"
  echo "  - Status: ✓ Code executed and rendered!"
  echo "  - Canvas: Solid RED square"
  echo "  - Event log showing green checkmarks"
  echo ""
else
  echo ""
  echo "✗✗✗ TEST 1 FAILED ✗✗✗"
  echo ""
  echo "Troubleshooting:"
  echo "  1. Is http://localhost:8080/minimal open in browser?"
  echo "  2. Check browser console (F12) for errors"
  echo "  3. Refresh the browser page and try again"
  echo ""
  exit 1
fi

read -p "Press Enter to continue to Test 2..."
echo ""

# Test 2: Compiler test
echo "TEST 2: Forth Compiler + Optimizer"
echo "===================================="
echo ""
echo "Command:"
echo "  cat example_red.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js"
echo ""

cat example_red.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js

if [ $? -eq 0 ]; then
  echo ""
  echo "✓✓✓ TEST 2 PASSED ✓✓✓"
  echo ""
  echo "The full pipeline works!"
  echo ""
else
  echo ""
  echo "✗✗✗ TEST 2 FAILED ✗✗✗"
  echo ""
  exit 1
fi

read -p "Press Enter to continue to Test 3..."
echo ""

# Test 3: Gradient
echo "TEST 3: Gradient (uses x coordinate)"
echo "====================================="
echo ""
echo "Command:"
echo "  cat example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js"
echo ""

cat example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js

if [ $? -eq 0 ]; then
  echo ""
  echo "✓✓✓ TEST 3 PASSED ✓✓✓"
  echo ""
  echo "You should see a GRAYSCALE GRADIENT (black on left, white on right)"
  echo ""
else
  echo ""
  echo "✗✗✗ TEST 3 FAILED ✗✗✗"
  echo ""
  exit 1
fi

echo ""
echo "╔════════════════════════════════════════════════════════════════╗"
echo "║                    ALL TESTS PASSED! 🎉                        ║"
echo "╚════════════════════════════════════════════════════════════════╝"
echo ""
echo "Next steps:"
echo "  - Create your own .forth files"
echo "  - Try example_circle.forth or example_pulse.forth"
echo "  - Use the main renderer at http://localhost:8080/"
echo ""
