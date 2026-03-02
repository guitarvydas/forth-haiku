# forth-haiku

# status 2026-03-02
./main/run.bash runs HTML canvas pipeline
```
echo "test.forth" |\
    ./file_watcher.js |\
    ./forth_compiler.js |\
    ./stack_optimizer.js |\
    ./wrap_function.js |\
    ./ws_sender.js
```

./main/rgpu.bash runs GPU pipeline - sends optimized Javascript to the browser, `renderer_gpu.html` transmogrifies the the Javascript to GLSL and runs it (it does the transmogrification using regex replacement only, in function makeFragmentShader, since Javascript is very similar to GLSL).
```
#!/bin/bash
echo "open renderer_gpu.html"
echo "test.forth" |\
    ./file_watcher.js |\
    ./forth_compiler.js |\
    ./stack_optimizer.js |\
    ./ws_sender.js
```


`./file_watcher.js` watches `test.forth` for changes, then recompiles it to javascript and sends it to the viewer for live update

# usage
0. `cd main`

## Canvas version
1. `./run.bash`
2. open `renderer.html` in a browser
3. edit (or just touch) `test.forth`
4. watch for updates in the broswer window

## GLSL version
1. `./rgpu.bash`
2. open `renderer_gpu.html` in a browser
3. edit (or just touch) `test.forth`
4. watch for updates in the broswer window

# miscellaneou
The  canvas version is much slower than the GLSL version (roughly 2FPS vs. 60FPS).

The canvas pipeline wraps some boilerplate code around the generated code.

The GPU version skips the boilerplate and just ships optimized code to the browser. `renderer_gpu.html` converts the code to GLSL (using regexs) and wraps the appropriate GLSL boilerplate around it.
