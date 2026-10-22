import { canvasFont, theme } from '../carnival';
import { palette } from './palette';
import {
  CART_KINDS,
  toScreen,
  type BoothSlot,
  type MidwayMap,
  type Point,
  type Prop,
  type Rect,
  type Walker,
} from './world';

/**
 * Flat, isometric vector drawing for the midway, in world pixels. The caller
 * sets up the canvas transform for the camera and zoom.
 */

type Ctx = CanvasRenderingContext2D;
type Pt = readonly [number, number];

/** A tile position, `z` pixels above the ground, in world pixels. */
function at(x: number, y: number, z = 0): Pt {
  const s = toScreen(x, y);
  return [s.x, s.y - z];
}

/** Screen size of a one-tile radius circle lying on the ground. */
const ISO_RX = 16 * Math.SQRT2;
const ISO_RY = 8 * Math.SQRT2;

function poly(ctx: Ctx, points: readonly Pt[], color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fill();
}

function oval(ctx: Ctx, x: number, y: number, rx: number, ry: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.ellipse(x, y, rx, ry, 0, 0, Math.PI * 2);
  ctx.fill();
}

function stroke(ctx: Ctx, points: readonly Pt[], color: string, width: number) {
  ctx.strokeStyle = color;
  ctx.lineWidth = width;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i++) ctx.lineTo(points[i][0], points[i][1]);
  ctx.stroke();
}

const lerp = (a: number, b: number, s: number) => a + (b - a) * s;

/** A tile-aligned box, `z` pixels off the ground and `h` pixels tall. */
function box(
  ctx: Ctx,
  x: number,
  y: number,
  w: number,
  d: number,
  z: number,
  h: number,
  top: string,
  left: string,
  right: string,
) {
  if (h > 0) {
    poly(
      ctx,
      [at(x, y + d, z), at(x + w, y + d, z), at(x + w, y + d, z + h), at(x, y + d, z + h)],
      left,
    );
    poly(
      ctx,
      [at(x + w, y + d, z), at(x + w, y, z), at(x + w, y, z + h), at(x + w, y + d, z + h)],
      right,
    );
  }
  poly(
    ctx,
    [at(x, y, z + h), at(x + w, y, z + h), at(x + w, y + d, z + h), at(x, y + d, z + h)],
    top,
  );
}

/** A vertical wall from one ground point to another, in alternating colour strips. */
function stripedWall(
  ctx: Ctx,
  a: Point,
  b: Point,
  z: number,
  h: number,
  strips: number,
  colors: readonly string[],
) {
  for (let i = 0; i < strips; i++) {
    const s0 = i / strips;
    const s1 = (i + 1) / strips;
    const x0 = lerp(a.x, b.x, s0);
    const y0 = lerp(a.y, b.y, s0);
    const x1 = lerp(a.x, b.x, s1);
    const y1 = lerp(a.y, b.y, s1);
    poly(
      ctx,
      [at(x0, y0, z), at(x1, y1, z), at(x1, y1, z + h), at(x0, y0, z + h)],
      colors[i % colors.length],
    );
  }
}

/** A scalloped trim hanging from an edge. */
function scallops(
  ctx: Ctx,
  a: Point,
  b: Point,
  z: number,
  count: number,
  depth: number,
  colors: readonly string[],
) {
  for (let i = 0; i < count; i++) {
    const p0 = at(lerp(a.x, b.x, i / count), lerp(a.y, b.y, i / count), z);
    const p1 = at(lerp(a.x, b.x, (i + 1) / count), lerp(a.y, b.y, (i + 1) / count), z);
    ctx.fillStyle = colors[i % colors.length];
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo((p0[0] + p1[0]) / 2, (p0[1] + p1[1]) / 2 + depth * 2, p1[0], p1[1]);
    ctx.closePath();
    ctx.fill();
  }
}

/** Little triangular flags hanging along a line of screen points. */
function flags(ctx: Ctx, points: readonly Pt[], t: number, size = 5, phase = 0) {
  let n = 0;
  for (let i = 0; i < points.length - 1; i++) {
    const [x0, y0] = points[i];
    const [x1, y1] = points[i + 1];
    const flutter = Math.sin(t * 4 + i * 0.9 + phase) * 1.2;
    ctx.fillStyle = palette.bunting[n++ % palette.bunting.length];
    ctx.beginPath();
    ctx.moveTo(x0, y0);
    ctx.lineTo(x1, y1);
    ctx.lineTo((x0 + x1) / 2 + flutter, (y0 + y1) / 2 + size * 1.4);
    ctx.closePath();
    ctx.fill();
  }
}

function flag(ctx: Ctx, x: number, y: number, t: number, color: string, size = 1) {
  stroke(
    ctx,
    [
      [x, y],
      [x, y - 14 * size],
    ],
    palette.metalShade,
    1.2,
  );
  const wave = Math.sin(t * 5 + x * 0.1) * 1.5 * size;
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(x, y - 14 * size);
  ctx.quadraticCurveTo(x + 6 * size, y - 16 * size + wave, x + 12 * size, y - 14 * size);
  ctx.lineTo(x + 9 * size, y - 11 * size + wave * 0.5);
  ctx.lineTo(x + 12 * size, y - 8 * size);
  ctx.quadraticCurveTo(x + 6 * size, y - 10 * size + wave, x, y - 8 * size);
  ctx.closePath();
  ctx.fill();
}

/**
 * Draws on a vertical plane facing down-left (parallel to the x axis), so
 * signs and wheels sit in the scene. Local x runs along the plane, local y down.
 */
function onPlane(ctx: Ctx, origin: Pt, paint: () => void) {
  ctx.save();
  ctx.transform(0.894, 0.447, 0, 1, origin[0], origin[1]);
  paint();
  ctx.restore();
}

/** A wooden sign with text, in plane-local coordinates centred on (0, 0). */
function signBoard(
  ctx: Ctx,
  text: string,
  width: number,
  height: number,
  colors: { board: string; edge: string; text: string },
  glow = false,
) {
  ctx.fillStyle = colors.edge;
  ctx.beginPath();
  ctx.roundRect(-width / 2 - 2, -height / 2 - 2, width + 4, height + 4, 4);
  ctx.fill();
  ctx.fillStyle = colors.board;
  ctx.beginPath();
  ctx.roundRect(-width / 2, -height / 2, width, height, 3);
  ctx.fill();
  if (glow) {
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 2;
    ctx.stroke();
  }
  ctx.font = canvasFont('small', 'bold');
  const fit = Math.min(
    (height * 0.62) / theme.font.small,
    (width - 8) / ctx.measureText(text).width,
  );
  ctx.save();
  ctx.scale(fit, fit);
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, 0, 1);
  ctx.restore();
}

// ── Ground ────────────────────────────────────────────────────────────────

/** The world-pixel height of the horizon; the field runs off to it. */
export const HORIZON = -24;

function hash(x: number, y: number, salt = 0): number {
  let h = (x * 374761393 + y * 668265263 + salt * 2147483647) | 0;
  h = Math.imul(h ^ (h >>> 13), 1274126177);
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
}

function rectPoints(r: Rect, lift = 0): Pt[] {
  return [
    at(r.x, r.y, lift),
    at(r.x + r.w, r.y, lift),
    at(r.x + r.w, r.y + r.h, lift),
    at(r.x, r.y + r.h, lift),
  ];
}

/** The world-pixel box the pre-drawn ground layer covers. */
export function groundBounds(map: MidwayMap): Box {
  return {
    left: -map.height * 16 - 64,
    right: map.width * 16 + 64,
    top: -64,
    bottom: (map.width + map.height) * 8 + 4,
  };
}

/** The open field round the midway, filling the view from the horizon down. */
export function drawField(ctx: Ctx, view: Box) {
  ctx.fillStyle = palette.haze;
  ctx.fillRect(view.left, HORIZON, view.right - view.left, 6);
  ctx.fillStyle = palette.grass;
  ctx.fillRect(view.left, HORIZON + 6, view.right - view.left, Math.max(0, view.bottom - HORIZON));
}

/**
 * The most pixels the ground layer may use. Safari refuses canvases over
 * 16,777,216 pixels, and a long midway on a sharp screen would pass that.
 */
const MAX_GROUND_PIXELS = 16_000_000;

