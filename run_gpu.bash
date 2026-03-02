#!/bin/bash
# GPU Pipeline - Fast rendering with WebGL

echo "======================================"
echo "GPU Haiku Pipeline (WebGL/GLSL)"
echo "======================================"
echo ""
echo "Open renderer_gpu_simple.html in your browser"
echo "Then run this script"
echo ""
echo "Pipeline: Forth → JS → Optimized → GLSL → GPU"
echo "Expected FPS: 60"
echo ""
echo "Starting pipeline..."

echo "test.forth" | \
    ./file_watcher.js | \
    ./forth_compiler.js | \
    ./stack_optimizer.js | \
    ./make_fragment_shader.js | \
    ./ws_sender.js
