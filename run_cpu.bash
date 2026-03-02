#!/bin/bash
# CPU Pipeline - Slower but easier to debug

echo "======================================"
echo "CPU Haiku Pipeline (JavaScript)"
echo "======================================"
echo ""
echo "Open renderer.html in your browser"
echo "Then run this script"
echo ""
echo "Pipeline: Forth → JS → Optimized → Wrapped Function → CPU"
echo "Expected FPS: 1-10"
echo ""
echo "Starting pipeline..."

echo "test.forth" | \
    ./file_watcher.js | \
    ./forth_compiler.js | \
    ./stack_optimizer.js | \
    ./wrap_function.js | \
    ./ws_sender.js