export interface GroundLayer {
  canvas: HTMLCanvasElement;
  /** Device pixels per world pixel the layer was drawn at. */
  scale: number;
}

/**
 * Draws the parts of the ground that never change (the grass, paths, trees
 * and the hedge's back two sides) once, onto an off-screen canvas covering
 * groundBounds(map). It uses `scale` device pixels per world pixel, or less
 * when that would make the canvas too big, so its size stays bounded however
 * long the midway grows.
 */
export function drawGroundLayer(map: MidwayMap, wanted: number): GroundLayer {
  const bounds = groundBounds(map);
  const area = (bounds.right - bounds.left) * (bounds.bottom - bounds.top);
  const scale = Math.min(wanted, Math.sqrt(MAX_GROUND_PIXELS / area));
  const canvas = document.createElement('canvas');
  canvas.width = Math.ceil((bounds.right - bounds.left) * scale);
  canvas.height = Math.ceil((bounds.bottom - bounds.top) * scale);
  const ctx = canvas.getContext('2d')!;
  ctx.setTransform(scale, 0, 0, scale, -bounds.left * scale, -bounds.top * scale);

  // Lighter plots of grass inside the hedge, raised a little above the paths.
  poly(ctx, rectPoints({ x: 0, y: 0, w: map.width, h: map.height }), palette.grassLight);
  for (const path of map.paths) poly(ctx, rectPoints(path, 3), palette.grassEdge);
  for (const path of map.paths) poly(ctx, rectPoints(path), palette.path);

  // Tufts of grass.
  ctx.strokeStyle = palette.grassDark;
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let y = 1; y < map.height - 1; y++) {
    for (let x = 1; x < map.width - 1; x++) {
      if (map.ground[y * map.width + x] !== 'grass' || hash(x, y) > 0.5) continue;
      const [px, py] = at(x + hash(x, y, 1), y + hash(x, y, 2));
      ctx.moveTo(px - 2, py - 2);
      ctx.lineTo(px, py);
      ctx.lineTo(px + 2, py - 3);
    }
  }
  ctx.stroke();

  // Trees out in the field behind the midway.
  for (let i = 0; i < map.width; i += 2) tree(ctx, i + 0.5 + hash(i, 1) * 0.6, -1.4 - hash(i, 2));
  for (let i = 2; i < map.height; i += 2) tree(ctx, -1.4 - hash(1, i), i + 0.5 + hash(2, i) * 0.6);

  hedge(ctx, { x: 0, y: 0, w: map.width, h: 1 });
  hedge(ctx, { x: 0, y: 0, w: 1, h: map.height });
  return { canvas, scale };
}

function tree(ctx: Ctx, x: number, y: number) {
  const [px, py] = at(x, y);
  oval(ctx, px + 4, py + 1, 12, 5, palette.shadow);
  poly(
    ctx,
    [
      [px - 1.5, py],
      [px + 1.5, py],
      [px + 1.5, py - 12],
      [px - 1.5, py - 12],
    ],
    palette.woodDark,
  );
  oval(ctx, px, py - 20, 11, 11, palette.hedgeDark);
  oval(ctx, px - 2, py - 22, 9, 9, palette.hedge);
  oval(ctx, px - 4, py - 25, 4, 4, palette.hedgeLight);
}

function hedge(ctx: Ctx, area: Rect) {
  box(
    ctx,
    area.x + 0.15,
    area.y + 0.15,
    area.w - 0.3,
    area.h - 0.3,
    0,
    9,
    palette.hedgeLight,
    palette.hedge,
    palette.hedgeDark,
  );
}

/** The hedge's front two sides, which can stand in front of anything. */
export function drawFrontHedge(ctx: Ctx, map: MidwayMap) {
  const h = map.height - 1;
  hedge(ctx, { x: map.width - 1, y: 1, w: 1, h: map.height - 1 });
  hedge(ctx, { x: 1, y: h, w: map.avenueX - 1, h: 1 });
  hedge(ctx, { x: map.avenueX + 2, y: h, w: map.width - map.avenueX - 3, h: 1 });
}

// ── Round things: tents, the big top, the carousel ────────────────────────

interface Stripes {
  a: string;
  aShade: string;
  b: string;
  bShade: string;
}

const RED: Stripes = {
  a: palette.red,
  aShade: palette.redShade,
  b: palette.cream,
  bShade: palette.creamShade,
};
const GOLD: Stripes = {
  a: palette.gold,
  aShade: palette.goldShade,
  b: palette.cream,
  bShade: palette.creamShade,
};
const BLUE: Stripes = {
  a: palette.blue,
  aShade: palette.blueShade,
  b: palette.cream,
  bShade: palette.creamShade,
};
const TENT_COLORS = [GOLD, BLUE, BLUE, RED] as const;

function rimPoint(c: Pt, r: number, angle: number, z: number): Pt {
  return [c[0] + Math.cos(angle) * r * ISO_RX, c[1] + Math.sin(angle) * r * ISO_RY - z];
}

/** The front half of a striped cylinder. */
function cylinder(ctx: Ctx, c: Pt, r: number, z: number, h: number, colors: Stripes, count = 16) {
  for (let k = 0; k < count; k++) {
    const a0 = Math.max(0, (k / count) * Math.PI * 2);
    const a1 = Math.min(Math.PI, ((k + 1) / count) * Math.PI * 2);
    if (a1 <= a0) continue;
    const points: Pt[] = [];
    for (let i = 0; i <= 4; i++) points.push(rimPoint(c, r, lerp(a0, a1, i / 4), z));
    for (let i = 4; i >= 0; i--) points.push(rimPoint(c, r, lerp(a0, a1, i / 4), z + h));
    const shade = (a0 + a1) / 2 < Math.PI * 0.35;
    poly(
      ctx,
      points,
      k % 2 === 0 ? (shade ? colors.aShade : colors.a) : shade ? colors.bShade : colors.b,
    );
  }
}

/** A striped, slightly domed cone roof. `turn` spins the stripes. */
function dome(
  ctx: Ctx,
  c: Pt,
  r: number,
  z: number,
  h: number,
  colors: Stripes,
  turn = 0,
  count = 16,
) {
  const apex: Pt = [c[0], c[1] - z - h];
  const wedges = Array.from({ length: count }, (_, k) => {
    const a0 = turn + (k / count) * Math.PI * 2;
    const a1 = turn + ((k + 1) / count) * Math.PI * 2;
    return { k, a0, a1, mid: (a0 + a1) / 2 };
  }).sort((p, q) => Math.sin(p.mid) - Math.sin(q.mid));
  for (const { k, a0, a1, mid } of wedges) {
    const control = (angle: number) => rimPoint(c, r * 0.92, angle, z + h * 0.6);
    const start = rimPoint(c, r, a0, z);
    const end = rimPoint(c, r, a1, z);
    const c0 = control(a0);
    const c1 = control(a1);
    ctx.beginPath();
    ctx.moveTo(apex[0], apex[1]);
    ctx.quadraticCurveTo(c0[0], c0[1], start[0], start[1]);
    for (let i = 1; i <= 3; i++) {
      const p = rimPoint(c, r, lerp(a0, a1, i / 3), z);
      ctx.lineTo(p[0], p[1]);
    }
    ctx.lineTo(end[0], end[1]);
    ctx.quadraticCurveTo(c1[0], c1[1], apex[0], apex[1]);
    const shade = Math.cos(mid) > 0.45;
    ctx.fillStyle =
      k % 2 === 0 ? (shade ? colors.aShade : colors.a) : shade ? colors.bShade : colors.b;
    ctx.fill();
  }
}

/** Scallops round the front of a circle. */
function scallopRing(
  ctx: Ctx,
  c: Pt,
  r: number,
  z: number,
  count: number,
  depth: number,
  colors: readonly string[],
) {
  for (let k = 0; k < count; k++) {
    const a0 = (k / count) * Math.PI;
    const a1 = ((k + 1) / count) * Math.PI;
    const p0 = rimPoint(c, r, a0, z);
    const p1 = rimPoint(c, r, a1, z);
    const m = rimPoint(c, r * 1.02, (a0 + a1) / 2, z - depth * 2);
    ctx.fillStyle = colors[k % colors.length];
    ctx.beginPath();
    ctx.moveTo(p0[0], p0[1]);
    ctx.quadraticCurveTo(m[0], m[1], p1[0], p1[1]);
    ctx.closePath();
    ctx.fill();
  }
}

