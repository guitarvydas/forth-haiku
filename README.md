# Forth Haiku Pipelines on the Command Line
Two pipelines for rendering Forth-like Haiku code.

Most of the work is done on the command line, then shipped via websocket to a renderer running in a browser.

# Usage GPU Version
1. Open a terminal and run `./run_gpu.bash`.
2. Open `renderer_gpu.html` in a browser. It should show that it is connected to the code running in the terminal above.
3. Edit or touch `test.forth`
4. Watch for changes in the browser window.

# Usage CPU Version
1. Open a terminal and run `./run_cpu.bash`.
2. Open `renderer_cpu.html` in a browser. It should show that it is connected to the code running in the terminal above.
3. Edit or touch `test.forth`
4. Watch for changes in the browser window.




# Complete Architecture Guide
![COMPLETE_ARCHITECTURE_GUIDE](COMPLETE_ARCHITECTURE_GUIDE.md)