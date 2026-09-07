import { PNG } from 'pngjs';
import fs from 'node:fs';
import path from 'node:path';

/**
 * A tiny RGBA pixel buffer with a PNG writer, used only by the offline
 * placeholder-art generator in tools/. Nothing here ships to the browser.
 */
export class PixelCanvas {
  constructor(width, height, bg = [0, 0, 0, 0]) {
    this.width = width;
    this.height = height;
    this.data = Buffer.alloc(width * height * 4);
    if (bg[3] > 0) {
      this.fillRect(0, 0, width, height, bg);
    }
  }

  setPixel(x, y, color) {
    x = Math.round(x);
    y = Math.round(y);
    if (x < 0 || y < 0 || x >= this.width || y >= this.height) return;
    const [r, g, b, a = 255] = color;
    if (a <= 0) return;
    const idx = (y * this.width + x) * 4;
    if (a >= 255) {
      this.data[idx] = r;
      this.data[idx + 1] = g;
      this.data[idx + 2] = b;
      this.data[idx + 3] = 255;
      return;
    }
    const ia = 255 - a;
    const outA = Math.max(this.data[idx + 3], a);
    this.data[idx] = (r * a + this.data[idx] * ia) / 255;
    this.data[idx + 1] = (g * a + this.data[idx + 1] * ia) / 255;
    this.data[idx + 2] = (b * a + this.data[idx + 2] * ia) / 255;
    this.data[idx + 3] = outA;
  }

  fillRect(x, y, w, h, color) {
    const x0 = Math.round(x);
    const y0 = Math.round(y);
    const x1 = Math.round(x + w);
    const y1 = Math.round(y + h);
    for (let yy = y0; yy < y1; yy++) {
      for (let xx = x0; xx < x1; xx++) {
        this.setPixel(xx, yy, color);
      }
    }
  }

  writePng(filePath) {
    const png = new PNG({ width: this.width, height: this.height });
    this.data.copy(png.data);
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    return new Promise((resolve, reject) => {
      const stream = fs.createWriteStream(filePath);
      stream.on('finish', resolve);
      stream.on('error', reject);
      png.pack().pipe(stream);
    });
  }
}