function ringFlags(ctx: Ctx, c: Pt, r: number, z: number, t: number, count = 14) {
  const points: Pt[] = [];
  for (let i = 0; i <= count; i++) {
    const angle = 0.08 + (i / count) * (Math.PI - 0.16);
    points.push(rimPoint(c, r, angle, z));
  }
  flags(ctx, points, t, 3.5);
}

function knob(ctx: Ctx, x: number, y: number) {
  oval(ctx, x, y, 3, 3, palette.gold);
  oval(ctx, x - 1, y - 1, 1.2, 1.2, palette.cream);
}

function roundTent(
  ctx: Ctx,
  cx: number,
  cy: number,
  r: number,
  wall: number,
  roof: number,
  colors: Stripes,
  t: number,
  flagColor: string = palette.gold,
) {
  const c = at(cx, cy);
  oval(ctx, c[0] + 8, c[1] + 4, r * ISO_RX * 1.15, r * ISO_RY * 1.15, palette.shadow);
  cylinder(ctx, c, r, 0, wall, colors);
  // The door, with its curtains tied back.
  const door: Pt[] = [];
  for (let i = 0; i <= 6; i++)
    door.push(rimPoint(c, r, lerp(Math.PI / 2 - 0.24, Math.PI / 2 + 0.24, i / 6), 0));
  const top = rimPoint(c, r, Math.PI / 2, wall * 0.85);
  poly(
    ctx,
    [...door, [door[6][0], top[1] + 6], [top[0], top[1]], [door[0][0], top[1] + 6]],
    palette.opening,
  );
  stroke(ctx, [door[0], [door[0][0] + 2, top[1] + 8], [top[0], top[1]]], palette.gold, 2);
  stroke(ctx, [door[6], [door[6][0] - 2, top[1] + 8], [top[0], top[1]]], palette.gold, 2);

  scallopRing(ctx, c, r * 1.02, wall, 10, 3, [colors.a, colors.b]);
  dome(ctx, c, r * 1.12, wall, roof, colors);
  scallopRing(ctx, c, r * 1.12, wall, 12, 4, [colors.a, colors.b]);
  ringFlags(ctx, c, r * 1.05, wall + 2, t);
  const apex = c[1] - wall - roof;
  knob(ctx, c[0], apex);
  flag(ctx, c[0], apex - 2, t, flagColor);
}

function bigTop(ctx: Ctx, prop: Prop, t: number) {
  const cx = prop.x + prop.w / 2;
  const cy = prop.y + prop.h / 2;
  roundTent(ctx, cx, cy, 1.9, 38, 46, RED, t, palette.red);
  const c = at(cx, cy);
  // A second ring of bunting, and gold lights round the wall.
  ringFlags(ctx, c, 1.5, 38 + 22, t, 12);
  for (let i = 0; i < 9; i++) {
    const angle = 0.2 + (i / 8) * (Math.PI - 0.4);
    const p = rimPoint(c, 1.92, angle, 10);
    oval(ctx, p[0], p[1], 1.4, 1.4, Math.sin(t * 4 + i) > 0 ? palette.gold : palette.cream);
  }
}

function carousel(ctx: Ctx, prop: Prop, t: number) {
  const cx = prop.x + prop.w / 2;
  const cy = prop.y + prop.h / 2;
  const c = at(cx, cy);
  const turn = t * 0.5;
  const r = 1.75;
  oval(ctx, c[0] + 8, c[1] + 4, r * ISO_RX * 1.1, r * ISO_RY * 1.1, palette.shadow);
  cylinder(ctx, c, r, 0, 6, RED, 24);
  oval(ctx, c[0], c[1] - 6, r * ISO_RX, r * ISO_RY, palette.pink);
  oval(ctx, c[0], c[1] - 6, r * ISO_RX * 0.82, r * ISO_RY * 0.82, palette.pinkShade);

  const roofZ = 46;
  const horses = Array.from({ length: 8 }, (_, i) => {
    const angle = turn + (i / 8) * Math.PI * 2;
    return { i, angle, base: rimPoint(c, r * 0.72, angle, 6) };
  });
  const drawHorse = ({ i, angle, base }: (typeof horses)[number]) => {
    const bob = Math.sin(t * 3 + i * 1.4) * 3;
    const [x, y] = base;
    stroke(
      ctx,
      [
        [x, y],
        [x, y - (roofZ - 6) + (Math.sin(angle) * r * ISO_RY) / 4],
      ],
      palette.gold,
      1.4,
    );
    const facing = Math.cos(angle + Math.PI / 2) < 0 ? -1 : 1;
    const color = i % 2 ? palette.cream : palette.woodLight;
    const hy = y - 16 + bob;
    oval(ctx, x, hy, 6, 3.2, color);
    poly(
      ctx,
      [
        [x + facing * 4, hy - 1],
        [x + facing * 7, hy - 7],
        [x + facing * 9, hy - 6],
        [x + facing * 6, hy + 1],
      ],
      color,
    );
    stroke(
      ctx,
      [
        [x - 4, hy + 2],
        [x - 5, hy + 7],
      ],
      color,
      1.4,
    );
    stroke(
      ctx,
      [
        [x + 4, hy + 2],
        [x + 5, hy + 7],
      ],
      color,
      1.4,
    );
    poly(
      ctx,
      [
        [x - 2, hy - 3],
        [x + 2, hy - 3],
        [x + 1, hy - 1],
        [x - 1, hy - 1],
      ],
      palette.red,
    );
  };
  horses.filter((h) => Math.sin(h.angle) < 0).forEach(drawHorse);
  const column = rimPoint(c, 0, 0, 6);
  poly(
    ctx,
    [
      [column[0] - 5, column[1]],
      [column[0] + 5, column[1]],
      [column[0] + 5, c[1] - roofZ],
      [column[0] - 5, c[1] - roofZ],
    ],
    palette.gold,
  );
  poly(
    ctx,
    [
      [column[0] - 2, column[1]],
      [column[0] + 2, column[1]],
      [column[0] + 2, c[1] - roofZ],
      [column[0] - 2, c[1] - roofZ],
    ],
    palette.red,
  );
  horses.filter((h) => Math.sin(h.angle) >= 0).forEach(drawHorse);

  dome(ctx, c, r * 1.15, roofZ, 26, RED, turn);
  scallopRing(ctx, c, r * 1.15, roofZ, 14, 4, [palette.red, palette.cream]);
  ringFlags(ctx, c, r * 1.05, roofZ - 6, t, 16);
  knob(ctx, c[0], c[1] - roofZ - 26);
  flag(ctx, c[0], c[1] - roofZ - 28, t, palette.gold);
}

// ── Square things ─────────────────────────────────────────────────────────

