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

  var temp1 = xpos;
  var temp2 = 0.5;
  work1 = temp2;
  var temp3 = temp1 - work1;
  var temp4 = ypos;
  var temp5 = 0.5;
  work1 = temp5;
  var temp6 = temp4 - work1;
  work1 = temp6;
  work2 = temp3;
  var temp7 = work2;
  var temp8 = work1;
  var temp9 = work2;
  work1 = temp9;
  work2 = temp8;
  var temp10 = work2;
  var temp11 = work1;
  var temp12 = work2;
  work1 = temp12;
  work2 = temp11;
  work3 = temp10;
  work4 = temp7;
  var temp13 = work4 * work2 - work3 * work1;
  var temp14 = work4 * work1 + work3 * work2;
  var temp15 = Math.log(Math.abs(temp14));
  work1 = temp15;
  work2 = temp13;
  var temp16 = work2;
  var temp17 = work1;
  var temp18 = work2;
  work1 = temp18;
  work2 = temp17;
  var temp19 = work2;
  var temp20 = work1;
  var temp21 = work2;
  work1 = temp21;
  work2 = temp20;
  work3 = temp19;
  work4 = temp16;
  var temp22 = work4 * work2 - work3 * work1;
  var temp23 = work4 * work1 + work3 * work2;
  var temp24 = Math.log(Math.abs(temp23));
  work1 = temp24;
  work2 = temp22;
  var temp25 = work2;
  var temp26 = work1;
  var temp27 = work2;
  work1 = temp27;
  work2 = temp26;
  var temp28 = work2;
  var temp29 = work1;
  var temp30 = work2;
  work1 = temp30;
  work2 = temp29;
  work3 = temp28;
  work4 = temp25;
  var temp31 = work4 * work2 - work3 * work1;
  var temp32 = work4 * work1 + work3 * work2;
  var temp33 = Math.log(Math.abs(temp32));
  var temp34 = Math.log(Math.abs(temp33));
  work1 = temp34;
  work2 = temp31;
  var temp35 = work2;
  var temp36 = work1;
  var temp37 = work2;
  dstack.push(temp35);
  dstack.push(temp36);
  dstack.push(temp37);
  dstack.push(1.0);

  return dstack;
};
go
