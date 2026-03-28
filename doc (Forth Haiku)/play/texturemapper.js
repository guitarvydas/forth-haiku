// A simple texture mapper in pure JavaScript

class Texture {
  constructor(width, height) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height * 4);  // RGBA
  }
  
  setPixel(x, y, r, g, b, a) {
    const i = (y * this.width + x) * 4;
    this.data[i] = r;
    this.data[i + 1] = g;
    this.data[i + 2] = b;
    this.data[i + 3] = a;
  }
  
  sample(u, v) {
    // Wrap to 0..1
    u = u - Math.floor(u);
    v = v - Math.floor(v);
    
    // Convert to pixel coordinates
    const x = Math.floor(u * this.width);
    const y = Math.floor(v * this.height);
    
    const i = (y * this.width + x) * 4;
    return {
      r: this.data[i],
      g: this.data[i + 1],
      b: this.data[i + 2],
      a: this.data[i + 3]
    };
  }
}

// Create a checkerboard texture
const tex = new Texture(8, 8);
for (let y = 0; y < 8; y++) {
  for (let x = 0; x < 8; x++) {
    const color = (x + y) % 2 === 0 ? 255 : 0;
    tex.setPixel(x, y, color, color, color, 255);
  }
}

console.log (tex);

// Sample it
const color = tex.sample(0.5, 0.5);  // Center
console.log(color);  // { r: 255, g: 255, b: 255, a: 255 } or black

const color2 = tex.sample(0.6, 0.25);
console.log(color2);