/** A tent with a ridged roof running along the x axis. */
function peakedTent(ctx: Ctx, prop: Prop, t: number) {
  const colors = prop.variant % 2 === 0 ? BLUE : RED;
  const x0 = prop.x + 0.2;
  const x1 = prop.x + prop.w - 0.2;
  const y0 = prop.y + 0.25;
  const y1 = prop.y + prop.h - 0.25;
  const ym = (y0 + y1) / 2;
  const wall = 24;
  const roof = 26;
  const eave = 0.18;

  poly(ctx, rectPoints({ x: x0 + 0.3, y: y0 + 0.3, w: x1 - x0, h: y1 - y0 }), palette.shadow);
  // The back of the roof, mostly hidden behind the front.
  poly(
    ctx,
    [
      at(x0 - 0.1, y0 - eave, wall - 3),
      at(x1 + 0.1, y0 - eave, wall - 3),
      at(x1 + 0.1, ym, wall + roof),
      at(x0 - 0.1, ym, wall + roof),
    ],
    colors.aShade,
  );

  // The gable end, striped up to the roof line.
  const strips = 10;
  const half = (y1 - y0) / 2;
  const height = (y: number) => wall + roof * (1 - Math.abs(y - ym) / half);
  for (let i = 0; i < strips; i++) {
    const ya = lerp(y1, y0, i / strips);
    const yb = lerp(y1, y0, (i + 1) / strips);
    const points: Pt[] = [at(x1, ya, 0), at(x1, yb, 0), at(x1, yb, height(yb))];
    if ((ya - ym) * (yb - ym) < 0) points.push(at(x1, ym, height(ym)));
    points.push(at(x1, ya, height(ya)));
    poly(ctx, points, i % 2 === 0 ? colors.aShade : colors.bShade);
  }
  stripedWall(ctx, { x: x0, y: y1 }, { x: x1, y: y1 }, 0, wall, 14, [colors.a, colors.b]);
  // The entrance, on the gable end.
  const door = [
    at(x1, ym + 0.35, 0),
    at(x1, ym - 0.35, 0),
    at(x1, ym - 0.2, wall * 0.8),
    at(x1, ym, wall * 0.95),
    at(x1, ym + 0.2, wall * 0.8),
  ];
  poly(ctx, door, palette.opening);
  stroke(ctx, [door[0], door[4], door[3]], palette.gold, 1.6);
  stroke(ctx, [door[1], door[2], door[3]], palette.gold, 1.6);

  // The front of the roof.
  const roofStrips = 12;
  for (let i = 0; i < roofStrips; i++) {
    const xa = lerp(x0 - 0.1, x1 + 0.1, i / roofStrips);
    const xb = lerp(x0 - 0.1, x1 + 0.1, (i + 1) / roofStrips);
    poly(
      ctx,
      [
        at(xa, y1 + eave, wall - 3),
        at(xb, y1 + eave, wall - 3),
        at(xb, ym, wall + roof),
        at(xa, ym, wall + roof),
      ],
      i % 2 === 0 ? colors.a : colors.b,
    );
  }
  poly(
    ctx,
    [
      at(x1 + 0.1, y1 + eave, wall - 3),
      at(x1 + 0.1, ym, wall + roof),
      at(x1 + 0.1, ym, wall + roof - 2),
      at(x1 + 0.1, y1 + eave, wall - 5),
    ],
    colors.aShade,
  );
  scallops(ctx, { x: x0 - 0.1, y: y1 + eave }, { x: x1 + 0.1, y: y1 + eave }, wall - 3, 12, 3, [
    colors.a,
    colors.b,
  ]);
  const eaveLine: Pt[] = [];
  for (let i = 0; i <= 16; i++) eaveLine.push(at(lerp(x0, x1, i / 16), y1 + eave, wall - 7));
  flags(ctx, eaveLine, t, 3.5, prop.x);
  const ridgeFront = at(x1 + 0.1, ym, wall + roof);
  const ridgeBack = at(x0 - 0.1, ym, wall + roof);
  flag(ctx, ridgeBack[0], ridgeBack[1], t, palette.gold);
  flag(ctx, ridgeFront[0], ridgeFront[1], t + 1, palette.red);
}

function wheel(ctx: Ctx, x: number, y: number, r: number) {
  oval(ctx, x, y, r, r, palette.woodDark);
  oval(ctx, x, y, r * 0.65, r * 0.65, palette.gold);
  oval(ctx, x, y, r * 0.25, r * 0.25, palette.woodDark);
}

function wagon(ctx: Ctx, prop: Prop) {
  const body =
    prop.variant % 2 === 0
      ? { top: palette.red, left: palette.red, right: palette.redShade }
      : { top: palette.blue, left: palette.blue, right: palette.blueShade };
  const x = prop.x + 0.1;
  const y = prop.y + 0.1;
  const w = prop.w - 0.2;
  const d = prop.h - 0.25;
  poly(ctx, rectPoints({ x: x + 0.3, y: y + 0.3, w, h: d }), palette.shadow);
  box(ctx, x, y, w, d, 7, 24, body.top, body.left, body.right);
  // Cage bars along the side.
  for (let i = 1; i < 14; i++) {
    const bx = lerp(x + 0.3, x + w - 0.3, i / 14);
    stroke(ctx, [at(bx, y + d, 11), at(bx, y + d, 27)], palette.cream, 1.4);
  }
  poly(
    ctx,
    [
      at(x + 0.25, y + d, 11),
      at(x + w - 0.25, y + d, 11),
      at(x + w - 0.25, y + d, 12.5),
      at(x + 0.25, y + d, 12.5),
    ],
    palette.gold,
  );
  box(
    ctx,
    x - 0.05,
    y - 0.05,
    w + 0.1,
    d + 0.1,
    31,
    3,
    palette.gold,
    palette.goldShade,
    palette.goldShade,
  );
  // A gold crest on the side, and the wheels.
  const crest = at(x + w / 2, y + d, 33);
  oval(ctx, crest[0], crest[1] - 2, 7, 4, palette.gold);
  for (const wx of [x + 0.45, x + w - 0.45]) {
    const p = at(wx, y + d + 0.02, 6);
    wheel(ctx, p[0], p[1], 6);
  }
}

function person(
  ctx: Ctx,
  x: number,
  y: number,
  look: Look,
  options: { swing?: number; back?: boolean; dir?: number; player?: boolean; t?: number } = {},
) {
  const swing = options.swing ?? 0;
  const dir = options.dir ?? 1;
  oval(ctx, x, y, 5, 2, palette.shadow);
  if (options.player) {
    ctx.strokeStyle = palette.gold;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.ellipse(x, y, 8, 3.5, 0, 0, Math.PI * 2);
    ctx.stroke();
  }
  stroke(
    ctx,
    [
      [x - 1.6, y - 8],
      [x - 1.6 + swing * 1.6, y - 1],
    ],
    look.pants,
    2.6,
  );
  stroke(
    ctx,
    [
      [x + 1.6, y - 8],
      [x + 1.6 - swing * 1.6, y - 1],
    ],
    look.pants,
    2.6,
  );
  ctx.fillStyle = look.shirt;
  ctx.beginPath();
  ctx.roundRect(x - 4, y - 16.5, 8, 9.5, 3);
  ctx.fill();
  stroke(
    ctx,
    [
      [x - 4, y - 15],
      [x - 5 - swing, y - 9],
    ],
    look.skin,
    2,
  );
  stroke(
    ctx,
    [
      [x + 4, y - 15],
      [x + 5 + swing, y - 9],
    ],
    look.skin,
    2,
  );
  oval(ctx, x, y - 20.5, 4, 4, look.skin);
  ctx.fillStyle = look.hair;
  ctx.beginPath();
  if (options.back) ctx.arc(x, y - 20.8, 4.2, 0, Math.PI * 2);
  else ctx.arc(x, y - 21, 4.2, Math.PI * 1.05, Math.PI * 1.95);
  ctx.fill();
  if (!options.back) {
    oval(ctx, x - 1.5 + dir, y - 20.3, 0.6, 0.7, palette.ink);
    oval(ctx, x + 1.5 + dir, y - 20.3, 0.6, 0.7, palette.ink);
  }
  if (look.cap) {
    ctx.fillStyle = look.cap;
    ctx.beginPath();
    ctx.arc(x, y - 22, 4.4, Math.PI, Math.PI * 2);
    ctx.fill();
    if (!options.back)
      poly(
        ctx,
        [
          [x, y - 22.5],
          [x + dir * 7, y - 22.5],
          [x + dir * 7, y - 21.3],
          [x, y - 21.3],
        ],
        look.cap,
      );
  }
  if (options.player) {
    const hop = Math.sin((options.t ?? 0) * 5) * 1.5;
    poly(
      ctx,
      [
        [x - 4, y - 34 + hop],
        [x + 4, y - 34 + hop],
        [x, y - 29 + hop],
      ],
      palette.gold,
    );
  }
}

