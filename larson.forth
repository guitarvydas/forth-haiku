t dup floor - 10 * floor position ! \ Calculate progression.
position @ 10 / \ Calculate light position,
t floor 2 mod if 1 swap - else then fposition ! \ switching direction if needed.
x dup fposition @ >= swap fposition @ .1 + < and 1 * \ Arrange on grid.
y dup .475 > swap .525 < and * \ Clamp vertically.