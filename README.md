# forth-haiku

# status 2026-03-02
./main/run.bash runs pipeline
```
echo "test.forth" |\
    ./file_watcher.js |\
    ./forth_compiler.js |\
    ./stack_optimizer.js |\
    ./wrap_function.js |\
    ./ws_sender.js
```

which watches `test.forth` for changes, then recompiles it to javascript and sends it to the viewer for live update

# usage
0. `cd main`
1. `./run.bash`
2. open `renderer.html` in a browser
3. edit (or just touch) `test.forth`
4. watch for updates in the broswer windo

# caveats
renderer.html uses HTML canvas calls and is much slower than a GLSL viewer (this will come in a future version)

therefore, this pipeline is OK for static images (like the primrose example), but animated images (like larson.forth) are very slow