function cart(ctx: Ctx, prop: Prop, t: number) {
  const kind = prop.variant % CART_KINDS.length;
  const x = prop.x + 0.18;
  const y = prop.y + 0.3;
  const w = 0.64;
  const d = 0.45;
  const look = visitorLook(prop.x + prop.y);
  // The vendor stands behind the cart.
  const vendor = at(prop.x + 0.5, prop.y + 0.12);
  person(ctx, vendor[0], vendor[1], { ...look, shirt: palette.cream, cap: palette.red });
  poly(ctx, rectPoints({ x: x + 0.15, y: y + 0.15, w, h: d }), palette.shadow);

  const body =
    kind === 0
      ? { top: palette.cream, left: palette.red, right: palette.redShade }
      : kind === 1
        ? { top: palette.cream, left: palette.pink, right: palette.pinkShade }
        : { top: palette.cream, left: palette.blue, right: palette.blueShade };
  box(ctx, x, y, w, d, 5, 14, body.top, body.left, body.right);
  stripedWall(ctx, { x, y: y + d }, { x: x + w, y: y + d }, 9, 3, 6, [palette.cream, body.left]);
  const wheelAt = at(x + w * 0.3, y + d + 0.02, 5);
  wheel(ctx, wheelAt[0], wheelAt[1], 5);
  const top = at(x + w / 2, y + d / 2, 19);

  if (kind === 0) {
    box(
      ctx,
      x + 0.06,
      y + 0.06,
      w - 0.12,
      d - 0.12,
      19,
      10,
      'rgba(255,255,255,0.35)',
      'rgba(255,255,255,0.45)',
      'rgba(255,255,255,0.3)',
    );
    for (let i = 0; i < 9; i++)
      oval(
        ctx,
        top[0] - 8 + (i % 5) * 4,
        top[1] - 3 - Math.floor(i / 5) * 3 - (i % 2),
        2,
        2,
        palette.cream,
      );
    box(ctx, x, y, w, d, 29, 2, palette.red, palette.red, palette.redShade);
  } else if (kind === 1) {
    for (let i = 0; i < 3; i++) {
      const sx = top[0] - 7 + i * 7;
      const bob = Math.sin(t * 2 + i) * 0.5;
      stroke(
        ctx,
        [
          [sx, top[1]],
          [sx, top[1] - 9],
        ],
        palette.cream,
        1,
      );
      oval(ctx, sx, top[1] - 13 + bob, 4.5, 4.5, palette.pink);
      oval(ctx, sx - 1.5, top[1] - 14.5 + bob, 1.8, 1.8, palette.cream);
    }
  } else if (kind === 2) {
    stroke(ctx, [top, [top[0], top[1] - 22]], palette.metalShade, 1.2);
    dome(ctx, [top[0], top[1] - 18], 0.75, 0, 9, BLUE, 0, 10);
    for (let i = 0; i < 3; i++)
      oval(
        ctx,
        top[0] - 6 + i * 6,
        top[1] - 2,
        2.5,
        2.5,
        [palette.pink, palette.cream, palette.woodLight][i],
      );
  } else {
    // A giant drink on the roof.
    const [cx, cy] = top;
    poly(
      ctx,
      [
        [cx - 5, cy],
        [cx + 5, cy],
        [cx + 7, cy - 16],
        [cx - 7, cy - 16],
      ],
      palette.red,
    );
    poly(
      ctx,
      [
        [cx - 5.5, cy - 6],
        [cx + 5.5, cy - 6],
        [cx + 6, cy - 10],
        [cx - 6, cy - 10],
      ],
      palette.cream,
    );
    oval(ctx, cx, cy - 16, 7, 2, palette.cream);
    stroke(
      ctx,
      [
        [cx + 1, cy - 16],
        [cx + 4, cy - 24],
      ],
      palette.cream,
      1.5,
    );
  }

  // A little sign above it all.
  const sign = at(prop.x + 0.5, prop.y + 0.5, kind === 2 ? 50 : 42);
  onPlane(ctx, sign, () =>
    signBoard(ctx, CART_KINDS[kind].toUpperCase(), 30, 9, {
      board: palette.board,
      edge: palette.woodDark,
      text: palette.ink,
    }),
  );
}

function ticketBooth(ctx: Ctx, prop: Prop) {
  const x = prop.x + 0.15;
  const y = prop.y + 0.15;
  poly(ctx, rectPoints({ x: x + 0.2, y: y + 0.2, w: 0.7, h: 0.7 }), palette.shadow);
  box(ctx, x, y, 0.7, 0.7, 0, 26, palette.cream, palette.red, palette.redShade);
  poly(
    ctx,
    [
      at(x + 0.15, y + 0.7, 10),
      at(x + 0.55, y + 0.7, 10),
      at(x + 0.55, y + 0.7, 20),
      at(x + 0.15, y + 0.7, 20),
    ],
    palette.opening,
  );
  for (let i = 0; i < 6; i++) {
    const xa = lerp(x - 0.05, x + 0.75, i / 6);
    const xb = lerp(x - 0.05, x + 0.75, (i + 1) / 6);
    poly(
      ctx,
      [at(xa, y + 0.7, 23), at(xb, y + 0.7, 23), at(xb, y + 0.95, 17), at(xa, y + 0.95, 17)],
      i % 2 ? palette.cream : palette.blue,
    );
  }
  box(ctx, x - 0.05, y - 0.05, 0.8, 0.8, 26, 3, palette.blue, palette.blueShade, palette.blueShade);
  onPlane(ctx, at(x + 0.35, y + 0.35, 38), () =>
    signBoard(ctx, 'TICKETS', 28, 9, { board: palette.gold, edge: palette.red, text: palette.red }),
  );
}

function bench(ctx: Ctx, prop: Prop) {
  const x = prop.x + 0.12;
  const y = prop.y + 0.4;
  for (const lx of [x + 0.08, x + 0.68])
    box(ctx, lx, y + 0.05, 0.05, 0.2, 0, 6, palette.woodDark, palette.woodDark, palette.woodDark);
  box(ctx, x, y, 0.76, 0.26, 6, 2, palette.woodLight, palette.wood, palette.woodDark);
  box(ctx, x, y - 0.02, 0.76, 0.06, 8, 7, palette.woodLight, palette.wood, palette.woodDark);
}

function planter(ctx: Ctx, prop: Prop) {
  const c = at(prop.x + 0.5, prop.y + 0.5);
  oval(ctx, c[0] + 3, c[1] + 1, 10, 4, palette.shadow);
  box(
    ctx,
    prop.x + 0.28,
    prop.y + 0.28,
    0.44,
    0.44,
    0,
    8,
    palette.creamShade,
    palette.cream,
    palette.creamShade,
  );
  oval(ctx, c[0] - 3, c[1] - 13, 5, 5, palette.hedge);
  oval(ctx, c[0] + 3, c[1] - 13, 5, 5, palette.hedgeDark);
  oval(ctx, c[0], c[1] - 17, 5, 5, palette.hedgeLight);
}

function balloons(ctx: Ctx, prop: Prop, t: number) {
  const c = at(prop.x + 0.5, prop.y + 0.5);
  oval(ctx, c[0] + 2, c[1] + 1, 5, 2, palette.shadow);
  box(
    ctx,
    prop.x + 0.42,
    prop.y + 0.42,
    0.16,
    0.16,
    0,
    4,
    palette.blue,
    palette.blueShade,
    palette.blueShade,
  );
  for (let i = 0; i < 3; i++) {
    const bob = Math.sin(t * 1.8 + i + prop.x) * 1.5;
    const bx = c[0] - 6 + i * 6;
    const by = c[1] - 40 - (i === 1 ? 7 : 0) + bob;
    const color = palette.balloons[(i + prop.x) % palette.balloons.length];
    ctx.strokeStyle = palette.metalShade;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(c[0], c[1] - 4);
    ctx.quadraticCurveTo(bx, by + 18, bx, by + 7);
    ctx.stroke();
    oval(ctx, bx, by, 5, 6.5, color);
    oval(ctx, bx - 1.8, by - 2.5, 1.4, 2, 'rgba(255,255,255,0.6)');
    poly(
      ctx,
      [
        [bx - 1, by + 7],
        [bx + 1, by + 7],
        [bx, by + 6],
      ],
      color,
    );
  }
}

/** How high a billboard's sign stands, to the bottom of its board. */
const BILLBOARD_HEIGHT = 40;

/** The billboard's sign, in plane-local pixels: the red board plus its gold frame. */
const BILLBOARD_SIGN = { width: 104, height: 36, frame: 3 };

/** Where a billboard's posts stand, and the point its sign is centred on. */
function billboardFrame(prop: Prop) {
  const y = prop.y + 0.5;
  const left = prop.x + 0.35;
  const right = prop.x + prop.w - 0.35;
  return { y, left, right, centre: at((left + right) / 2, y, BILLBOARD_HEIGHT + 18) };
}

/**
 * The screen box a billboard covers, sign and posts, for clicks and fading.
 * The sign sits on a slanted plane (see onPlane), so its corners are mapped
 * with the same 0.894 and 0.447 factors.
 */
