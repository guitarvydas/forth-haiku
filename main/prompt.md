I'm using the modification time version. It prints the file once, then 
```  
File changed: primrose.forth
  (file mtime unchanged, skipping)
```

I changed the EOF marker in the forth_compiler and stack_optimizer and wrap_function to be `//`
