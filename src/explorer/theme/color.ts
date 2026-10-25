// Color conversion helpers for the visual editor.
//
// The browser-side picker needs hex ⇄ rgb ⇄ hsl so a token can be edited with
// hue/saturation/lightness sliders instead of a bare hex field. Only the forms
// the editor actually needs are implemented; nothing here writes to the token
// source.

import { hexToRgb } from "../../../tokens/color.mjs";

export interface Rgb {
  r: number;
  g: number;
  b: number;
}
export interface Hsl {
  h: number; // 0–360
  s: number; // 0–100
  l: number; // 0–100
}

const HEX_RE = /^#(?:[0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

export function isHex(value: string): boolean {
  return HEX_RE.test(value.trim());
}

/** Expand #abc → #aabbcc so the color input always receives six digits. */
export function normalizeHex(value: string): string {
  const hex = value.trim().replace(/^#/, "");
  if (hex.length === 3) {
    return `#${hex
      .split("")
      .map((c) => c + c)
      .join("")
      .toUpperCase()}`;
  }
  return `#${hex.toUpperCase()}`;
}

export function hexToHsl(hex: string): Hsl {
  const { r, g, b } = hexToRgb(normalizeHex(hex)) as Rgb;
  const rn = r / 255;
  const gn = g / 255;
  const bn = b / 255;
  const max = Math.max(rn, gn, bn);
  const min = Math.min(rn, gn, bn);
  const delta = max - min;
  const l = (max + min) / 2;

  let h = 0;
  let s = 0;
  if (delta !== 0) {
    s = delta / (1 - Math.abs(2 * l - 1));
    if (max === rn) h = ((gn - bn) / delta) % 6;
    else if (max === gn) h = (bn - rn) / delta + 2;
    else h = (rn - gn) / delta + 4;
    h *= 60;
    if (h < 0) h += 360;
  }
  return { h: Math.round(h), s: Math.round(s * 100), l: Math.round(l * 100) };
}

export function hslToHex({ h, s, l }: Hsl): string {
  const sn = Math.min(100, Math.max(0, s)) / 100;
  const ln = Math.min(100, Math.max(0, l)) / 100;
  const hue = ((Math.round(h) % 360) + 360) % 360;
  const c = (1 - Math.abs(2 * ln - 1)) * sn;
  const x = c * (1 - Math.abs(((hue / 60) % 2) - 1));
  const m = ln - c / 2;
  // One entry per 60° sector, as (r, g, b) fractions of c/x.
  const sectors: [number, number, number][] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = sectors[Math.floor(hue / 60) % 6]!;
  const toHex = (n: number) =>
    Math.round((n + m) * 255)
      .toString(16)
      .padStart(2, "0")
      .toUpperCase();
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}
