# Forth Haiku: The Beauty of Dumb Code

## Part 5: Dictionary-Based Code Generation

We've explored the optimizer's cleverness (Part 4). Now let's look at Phase 1—the code generator—which succeeds precisely because it's **not** clever.

### The Dictionary

At the heart of Phase 1 is a simple JavaScript object that maps Forth words to JavaScript code fragments:

```javascript
const dict = {};

dict['dup'] = [
  'work1 = dstack.pop();',
  'dstack.push(work1);',
  'dstack.push(work1);'
];

dict['+'] = [
  'dstack.push(dstack.pop() + dstack.pop());'
];

dict['swap'] = [
  'work1 = dstack.pop();',
  'work2 = dstack.pop();',
  'dstack.push(work1);',
  'dstack.push(work2);'
];
```

Each entry is an **array of JavaScript statements** that implement the Forth word using explicit stack operations.

That's it. No parsing complexity, no optimization, no cleverness.

### Code Generation Loop

The compiler is equally simple:

```javascript
function compile(source) {
  const code = [FUNC_SIGNATURE + ' var dstack=[]; var rstack=[]; '];
  const words = source.split(/\s+/);
  
  for (let word of words) {
    if (word in dict) {
      code.push(...dict[word]);  // Concatenate the code fragments
    } else {
      const num = parseFloat(word);
      code.push('dstack.push(' + num + ');');  // It's a number
    }
  }
  
  code.push('return dstack;');
  return code;
}
```

For each word:
- If it's in the dictionary, append its JavaScript code
- If it's a number, generate a push
- Done

The result is an array of JavaScript statements that can be joined and eval'd.

### Why This Works

This simple approach works because the dictionary entries are **carefully designed** to compose correctly.

Each entry:
1. Leaves the stacks in a consistent state
2. Uses the same conventions (work variables, dstack/rstack names)
3. Has no side effects beyond stack manipulation

This means you can concatenate them in any order and get valid code. The dictionary entries are like Lego bricks—they just snap together.

### Adding New Words

Want to add a new Forth word? Just add a dictionary entry:

```javascript
dict['square'] = [
  'work1 = dstack.pop();',
  'dstack.push(work1 * work1);'
];
```

Now `square` works everywhere, composed with any other word.

Want to add trigonometry?

```javascript
dict['sin'] = ['dstack.push(Math.sin(dstack.pop()));'];
dict['cos'] = ['dstack.push(Math.cos(dstack.pop()));'];
```

Two lines. Done.

The extensibility comes from the **simplicity** of the generation strategy.

### User-Defined Words

Forth lets you define new words in terms of existing ones:

```forth
: square dup * ;
: pythag square swap square + sqrt ;
```

The compiler handles this by adding user definitions to the same dictionary:

```javascript
if (word === ':') {
  const name = getNextWord();
  const definition = compileUntil(';');
  dict[name] = definition;  // Add to dictionary
}
```

Now `square` and `pythag` are first-class words, indistinguishable from built-ins.

### Complex Numbers

The haiku.js dictionary includes operations for complex arithmetic:

```javascript
dict['z+'] = [
  'work1 = dstack.pop();',  // Im(b)
  'work2 = dstack.pop();',  // Re(b)
  'work3 = dstack.pop();',  // Im(a)
  'work4 = dstack.pop();',  // Re(a)
  'dstack.push(work4 + work2);',  // Re(a+b)
  'dstack.push(work3 + work1);'   // Im(a+b)
];

dict['z*'] = [
  'work1 = dstack.pop();',
  'work2 = dstack.pop();',
  'work3 = dstack.pop();',
  'work4 = dstack.pop();',
  'dstack.push(work4 * work2 - work3 * work1);',  // Re
  'dstack.push(work4 * work1 + work3 * work2);'   // Im
];
```

These implement the complex arithmetic formulas:
- `(a+bi) + (c+di) = (a+c) + (b+d)i`
- `(a+bi) * (c+di) = (ac-bd) + (ad+bc)i`

Just expand the formulas, translate to stack operations, done. The optimizer will clean it up.

### Control Flow

Even control flow works through dictionary entries:

```javascript
dict['if'] = ['if(dstack.pop() != 0.0) {'];
dict['else'] = ['} else {'];
dict['then'] = ['}'];
```

They generate **literal JavaScript control flow**. The braces match because Forth enforces balanced `if`/`then` pairs.

This is remarkably simple for something that usually requires special parsing.

### The Work Variables

Notice the `work1`, `work2`, `work3`, `work4` variables appearing in the dictionary entries. These are pre-declared temporary variables available to all generated code.

They serve two purposes:

1. **Intermediate storage**: When you need to pop values in a specific order
2. **Side-effect prevention**: Ensure operations happen left-to-right

For example, subtraction requires careful ordering:

```javascript
dict['-'] = [
  'work1 = dstack.pop();',           // Second operand
  'dstack.push(dstack.pop() - work1);'  // First - second
];
```

Without `work1`, both pops might happen in the wrong order (JavaScript evaluation order is undefined for function arguments).

### Why "Dumb" is Smart

This dictionary-based approach sacrifices efficiency for:

**Simplicity**: The entire code generator is ~50 lines

**Correctness**: Each entry is tested independently

**Extensibility**: Adding words is trivial

**Maintainability**: No complex logic to debug

The optimizer will fix the inefficiency. The generator's job is just to be **correct** and **simple**.

### The Separation Pays Off

Imagine trying to generate optimal code directly. You'd need to:
- Track stack depth while parsing
- Allocate temporaries during code generation
- Handle control flow with proper variable scoping
- Deal with user-defined words

All at once. In one pass.

By separating generation from optimization, both become simpler:
- Generation: Mechanical translation, no thinking required
- Optimization: Stack analysis, no Forth semantics required

Each is simple because it does **one thing**.

### Composite Operations

Some dictionary entries build on others:

```javascript
dict['over'] = [
  'work1 = dstack.pop();',
  'work2 = dstack.pop();',
  'dstack.push(work2);',
  'dstack.push(work1);',
  'dstack.push(work2);'
];

dict['2dup'] = dict['over'].concat(dict['over']);
```

`2dup` (duplicate top two items) is just `over` twice. No need to rewrite it—just reuse the existing definition.

This compositional approach mirrors Forth itself, where complex words are built from simpler ones.

### The Forth Philosophy

This dictionary-based generation embodies Forth's philosophy:
- Build up from primitives
- Each piece does one thing
- Composition creates complexity

The haiku.js compiler **is Forth**, even though it's written in JavaScript.

### Coming Up

In Part 6 (conclusion), we'll step back and look at the bigger lessons. What does this compiler teach us about software design? How do these principles apply beyond compilers? And why does simplicity matter?

---

*Part 5 of the Forth Haiku series. [Read Part 1: Overview](article_01_overview.md) | [Read Part 2: Examples](article_02_examples.md) | [Read Part 3: Pipeline Architecture](article_03_pipeline.md) | [Read Part 4: Optimizer](article_04_optimizer.md)*
