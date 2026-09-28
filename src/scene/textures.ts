import * as THREE from 'three';
import { drawPixelText, pixelTextWidth, GLYPH_H } from './pixelFont';
import type { ThemeId } from '../themes';

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

function cardroomBack(): THREE.Texture {
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

function cardroomFace(value: string): THREE.Texture {
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

function cardroomFelt(): THREE.Texture {
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

// ─── 8-bit dungeon: tiny canvases, nearest-neighbour filtering ──────────────

// big enough for 3px glyph cells on two-digit values, so numerals survive the
// low-res render and read clearly across the table
const PW = 48;
const PH = 68;

function pixelTexture(c: HTMLCanvasElement) {
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.magFilter = THREE.NearestFilter;
  t.minFilter = THREE.NearestFilter;
  t.generateMipmaps = false;
  return t;
}

function pixelCanvas(w = PW, h = PH): [HTMLCanvasElement, CanvasRenderingContext2D] {
  const c = document.createElement('canvas');
  c.width = w;
  c.height = h;
  const g = c.getContext('2d')!;
  g.imageSmoothingEnabled = false;
  return [c, g];
}

const GEM = ['...#...', '..###..', '.##.##.', '##...##', '.##.##.', '..###..', '...#...'];

let dungeonBackTex: THREE.Texture | null = null;

function dungeonBack(): THREE.Texture {
  if (dungeonBackTex) return dungeonBackTex;
  const [c, g] = pixelCanvas();
  g.fillStyle = '#f3e9d2';
  g.fillRect(0, 0, PW, PH);
  g.fillStyle = '#2b1640';
  g.fillRect(2, 2, PW - 4, PH - 4);
  g.fillStyle = '#3d2160';
  for (let y = 3; y < PH - 3; y += 2) {
    for (let x = 3 + ((y / 2) % 2); x < PW - 3; x += 2) g.fillRect(x, y, 1, 1);
  }
  g.fillStyle = '#ffcc4d';
  g.fillRect(4, 4, PW - 8, 1);
  g.fillRect(4, PH - 5, PW - 8, 1);
  g.fillRect(4, 4, 1, PH - 8);
  g.fillRect(PW - 5, 4, 1, PH - 8);
  const ox = Math.floor(PW / 2) - 3;
  const oy = Math.floor(PH / 2) - 3;
  GEM.forEach((row, y) => {
    for (let x = 0; x < row.length; x++) {
      if (row[x] === '#') {
        g.fillStyle = '#ffcc4d';
        g.fillRect(ox + x, oy + y, 1, 1);
      } else if (row[x] === '.' && Math.abs(x - 3) + Math.abs(y - 3) < 3) {
        g.fillStyle = '#5fd0c8';
        g.fillRect(ox + x, oy + y, 1, 1);
      }
    }
  });
  dungeonBackTex = pixelTexture(c);
  return dungeonBackTex;
}

const dungeonFaces = new Map<string, THREE.Texture>();

function dungeonFace(value: string): THREE.Texture {
  const cached = dungeonFaces.get(value);
  if (cached) return cached;
  const [c, g] = pixelCanvas();
  g.fillStyle = '#1b1326';
  g.fillRect(0, 0, PW, PH);
  g.fillStyle = '#fbf4e2';
  g.fillRect(2, 2, PW - 4, PH - 4);
  const fits = (c: number) => pixelTextWidth(value, c, true) <= PW - 8;
  const cell = fits(4) ? 4 : fits(3) ? 3 : 2;
  const w = pixelTextWidth(value, cell, true);
  drawPixelText(g, value, Math.floor((PW - w) / 2), Math.floor((PH - GLYPH_H * cell) / 2), cell, '#1b1326', true);
  const t = pixelTexture(c);
  t.center.set(0.5, 0.5);
  t.rotation = Math.PI;
  dungeonFaces.set(value, t);
  return t;
}

let dungeonFeltTex: THREE.Texture | null = null;

function dungeonFelt(): THREE.Texture {
  if (dungeonFeltTex) return dungeonFeltTex;
  const [c, g] = pixelCanvas(16, 16);
  for (let y = 0; y < 16; y++) {
    for (let x = 0; x < 16; x++) {
      const v = 120 + Math.floor(Math.random() * 3) * 14;
      g.fillStyle = `rgb(${v},${v},${v})`;
      g.fillRect(x, y, 1, 1);
    }
  }
  dungeonFeltTex = pixelTexture(c);
  dungeonFeltTex.wrapS = dungeonFeltTex.wrapT = THREE.RepeatWrapping;
  dungeonFeltTex.repeat.set(10, 10);
  return dungeonFeltTex;
}

// ─── theme-aware entry points ───────────────────────────────────────────────

export function cardBackTexture(theme: ThemeId = 'cardroom') {
  return theme === 'dungeon' ? dungeonBack() : cardroomBack();
}

export function cardFaceTexture(value: string, theme: ThemeId = 'cardroom') {
  return theme === 'dungeon' ? dungeonFace(value) : cardroomFace(value);
}

export function feltNoiseTexture(theme: ThemeId = 'cardroom') {
  return theme === 'dungeon' ? dungeonFelt() : cardroomFelt();
}
