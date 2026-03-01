The issue is that the `example_gradient.forth` I created is **malformed** - it leaves 6 items on the stack instead of the required 4 (RGBA). That's why the optimizer says "Optimization failed - returning BOGUS code".

Let me fix this and also add some debugging:## Issue Found and Fixed!

The problem was that **`example_gradient.forth` was malformed** - it left 6 values on the stack instead of the required 4 (RGBA). The optimizer correctly rejected it and returned BOGUS code, but even BOGUS code should have rendered something.

### What I Fixed:

1. **Corrected `example_gradient.forth`** - Now leaves exactly 4 values:
   ```forth
   x dup dup 1
   ```
   This creates a grayscale gradient (R=x, G=x, B=x, A=1)

2. **Added debug logging to `renderer.html`** - Now shows what's happening in the browser console

3. **Created simpler test examples:**
   - `example_red.forth` - Solid red (simplest test)
   - `example_pulse.forth` - Animated pulsing

4. **Created `TROUBLESHOOTING.sh`** - Debugging guide

### What To Do Now:

**Option 1: Try the corrected gradient**
```bash
cat example_gradient.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js
```
You should see a **black-to-white gradient** from left to right.

**Option 2: Try the simplest test (solid red)**
```bash
cat example_red.forth | ./forth_compiler.js | ./stack_optimizer.js | ./ws_sender.js
```
You should see a **solid red square**.

**Option 3: Debug what happened**
Open your browser console (F12) and look for:
- JavaScript errors
- Console.log messages showing what was received
- The test function result

The updated `renderer.html` now logs:
- JavaScript length received
- First 200 characters of the code
- Test function call result

### Key Rule for Forth Haiku:

**Your Forth code MUST leave exactly 4 values on the stack: R G B A**
- Each value should be 0.0 to 1.0
- Stack underflow/overflow causes "BOGUS code" fallback

Try the corrected examples and check your browser console - you should now see something!