function billboardBounds(prop: Prop): Box {
  const { y, left, right, centre } = billboardFrame(prop);
  const halfWidth = BILLBOARD_SIGN.width / 2 + BILLBOARD_SIGN.frame;
  const halfHeight = BILLBOARD_SIGN.height / 2 + BILLBOARD_SIGN.frame;
  const feet = [at(left, y), at(right, y)];
  return {
    left: Math.min(centre[0] - 0.894 * halfWidth, ...feet.map((p) => p[0])),
    right: Math.max(centre[0] + 0.894 * halfWidth, ...feet.map((p) => p[0])),
    top: centre[1] - 0.447 * halfWidth - halfHeight,
    bottom: Math.max(centre[1] + 0.447 * halfWidth + halfHeight, ...feet.map((p) => p[1])),
  };
}

/** The AI DevCon billboard: a lit sign on two posts. Clicking it opens the event page. */
function billboard(ctx: Ctx, prop: Prop, t: number) {
  const { y, left, right, centre } = billboardFrame(prop);
  poly(
    ctx,
    rectPoints({ x: prop.x + 0.3, y: prop.y + 0.4, w: prop.w - 0.4, h: 0.5 }),
    palette.shadow,
  );
  for (const px of [left, right]) {
    box(
      ctx,
      px - 0.07,
      y - 0.07,
      0.14,
      0.14,
      0,
      BILLBOARD_HEIGHT + 12,
      palette.woodLight,
      palette.wood,
      palette.woodDark,
    );
  }
  onPlane(ctx, centre, () => {
    const { width, height, frame } = BILLBOARD_SIGN;
    ctx.fillStyle = palette.gold;
    ctx.beginPath();
    ctx.roundRect(
      -width / 2 - frame,
      -height / 2 - frame,
      width + frame * 2,
      height + frame * 2,
      5,
    );
    ctx.fill();
    ctx.fillStyle = palette.red;
    ctx.beginPath();
    ctx.roundRect(-width / 2, -height / 2, width, height, 3);
    ctx.fill();
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    const line = (
      text: string,
      size: 'small' | 'body',
      y: number,
      maxHeight: number,
      color: string,
    ) => {
      ctx.font = canvasFont(size, 'bold');
      const fit = Math.min(
        maxHeight / theme.font[size],
        (width - 10) / ctx.measureText(text).width,
      );
      ctx.save();
      ctx.translate(0, y);
      ctx.scale(fit, fit);
      ctx.fillStyle = color;
      ctx.fillText(text, 0, 0);
      ctx.restore();
    };
    line('AI DEVCON NYC', 'body', -5, 13, palette.gold);
    line('NOVEMBER 2026  BROOKLYN', 'small', 10, 7, palette.cream);
    for (let i = 0; i < 12; i++) {
      ctx.fillStyle = Math.sin(t * 4 - i * 0.7) > 0 ? palette.cream : palette.goldShade;
      ctx.beginPath();
      ctx.arc(-width / 2 + 4 + i * ((width - 8) / 11), -height / 2 - 1.5, 1.2, 0, Math.PI * 2);
      ctx.fill();
    }
  });
}

/** How high the top of a bunting pole is. */
const POLE_HEIGHT = 44;

function buntingPole(ctx: Ctx, prop: Prop) {
  const [x, y] = at(prop.x + 0.5, prop.y + 0.5);
  oval(ctx, x + 2, y + 1, 4, 1.6, palette.shadow);
  poly(
    ctx,
    [
      [x - 1.3, y],
      [x + 1.3, y],
      [x + 1.3, y - POLE_HEIGHT],
      [x - 1.3, y - POLE_HEIGHT],
    ],
    palette.cream,
  );
  for (let z = 4; z < POLE_HEIGHT; z += 8)
    poly(
      ctx,
      [
        [x - 1.3, y - z],
        [x + 1.3, y - z - 2],
        [x + 1.3, y - z - 5],
        [x - 1.3, y - z - 3],
      ],
      palette.red,
    );
  knob(ctx, x, y - POLE_HEIGHT - 1);
}

/** Bunting between the poles, skipping any strung outside the view. */
export function drawBunting(ctx: Ctx, map: MidwayMap, t: number, view: Box) {
  map.bunting.forEach(([a, b], n) => {
    const p = at(a.x + 0.5, a.y + 0.5, POLE_HEIGHT - 2);
    const q = at(b.x + 0.5, b.y + 0.5, POLE_HEIGHT - 2);
    if (Math.max(p[0], q[0]) < view.left || Math.min(p[0], q[0]) > view.right) return;
    if (Math.max(p[1], q[1]) + 20 < view.top || Math.min(p[1], q[1]) > view.bottom) return;
    const sag = Math.hypot(q[0] - p[0], q[1] - p[1]) * 0.12;
    const points: Pt[] = [];
    const count = 12;
    for (let i = 0; i <= count; i++) {
      const s = i / count;
      points.push([lerp(p[0], q[0], s), lerp(p[1], q[1], s) + 4 * sag * s * (1 - s)]);
    }
    stroke(ctx, points, palette.woodDark, 0.6);
    flags(ctx, points, t, 4, n);
  });
}

function ferrisWheel(ctx: Ctx, prop: Prop, t: number) {
  const cx = prop.x + prop.w / 2;
  const cy = prop.y + prop.h / 2;
  const radius = 60;
  const hubZ = 76;
  const spread = 0.28;
  const turn = t * 0.2;
  const cars = 10;
  const hubAt = (offset: number) => at(cx, cy + offset, hubZ);
  const onWheel = (offset: number, angle: number, r = radius): Pt => {
    const [hx, hy] = hubAt(offset);
    return [
      hx + Math.cos(angle) * r * 0.894,
      hy + Math.cos(angle) * r * 0.447 - Math.sin(angle) * r,
    ];
  };
  const ring = (offset: number, r: number, color: string, width: number) => {
    const points: Pt[] = [];
    for (let i = 0; i <= 48; i++) points.push(onWheel(offset, (i / 48) * Math.PI * 2, r));
    stroke(ctx, points, color, width);
  };
  const legs = (offset: number, color: string) => {
    stroke(ctx, [at(cx - 1.4, cy + offset), hubAt(offset), at(cx + 1.4, cy + offset)], color, 4.5);
  };

  const base = at(cx, cy);
  oval(ctx, base[0] + 10, base[1] + 4, 44, 14, palette.shadow);
  legs(-spread - 0.15, palette.creamShade);
  for (const side of [-spread, spread]) {
    if (side > 0) {
      // The cars hang between the two rims.
      for (let i = 0; i < cars; i++) {
        const angle = turn + (i / cars) * Math.PI * 2;
        const [gx, gy] = onWheel(0, angle);
        stroke(
          ctx,
          [
            [gx, gy],
            [gx, gy + 4],
          ],
          palette.metalShade,
          1,
        );
        ctx.fillStyle = palette.red;
        ctx.beginPath();
        ctx.roundRect(gx - 5, gy + 4, 10, 8, 2);
        ctx.fill();
        poly(
          ctx,
          [
            [gx - 6, gy + 4],
            [gx + 6, gy + 4],
            [gx + 4, gy + 1.5],
            [gx - 4, gy + 1.5],
          ],
          palette.gold,
        );
        poly(
          ctx,
          [
            [gx - 3.5, gy + 6],
            [gx + 3.5, gy + 6],
            [gx + 3.5, gy + 8.5],
            [gx - 3.5, gy + 8.5],
          ],
          palette.cream,
        );
      }
    }
    for (let i = 0; i < cars; i++) {
      const angle = turn + (i / cars) * Math.PI * 2;
      stroke(ctx, [hubAt(side), onWheel(side, angle)], palette.cream, 1.4);
    }
    ring(side, radius * 0.6, palette.gold, 4);
    ring(side, radius, side > 0 ? palette.blue : palette.blueShade, 4.5);
  }
  stroke(ctx, [hubAt(-spread), hubAt(spread)], palette.woodDark, 4);
  const hub = hubAt(spread);
  oval(ctx, hub[0], hub[1], 7, 7, palette.wood);
  oval(ctx, hub[0], hub[1], 3.5, 3.5, palette.woodDark);
  legs(spread + 0.15, palette.cream);
  box(ctx, cx - 0.6, cy - 0.5, 1.2, 1, 0, 4, palette.creamShade, palette.cream, palette.creamShade);
}

