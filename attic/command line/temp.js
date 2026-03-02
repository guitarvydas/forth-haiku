var go = function(
  time_val, time_delta_val,
  xpos, ypos,
  mouse_x, mouse_y,
  button_val,
  memory) {
  var PI = Math.PI;
  var random = Math.random;
  var floor = Math.floor;
  var sin = Math.sin;
  var cos = Math.cos;
  var tan = Math.tan;
  var sqrt = Math.sqrt;
  var abs = Math.abs;
  
  function mod(a, b) { return ((a % b) + b) % b; }
  function hasbit(num, bit) { return ((num >> bit) & 1) === 1; }
  function sample(arr, x, y) { return arr[floor(x) + floor(y) * 16]; }
  function store(arr, x, y, val) { arr[floor(x) + floor(y) * 16] = val; }
  function load(arr, x, y) { return arr[floor(x) + floor(y) * 16] || 0; }
  
  var dstack = [];
  var rstack = [];
  var work1, work2, work3, work4;

  
  dstack.push(1);
  dstack.push(2);
  dstack.push(dstack.pop() + dstack.pop());
  
  return dstack;
};
go
