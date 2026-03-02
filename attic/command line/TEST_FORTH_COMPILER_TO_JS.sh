#!/bin/bash

echo "═══════════════════════════════════════════════════════════"
echo "  Testing forth_compiler_to_js.js"
echo "═══════════════════════════════════════════════════════════"
echo ""

# Test 1: Simple constants
echo "Test 1: Simple constants (1 0 0 1)"
echo "───────────────────────────────────────────"
cat << 'EOF' | ./forth_compiler_to_js.js > /tmp/test1.js
1 0 0 1
EOF
node -e "const f = eval(require('fs').readFileSync('/tmp/test1.js', 'utf8')); console.log('Result:', f(0,0,0.5,0.5,0,0,0,new Float32Array(16)))"
echo ""

# Test 2: Using x and y
echo "Test 2: Using coordinates (x y +)"
echo "───────────────────────────────────────────"
cat << 'EOF' | ./forth_compiler_to_js.js > /tmp/test2.js
x y +
EOF
node -e "const f = eval(require('fs').readFileSync('/tmp/test2.js', 'utf8')); console.log('x=0.3, y=0.4, result:', f(0,0,0.3,0.4,0,0,0,new Float32Array(16)))"
echo ""

# Test 3: User-defined word
echo "Test 3: User-defined word (: square dup * ;)"
echo "───────────────────────────────────────────"
cat << 'EOF' | ./forth_compiler_to_js.js > /tmp/test3.js
: square dup * ;
x square y square +
EOF
node -e "const f = eval(require('fs').readFileSync('/tmp/test3.js', 'utf8')); console.log('x²+y² where x=0.3, y=0.4:', f(0,0,0.3,0.4,0,0,0,new Float32Array(16)))"
echo "(Expected: 0.25 = 0.09 + 0.16)"
echo ""

# Test 4: Stack operations
echo "Test 4: Stack operations (dup swap over)"
echo "───────────────────────────────────────────"
cat << 'EOF' | ./forth_compiler_to_js.js > /tmp/test4.js
x dup swap over
EOF
node -e "const f = eval(require('fs').readFileSync('/tmp/test4.js', 'utf8')); console.log('x dup swap over where x=0.7:', f(0,0,0.7,0,0,0,0,new Float32Array(16)))"
echo "(Expected: [0.7, 0.7, 0.7])"
echo ""

# Test 5: Math functions
echo "Test 5: Math functions (sin cos)"
echo "───────────────────────────────────────────"
cat << 'EOF' | ./forth_compiler_to_js.js > /tmp/test5.js
0 sin 0 cos
EOF
node -e "const f = eval(require('fs').readFileSync('/tmp/test5.js', 'utf8')); console.log('sin(0) and cos(0):', f(0,0,0,0,0,0,0,new Float32Array(16)))"
echo "(Expected: [0, 1])"
echo ""

# Test 6: Comments
echo "Test 6: Comments (\\ and parentheses)"
echo "───────────────────────────────────────────"
cat << 'EOF' | ./forth_compiler_to_js.js > /tmp/test6.js
\ This is a line comment
1 ( inline comment ) 2
\ Another comment
3 4
EOF
node -e "const f = eval(require('fs').readFileSync('/tmp/test6.js', 'utf8')); console.log('Result:', f(0,0,0,0,0,0,0,new Float32Array(16)))"
echo "(Expected: [1, 2, 3, 4])"
echo ""

# Test 7: Complex example from file
echo "Test 7: From file (example_red.forth)"
echo "───────────────────────────────────────────"
cat example_red.forth | ./forth_compiler_to_js.js > /tmp/test7.js
node -e "const f = eval(require('fs').readFileSync('/tmp/test7.js', 'utf8')); console.log('Result:', f(0,0,0,0,0,0,0,new Float32Array(16)))"
echo "(Expected: [1, 0, 0, 1] - red color)"
echo ""

# Test 8: Size comparison
echo "Test 8: Generated code size"
echo "───────────────────────────────────────────"
cat << 'EOF' | ./forth_compiler_to_js.js > /tmp/test8.js
: i 2dup z* log ;
x .5 - y .5 - i i i log over
EOF
LINES=$(wc -l < /tmp/test8.js)
BYTES=$(wc -c < /tmp/test8.js)
echo "Primrose haiku (2 lines of Forth)"
echo "Generated JavaScript: $LINES lines, $BYTES bytes"
echo ""

echo "═══════════════════════════════════════════════════════════"
echo "  All tests complete!"
echo "═══════════════════════════════════════════════════════════"
