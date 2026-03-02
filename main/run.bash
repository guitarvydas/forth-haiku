#!/bin/bash
echo "open renderer.html"
rm -f out*.js
echo "test.forth" |\
    ./file_watcher.js |\
    ./forth_compiler.js |\
    ./stack_optimizer.js |\
    ./wrap_function.js |\
    ./ws_sender.js
