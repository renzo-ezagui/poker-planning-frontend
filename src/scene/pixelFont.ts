// 5×7 bitmap glyphs for everything that can appear on a card.
const GLYPHS: Record<string, string[]> = {
  '0': ['01110', '10001', '10001', '10001', '10001', '10001', '01110'],
  '1': ['00100', '01100', '00100', '00100', '00100', '00100', '01110'],
  '2': ['01110', '10001', '00001', '00110', '01000', '10000', '11111'],
  '3': ['11110', '00001', '00001', '01110', '00001', '00001', '11110'],
  '4': ['00010', '00110', '01010', '10010', '11111', '00010', '00010'],
  '5': ['11111', '10000', '11110', '00001', '00001', '10001', '01110'],
  '6': ['00110', '01000', '10000', '11110', '10001', '10001', '01110'],
  '7': ['11111', '00001', '00010', '00100', '01000', '01000', '01000'],
  '8': ['01110', '10001', '10001', '01110', '10001', '10001', '01110'],
  '9': ['01110', '10001', '10001', '01111', '00001', '00010', '01100'],
  '?': ['01110', '10001', '00001', '00010', '00100', '00000', '00100'],
  X: ['10001', '10001', '01010', '00100', '01010', '10001', '10001'],
  S: ['01111', '10000', '10000', '01110', '00001', '00001', '11110'],
  M: ['10001', '11011', '10101', '10101', '10001', '10001', '10001'],
  L: ['10000', '10000', '10000', '10000', '10000', '10000', '11111'],
};

export const GLYPH_W = 5;
export const GLYPH_H = 7;

/** Draws `text` with 1px gaps between glyphs; returns the width used (in grid cells). */
export function drawPixelText(
  g: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  cell: number,
  color: string,
): number {
  g.fillStyle = color;
  let cx = x;
  for (const ch of text) {
    const rows = GLYPHS[ch] ?? GLYPHS['?'];
    rows.forEach((row, ry) => {
      for (let rx = 0; rx < row.length; rx++) {
        if (row[rx] === '1') g.fillRect(cx + rx * cell, y + ry * cell, cell, cell);
      }
    });
    cx += (GLYPH_W + 1) * cell;
  }
  return (text.length * (GLYPH_W + 1) - 1) * cell;
}

export function pixelTextWidth(text: string, cell: number) {
  return (text.length * (GLYPH_W + 1) - 1) * cell;
}
