#!/bin/bash
# Quick start script for WebSocket live shader development

echo "======================================"
echo "Forth Haiku Live Development Pipeline"
echo "======================================"
echo ""

# Check if file argument provided
if [ -z "$1" ]; then
  echo "Usage: ./start_pipeline.sh <forth_file>"
  echo ""
  echo "Examples:"
  echo "  ./start_pipeline.sh test_haiku.forth"
  echo "  ./start_pipeline.sh primrose.forth"
  echo ""
  echo "Available test files:"
  ls -1 *.forth 2>/dev/null || echo "  (no .forth files found)"
  exit 1
fi

FORTH_FILE="$1"

if [ ! -f "$FORTH_FILE" ]; then
  echo "Error: File '$FORTH_FILE' not found!"
  exit 1
fi

echo "Starting pipeline for: $FORTH_FILE"
echo ""
echo "Steps:"
echo "  1. Open renderer.html in your browser"
echo "  2. This script will start the pipeline"
echo "  3. Edit $FORTH_FILE to see live updates!"
echo ""
echo "Press Ctrl+C to stop"
echo ""
echo "Starting in 3 seconds..."
sleep 3

# Start the pipeline
echo "$FORTH_FILE" | node file_watcher.js | \
  ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./wrap_function.js | \
  node ws_sender.js
