```
$ echo "primrose.forth" | ./file_watcher.js                      
Watching: primrose.forth
\ Primrose haiku
: i 2dup z* log ;
x .5 - y .5 - i i i log over



Watching for changes... (Ctrl+C to exit)
File changed: primrose.forth
\ Primrose haiku
: i 2dup z* log ;
x .5 - y .5 - i i i log over



File changed: primrose.forth
\ Primrose haiku
: i 2dup z* log ;
x .5 - y .5 - i i i log over



```

but 

```
$ echo "primrose.forth" | ./file_watcher.js | ./forth_compiler.js
Watching: primrose.forth
Watching for changes... (Ctrl+C to exit)
File changed: primrose.forth
File changed: primrose.forth

```
