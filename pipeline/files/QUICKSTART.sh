#!/bin/bash
# QUICKSTART.sh - Get started in 30 seconds

echo "Forth Haiku Pipeline - Quick Start"
echo "===================================="
echo ""

# Check if ws module is installed
if [ ! -d "node_modules/ws" ]; then
  echo "Installing dependencies..."
  npm install
  echo ""
fi

# Make scripts executable
chmod +x *.js 2>/dev/null

echo "Starting WebSocket server..."
echo ""
echo ">>> Open http://localhost:8080 in your browser <<<"
echo ""
echo "Then in another terminal, run:"
echo "  cat example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js"
echo ""
echo "Or use watch mode:"
echo "  ./file_watcher.js example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js"
echo ""

# Start server
./ws_server.js
