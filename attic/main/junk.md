run.bash is:
```
#!/bin/bash
echo "open renderer.html"
echo "primrose.forth" |\
    ./file_watcher.js |\
    ./forth_compiler.js |\
    ./stack_optimizer.js |\
    ./wrap_function.js |\
    ./ws_sender.js
```

Executed from command line:
```
$ ./run.bash
open renderer.html
Watching: primrose.forth
Watching for changes... (Ctrl+C to exit)
WebSocket server listening on port 8080
Waiting for browser connection...
Browser connected!
File changed: primrose.forth
File changed: primrose.forth
```

I refreshed the browser window, it says "connected to WebSocket server", but nothing else happens
