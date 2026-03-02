#!/bin/bash
cat << 'EOF' | ./forth_compiler.js | \
  ./stack_optimizer.js | \
  ./wrap_function.js > primrose.js
: i 2dup z* log ;
x .5 - y .5 - i i i log over
EOF

# Count statements
echo "Pass 1:" $(cat pass1.json | python3 -c "import json, sys; print(len(json.load(sys.stdin)))")
echo "Pass 2:" $(cat pass2.json | python3 -c "import json, sys; print(len(json.load(sys.stdin)))")
