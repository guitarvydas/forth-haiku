#!/bin/bash
echo "open renderer_gpu.html"
echo "test.forth" |\
    ./file_watcher.js |\
    ./forth_compiler.js |\
    ./stack_optimizer.js |\
    ./ws_sender.js


