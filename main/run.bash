#!/bin/bash
echo "open renderer.html"
rm -f out*.js
echo "primrose.forth" |\
    ./file_watcher.js | tee ./out1.js |\
    ./forth_compiler.js | tee ./out2.js |\
    ./stack_optimizer.js | tee ./out3.js |\
    ./wrap_function.js | tee ./out4.js  > test_output.js
# cat test_output.js | ./ws_sender.js
