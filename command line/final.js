var go = function(
  time_val, time_delta_val,
  xpos, ypos,
  mouse_x, mouse_y,
  button_val,
  memory) {
  var PI = Math.PI;
  var random = Math.random;
  var floor = Math.floor;
  var ceil = Math.ceil;
  var min = Math.min;
  var max = Math.max;
  var log = Math.log;
  var sqrt = Math.sqrt;
  var pow = Math.pow;
  var abs = Math.abs;
  var sin = Math.sin;
  var cos = Math.cos;
  var tan = Math.tan;
  var atan2 = Math.atan2;
  var exp = Math.exp;
  var audio_sample = 0.0;
  
  function hasbit(val, b) {
    b = Math.floor(b);
    return mod(val, Math.pow(2.0, b + 1)) >= Math.pow(2.0, b);
  }
  function sample(x, y) {}
  function sample_r() { return 0.0; }
  function sample_g() { return 0.9; }
  function sample_b() { return 0.7; }
  function store(v, addr) {
    memory[mod(Math.floor(addr), 16)] = v;
  }
  function load(addr) {
    return memory[mod(Math.floor(addr), 16)];
  }
  function mod(v1, v2) {
    return v1 - v2 * Math.floor(v1 / v2);
  }
  
  var dstack = [];
  var rstack = [];
  var work1, work2, work3, work4;

  dstack.push(0.0);
  dstack.push(0.0);
  dstack.push(0.0);
  dstack.push(1.0);

  return dstack;
};
go