// ── Booths ────────────────────────────────────────────────────────────────

const BOOTH_SCHEMES = [
  {
    wall: palette.gold,
    wallShade: palette.goldShade,
    awning: [palette.blue, palette.cream],
    awningShade: [palette.blueShade, palette.creamShade],
  },
  {
    wall: palette.cream,
    wallShade: palette.creamShade,
    awning: [palette.red, palette.cream],
    awningShade: [palette.redShade, palette.creamShade],
  },
  {
    wall: palette.sky2,
    wallShade: palette.blue,
    awning: [palette.gold, palette.cream],
    awningShade: [palette.goldShade, palette.creamShade],
  },
  {
    wall: palette.pink,
    wallShade: palette.pinkShade,
    awning: [palette.red, palette.gold],
    awningShade: [palette.redShade, palette.goldShade],
  },
] as const;
const CLOSED_SCHEME = {
  wall: palette.closed,
  wallShade: palette.closedShade,
  awning: [palette.closed, palette.metal],
  awningShade: [palette.closedShade, palette.metalShade],
} as const;

const BOOTH_WALL = 34;
/** How far above a booth's footprint its sign hangs. */
export const BOOTH_SIGN_HEIGHT = BOOTH_WALL + 22;

function target(ctx: Ctx, r: number) {
  const rings = [palette.red, palette.cream, palette.red, palette.cream];
  rings.forEach((color, i) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(0, 0, r * (1 - i / rings.length), 0, Math.PI * 2);
    ctx.fill();
  });
}

