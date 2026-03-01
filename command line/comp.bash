#!/bin/bash
# Generate both passes
echo "$1" | \
  ./forth_compiler.js | tee unopt.json | \
  ./stack_optimizer.js > opt.json

# See the difference
echo "=== Unoptimized (Pass 1) ==="
cat unopt.json | python3 -m json.tool | head -20

echo ""
echo "=== Optimized (Pass 2) ==="
cat opt.json | python3 -m json.tool | head -20
