#!/bin/bash

# Test script for Forth Haiku Pipeline
# Tests each stage independently

echo "=== Forth Haiku Pipeline Test ==="
echo ""

# Test 1: Compiler
echo "Test 1: Compiler"
echo "Input: x y +"
echo "x y +" | ./forth_compiler.js > /tmp/test_compiled.json
if [ $? -eq 0 ]; then
  echo "✓ Compiler works"
  echo "  Output length: $(cat /tmp/test_compiled.json | wc -c) bytes"
else
  echo "✗ Compiler failed"
  exit 1
fi
echo ""

# Test 2: Optimizer
echo "Test 2: Optimizer"
cat /tmp/test_compiled.json | ./stack_optimizer.js > /tmp/test_optimized.json
if [ $? -eq 0 ]; then
  echo "✓ Optimizer works"
  echo "  Output length: $(cat /tmp/test_optimized.json | wc -c) bytes"
else
  echo "✗ Optimizer failed"
  exit 1
fi
echo ""

# Test 3: Full Pipeline (without WebSocket)
echo "Test 3: Full Pipeline"
cat example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js > /tmp/test_final.json
if [ $? -eq 0 ]; then
  echo "✓ Full pipeline works"
  echo "  Final output:"
  cat /tmp/test_final.json | python3 -m json.tool | head -20
else
  echo "✗ Pipeline failed"
  exit 1
fi
echo ""

# Test 4: Verify output is valid JSON
echo "Test 4: JSON Validation"
cat /tmp/test_final.json | python3 -m json.tool > /dev/null 2>&1
if [ $? -eq 0 ]; then
  echo "✓ Output is valid JSON"
else
  echo "✗ Output is not valid JSON"
  exit 1
fi
echo ""

echo "=== All tests passed! ==="
echo ""
echo "To test the complete system:"
echo "1. Terminal 1: ./ws_server.js"
echo "2. Terminal 2: Open http://localhost:8080 in browser"
echo "3. Terminal 3: cat example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js"