function booth(ctx: Ctx, slot: BoothSlot, name: string, t: number, glow: boolean) {
  const open = slot.gameId !== undefined;
  const scheme = open ? BOOTH_SCHEMES[slot.index % BOOTH_SCHEMES.length] : CLOSED_SCHEME;
  const x0 = slot.x + 0.15;
  const y0 = slot.y + 0.15;
  const s = 1.7;
  const x1 = x0 + s;
  const y1 = y0 + s;
  const wall = BOOTH_WALL;

  poly(ctx, rectPoints({ x: x0 + 0.35, y: y0 + 0.35, w: s, h: s }), palette.shadow);
  box(ctx, x0, y0, s, s, 0, wall, scheme.wall, scheme.wall, scheme.wallShade);

  // A window and counter on both faces we can see.
  const windows = [
    { a: { x: x0 + 0.15, y: y1 }, b: { x: x1 - 0.15, y: y1 }, out: { x: 0, y: 1 } },
    { a: { x: x1, y: y1 - 0.15 }, b: { x: x1, y: y0 + 0.15 }, out: { x: 1, y: 0 } },
  ];
  windows.forEach(({ a, b, out }, side) => {
    poly(
      ctx,
      [at(a.x, a.y, 9), at(b.x, b.y, 9), at(b.x, b.y, wall - 7), at(a.x, a.y, wall - 7)],
      palette.opening,
    );
    if (open) {
      for (let i = 0; i < 4; i++) {
        const p = at(lerp(a.x, b.x, (i + 0.5) / 4), lerp(a.y, b.y, (i + 0.5) / 4), 13);
        const hop = Math.sin(t * 2 + i + slot.index + side) > 0.9 ? 1.5 : 0;
        const color = palette.balloons[(i + side + slot.index) % palette.balloons.length];
        oval(ctx, p[0], p[1] - hop, 2.6, 2.6, color);
        oval(ctx, p[0] - 1.6, p[1] - 2.4 - hop, 1, 1, color);
        oval(ctx, p[0] + 1.6, p[1] - 2.4 - hop, 1, 1, color);
      }
    } else {
      // Shutters down.
      for (let i = 0; i < 4; i++) {
        const z = 9 + i * 3;
        poly(
          ctx,
          [at(a.x, a.y, z), at(b.x, b.y, z), at(b.x, b.y, z + 2.2), at(a.x, a.y, z + 2.2)],
          palette.metalShade,
        );
      }
    }
    const lip = 0.14;
    const aOut = { x: a.x + out.x * lip, y: a.y + out.y * lip };
    const bOut = { x: b.x + out.x * lip, y: b.y + out.y * lip };
    poly(
      ctx,
      [at(a.x, a.y, 9), at(b.x, b.y, 9), at(bOut.x, bOut.y, 9), at(aOut.x, aOut.y, 9)],
      palette.woodLight,
    );
    poly(
      ctx,
      [at(aOut.x, aOut.y, 9), at(bOut.x, bOut.y, 9), at(bOut.x, bOut.y, 7), at(aOut.x, aOut.y, 7)],
      palette.woodDark,
    );
  });

  box(
    ctx,
    x0 - 0.06,
    y0 - 0.06,
    s + 0.12,
    s + 0.12,
    wall,
    3,
    scheme.wall,
    scheme.wallShade,
    scheme.wallShade,
  );

  // Striped awnings over each window.
  const reach = open ? 0.42 : 0.12;
  const strips = 8;
  for (let i = 0; i < strips; i++) {
    const ya = lerp(y1 + 0.06, y0 - 0.06, i / strips);
    const yb = lerp(y1 + 0.06, y0 - 0.06, (i + 1) / strips);
    poly(
      ctx,
      [
        at(x1 + 0.06, ya, wall),
        at(x1 + 0.06, yb, wall),
        at(x1 + 0.06 + reach, yb, wall - 8),
        at(x1 + 0.06 + reach, ya, wall - 8),
      ],
      scheme.awningShade[i % 2],
    );
  }
  scallops(
    ctx,
    { x: x1 + 0.06 + reach, y: y1 + 0.06 },
    { x: x1 + 0.06 + reach, y: y0 - 0.06 },
    wall - 8,
    strips,
    2.5,
    scheme.awningShade,
  );
  for (let i = 0; i < strips; i++) {
    const xa = lerp(x0 - 0.06, x1 + 0.06, i / strips);
    const xb = lerp(x0 - 0.06, x1 + 0.06, (i + 1) / strips);
    poly(
      ctx,
      [
        at(xa, y1 + 0.06, wall),
        at(xb, y1 + 0.06, wall),
        at(xb, y1 + 0.06 + reach, wall - 8),
        at(xa, y1 + 0.06 + reach, wall - 8),
      ],
      scheme.awning[i % 2],
    );
  }
  scallops(
    ctx,
    { x: x0 - 0.06, y: y1 + 0.06 + reach },
    { x: x1 + 0.06, y: y1 + 0.06 + reach },
    wall - 8,
    strips,
    2.5,
    scheme.awning,
  );

  // The sign on the roof, with the game's name on it.
  const signAt = at(x0 + s / 2, y0 + s / 2, BOOTH_SIGN_HEIGHT - 6);
  onPlane(ctx, signAt, () => {
    ctx.fillStyle = palette.woodDark;
    ctx.fillRect(-20, 2, 2, 12);
    ctx.fillRect(18, 2, 2, 12);
    if (open) {
      ctx.save();
      ctx.translate(0, -18);
      target(ctx, 9);
      ctx.restore();
    }
    signBoard(
      ctx,
      name,
      60,
      16,
      open
        ? { board: palette.cream, edge: palette.red, text: palette.red }
        : { board: palette.metal, edge: palette.closedShade, text: palette.closedShade },
      glow,
    );
    if (open) {
      for (let i = 0; i < 8; i++) {
        ctx.fillStyle = Math.sin(t * 5 + i * 1.3) > -0.2 ? palette.gold : palette.goldShade;
        ctx.beginPath();
        ctx.arc(-28 + i * (56 / 7), -10, 1.2, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  });
}

// ── Bounds, for clicks and for fading things in front of the player ───────

export interface Box {
  left: number;
  right: number;
  top: number;
  bottom: number;
}

/** The screen box a booth and its sign are drawn in. */
export function boothBounds(slot: BoothSlot): Box {
  const c = toScreen(slot.x + 1, slot.y + 1);
  return { left: c.x - 32, right: c.x + 32, top: c.y - BOOTH_SIGN_HEIGHT - 30, bottom: c.y + 18 };
}

const PROP_HEIGHTS: Record<Prop['kind'], number> = {
  'big-top': 100,
  'round-tent': 80,
  'peaked-tent': 56,
  'ferris-wheel': 150,
  carousel: 86,
  wagon: 38,
  cart: 50,
  'ticket-booth': 46,
  bench: 16,
  planter: 22,
  balloons: 52,
  'bunting-pole': 0,
  billboard: BILLBOARD_HEIGHT + 40,
};

/** Roughly the screen box a prop is drawn in. */
export function propBounds(prop: Prop): Box {
  if (prop.kind === 'billboard') return billboardBounds(prop);
  const c = toScreen(prop.x + prop.w / 2, prop.y + prop.h / 2);
  const half = ((prop.w + prop.h) * 16) / 2;
  const footprint = ((prop.w + prop.h) * 8) / 2;
  return {
    left: c.x - half,
    right: c.x + half,
    top: c.y - footprint - PROP_HEIGHTS[prop.kind],
    bottom: c.y + footprint,
  };
}

// ── People ────────────────────────────────────────────────────────────────

export interface Look {
  skin: string;
  hair: string;
  shirt: string;
  pants: string;
  cap?: string;
}

export function visitorLook(n: number): Look {
  return {
    skin: palette.skins[n % palette.skins.length],
    hair: palette.hairs[(n * 3 + 1) % palette.hairs.length],
    shirt: palette.shirts[(n * 2 + 1) % palette.shirts.length],
    pants: palette.pants[n % palette.pants.length],
  };
}

export const PLAYER_LOOK: Look = {
  skin: palette.skins[0],
  hair: palette.hairs[2],
  shirt: palette.red,
  pants: palette.pants[0],
  cap: palette.gold,
};

export function drawWalker(ctx: Ctx, walker: Walker, look: Look, player = false, t = 0) {
  const p = toScreen(walker.x, walker.y);
  const swing = walker.walking ? Math.sin(walker.stride * Math.PI * 2.2) : 0;
  person(ctx, p.x, p.y, look, {
    swing,
    back: walker.facing === 'back',
    dir: walker.flipped ? -1 : 1,
    player,
    t,
  });
}

// ── The gate ──────────────────────────────────────────────────────────────

const ARCH_HEIGHT = 58;
const ARCH_LEFT = -0.45;
const ARCH_RIGHT = 2.2;

export function archBounds(map: MidwayMap): Box {
  const y = map.height - 1;
  const left = toScreen(map.avenueX + ARCH_LEFT - 0.6, y + 0.3);
  const right = toScreen(map.avenueX + ARCH_RIGHT + 0.8, y - 0.3);
  return { left: left.x, right: right.x, top: right.y - ARCH_HEIGHT - 26, bottom: left.y };
}

export function drawArch(ctx: Ctx, map: MidwayMap, t: number) {
  const y = map.height - 0.75;
  const left = map.avenueX + ARCH_LEFT;
  const right = map.avenueX + ARCH_RIGHT;
  for (const px of [left, right])
    box(
      ctx,
      px,
      y - 0.15,
      0.26,
      0.26,
      0,
      ARCH_HEIGHT,
      palette.woodLight,
      palette.wood,
      palette.woodDark,
    );
  const centre = at((left + right + 0.26) / 2, y, ARCH_HEIGHT + 2);
  onPlane(ctx, centre, () => {
    ctx.fillStyle = palette.gold;
    ctx.beginPath();
    ctx.ellipse(0, -10, 18, 14, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = palette.red;
    ctx.beginPath();
    ctx.ellipse(0, -10, 12, 9, 0, Math.PI, Math.PI * 2);
    ctx.fill();
    signBoard(ctx, 'TESSL CARNIVAL', 92, 20, {
      board: palette.wood,
      edge: palette.woodDark,
      text: palette.gold,
    });
    for (let i = 0; i < 14; i++) {
      ctx.fillStyle = Math.sin(t * 5 - i * 0.8) > 0 ? palette.cream : palette.goldShade;
      ctx.beginPath();
      ctx.arc(-44 + i * (88 / 13), 13.5, 1.3, 0, Math.PI * 2);
      ctx.fill();
    }
  });
  for (const px of [left, right]) {
    const top = at(px + 0.13, y - 0.02, ARCH_HEIGHT);
    flag(ctx, top[0], top[1], t + px, palette.red);
  }
}

// ── The sky ───────────────────────────────────────────────────────────────

export interface Cloud {
  x: number;
  y: number;
  size: number;
  speed: number;
}

export function drawCloud(ctx: Ctx, x: number, y: number, size: number) {
  ctx.fillStyle = palette.cloud;
  ctx.beginPath();
  ctx.roundRect(x - 30 * size, y - 8 * size, 60 * size, 12 * size, 6 * size);
  ctx.arc(x - 14 * size, y - 8 * size, 11 * size, 0, Math.PI * 2);
  ctx.arc(x + 4 * size, y - 13 * size, 15 * size, 0, Math.PI * 2);
  ctx.arc(x + 20 * size, y - 6 * size, 9 * size, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = palette.cloudShade;
  ctx.beginPath();
  ctx.roundRect(x - 30 * size, y, 60 * size, 4 * size, 2 * size);
  ctx.fill();
}

export interface Floater {
  x: number;
  y: number;
  age: number;
  color: string;
}

/** Balloons someone let go of, drifting up into the sky. */
export function drawFloaters(ctx: Ctx, floaters: readonly Floater[]) {
  for (const f of floaters) {
    ctx.globalAlpha = Math.max(0, Math.min(1, 6 - f.age));
    const sway = Math.sin(f.age * 2) * 3;
    ctx.strokeStyle = palette.metalShade;
    ctx.lineWidth = 0.8;
    ctx.beginPath();
    ctx.moveTo(f.x + sway, f.y + 7);
    ctx.quadraticCurveTo(f.x + sway - 3, f.y + 13, f.x + sway, f.y + 18);
    ctx.stroke();
    oval(ctx, f.x + sway, f.y, 5, 6.5, f.color);
    oval(ctx, f.x + sway - 1.8, f.y - 2.5, 1.4, 2, 'rgba(255,255,255,0.6)');
  }
  ctx.globalAlpha = 1;
}

// ── Everything else ───────────────────────────────────────────────────────

export function drawProp(ctx: Ctx, prop: Prop, t: number) {
  switch (prop.kind) {
    case 'big-top':
      return bigTop(ctx, prop, t);
    case 'round-tent': {
      const colors = TENT_COLORS[prop.variant % TENT_COLORS.length];
      return roundTent(
        ctx,
        prop.x + prop.w / 2,
        prop.y + prop.h / 2,
        1.55,
        30,
        34,
        colors,
        t,
        prop.variant % 2 ? palette.blue : palette.gold,
      );
    }
    case 'peaked-tent':
      return peakedTent(ctx, prop, t);
    case 'ferris-wheel':
      return ferrisWheel(ctx, prop, t);
    case 'carousel':
      return carousel(ctx, prop, t);
    case 'wagon':
      return wagon(ctx, prop);
    case 'cart':
      return cart(ctx, prop, t);
    case 'ticket-booth':
      return ticketBooth(ctx, prop);
    case 'bench':
      return bench(ctx, prop);
    case 'planter':
      return planter(ctx, prop);
    case 'balloons':
      return balloons(ctx, prop, t);
    case 'bunting-pole':
      return buntingPole(ctx, prop);
    case 'billboard':
      return billboard(ctx, prop, t);
  }
}

export function drawBooth(ctx: Ctx, slot: BoothSlot, name: string, t: number, glow: boolean) {
  booth(ctx, slot, name, t, glow);
}

/** A rounded callout with a line of text, pointing down at a screen point. */
export function label(ctx: Ctx, text: string, x: number, y: number) {
  const { colors, radius } = theme;
  ctx.font = canvasFont('small', 'bold');
  const width = ctx.measureText(text).width + 22;
  const height = theme.font.small + 14;
  ctx.fillStyle = colors.background;
  ctx.strokeStyle = colors.accent;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height / 2, width, height, Math.min(radius, height / 2));
  ctx.fill();
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(x - 6, y + height / 2);
  ctx.lineTo(x + 6, y + height / 2);
  ctx.lineTo(x, y + height / 2 + 7);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = colors.accent;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, x, y + 1);
}
