import * as THREE from 'three';

const W = 256;
const H = 368;

function roundRect(g: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  g.beginPath();
  g.moveTo(x + r, y);
  g.arcTo(x + w, y, x + w, y + h, r);
  g.arcTo(x + w, y + h, x, y + h, r);
  g.arcTo(x, y + h, x, y, r);
  g.arcTo(x, y, x + w, y, r);
  g.closePath();
}

function canvas(): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = W;
  c.height = H;
  return [c, c.getContext('2d')!];
}

function toTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 4;
  return t;
}

let backTexture: THREE.Texture | null = null;

export function cardBackTexture(): THREE.Texture {
  if (backTexture) return backTexture;
  const [c, g] = canvas();
  g.fillStyle = '#f4efe4';
  g.fillRect(0, 0, W, H);
  roundRect(g, 14, 14, W - 28, H - 28, 16);
  g.fillStyle = '#7a2622';
  g.fill();
  g.save();
  g.clip();
  g.strokeStyle = 'rgba(232, 190, 110, 0.35)';
  g.lineWidth = 2;
  for (let i = -H; i < W + H; i += 18) {
    g.beginPath();
    g.moveTo(i, 0);
    g.lineTo(i + H, H);
    g.stroke();
    g.beginPath();
    g.moveTo(i, H);
    g.lineTo(i + H, 0);
    g.stroke();
  }
  g.restore();
  roundRect(g, 26, 26, W - 52, H - 52, 10);
  g.strokeStyle = 'rgba(232, 190, 110, 0.85)';
  g.lineWidth = 3;
  g.stroke();
  // centre medallion
  g.beginPath();
  g.ellipse(W / 2, H / 2, 46, 58, 0, 0, Math.PI * 2);
  g.fillStyle = '#7a2622';
  g.fill();
  g.strokeStyle = '#e8be6e';
  g.lineWidth = 3;
  g.stroke();
  g.fillStyle = '#e8be6e';
  g.font = '600 44px Fraunces, Georgia, serif';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  g.fillText('P', W / 2, H / 2 + 3);
  backTexture = toTexture(c);
  return backTexture;
}

const faceCache = new Map<string, THREE.Texture>();

export function cardFaceTexture(value: string): THREE.Texture {
  const cached = faceCache.get(value);
  if (cached) return cached;
  const [c, g] = canvas();
  g.fillStyle = '#f4efe4';
  g.fillRect(0, 0, W, H);
  roundRect(g, 14, 14, W - 28, H - 28, 14);
  g.strokeStyle = 'rgba(29, 27, 23, 0.14)';
  g.lineWidth = 2;
  g.stroke();
  g.fillStyle = '#1d1b17';
  g.textAlign = 'center';
  g.textBaseline = 'middle';
  const size = value.length >= 3 ? 104 : value.length === 2 ? 128 : 150;
  g.font = `700 ${size}px Fraunces, Georgia, serif`;
  g.fillText(value, W / 2, H / 2 + 6);
  g.font = '600 34px Fraunces, Georgia, serif';
  g.textAlign = 'left';
  g.fillText(value, 30, 50);
  g.save();
  g.translate(W - 30, H - 50);
  g.rotate(Math.PI);
  g.fillText(value, 0, 0);
  g.restore();
  const t = toTexture(c);
  // the card flips about its long axis, which leaves the underside upside down
  t.center.set(0.5, 0.5);
  t.rotation = Math.PI;
  faceCache.set(value, t);
  return t;
}

let feltTexture: THREE.Texture | null = null;

export function feltNoiseTexture(): THREE.Texture {
  if (feltTexture) return feltTexture;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d')!;
  const img = g.createImageData(256, 256);
  for (let i = 0; i < img.data.length; i += 4) {
    const n = 118 + Math.random() * 20;
    img.data[i] = img.data[i + 1] = img.data[i + 2] = n;
    img.data[i + 3] = 255;
  }
  g.putImageData(img, 0, 0);
  feltTexture = new THREE.CanvasTexture(c);
  feltTexture.wrapS = feltTexture.wrapT = THREE.RepeatWrapping;
  feltTexture.repeat.set(6, 6);
  return feltTexture;
}

/** Re-render cached textures once the display font has loaded. */
export async function whenFontsReady(): Promise<void> {
  if (typeof document === 'undefined' || !document.fonts) return;
  try {
    await Promise.race([
      document.fonts.load('700 120px Fraunces'),
      new Promise((r) => setTimeout(r, 2500)),
    ]);
  } catch {
    // font unavailable — Georgia fallback is fine
  }
}
