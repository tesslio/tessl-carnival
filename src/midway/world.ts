/**
 * The walkable midway: the map layout, isometric projection, movement and
 * pathfinding. Plain functions with no canvas or DOM, so Vitest can run them.
 *
 * Positions are in tiles. Tile (x, y) covers [x, x + 1) × [y, y + 1). On
 * screen, +x runs down-right and +y runs down-left.
 */

export const TILE_W = 32;
export const TILE_H = 16;

export const WALK_SPEED = 4.2;
export const VISITOR_SPEED = 1.6;
export const WALKER_RADIUS = 0.3;
/** How close, in tiles, the player must stand to a booth to play it. */
export const BOOTH_REACH = 1.1;

export interface Point {
  x: number;
  y: number;
}

export interface Rect {
  x: number;
  y: number;
  w: number;
  h: number;
}

export type Ground = 'grass' | 'path';

export interface BoothSlot extends Rect {
  index: number;
  /** The game this booth runs, or undefined for a "coming soon" booth. */
  gameId?: string;
}

export type PropKind =
  | 'big-top'
  | 'round-tent'
  | 'peaked-tent'
  | 'ferris-wheel'
  | 'carousel'
  | 'wagon'
  | 'cart'
  | 'ticket-booth'
  | 'bench'
  | 'planter'
  | 'balloons'
  | 'bunting-pole'
  | 'billboard';

export interface Prop extends Rect {
  kind: PropKind;
  /** Picks a colour scheme, or which kind of cart. */
  variant: number;
}

export interface MidwayMap {
  width: number;
  height: number;
  ground: Ground[];
  blocked: boolean[];
  /** The paved areas, for drawing. */
  paths: Rect[];
  booths: BoothSlot[];
  props: Prop[];
  /** Pairs of poles with a string of bunting hung between them. */
  bunting: [Point, Point][];
  /** The first x of the two-tile avenue; the gate sits at its south end. */
  avenueX: number;
  spawn: Point;
}

export const CART_KINDS = ['Popcorn', 'Cotton candy', 'Ice cream', 'Drinks'] as const;

const MAP_WIDTH = 24;
const AVENUE_X = 11;
const FIRST_ROW_Y = 9;
const ROW_SPACING = 3;
const MIN_ROWS = 2;

/** Small seeded random numbers, for anything that should look random but stay put. */
export function seededRandom(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Lays out the midway for a list of games. Booths line both sides of the
 * avenue, two per row starting by the gate, and the avenue grows as games are
 * added. Slots without a game become "coming soon" booths. Tents, rides and
 * carts fill the space around them.
 */
export function layoutMidway(gameIds: readonly string[]): MidwayMap {
  const rows = Math.max(MIN_ROWS, Math.ceil(gameIds.length / 2));
  const avenueEnd = FIRST_ROW_Y + rows * ROW_SPACING;
  const entrance = avenueEnd + 2;
  const width = MAP_WIDTH;
  const height = entrance + 6;
  const ground: Ground[] = new Array(width * height).fill('grass');
  const blocked: boolean[] = new Array(width * height).fill(false);

  const block = (area: Rect) => {
    for (let y = area.y; y < area.y + area.h; y++) {
      for (let x = area.x; x < area.x + area.w; x++) blocked[y * width + x] = true;
    }
  };

  // A hedge runs round the edge; the outermost ring of tiles is the hedge.
  block({ x: 0, y: 0, w: width, h: 1 });
  block({ x: 0, y: height - 1, w: width, h: 1 });
  block({ x: 0, y: 0, w: 1, h: height });
  block({ x: width - 1, y: 0, w: 1, h: height });

  const paths: Rect[] = [
    { x: AVENUE_X, y: 6, w: 2, h: height - 6 },
    { x: 1, y: 6, w: width - 2, h: 2 },
    { x: 1, y: avenueEnd, w: width - 2, h: 2 },
    { x: AVENUE_X - 3, y: height - 4, w: 8, h: 3 },
  ];
  for (const path of paths) {
    for (let y = path.y; y < path.y + path.h; y++) {
      for (let x = path.x; x < path.x + path.w; x++) ground[y * width + x] = 'path';
    }
  }

  const props: Prop[] = [];
  const add = (kind: PropKind, x: number, y: number, w = 1, h = 1, variant = 0) => {
    props.push({ kind, x, y, w, h, variant });
    block({ x, y, w, h });
  };

  // Along the back: tents and rides round the big top at the head of the avenue.
  add('round-tent', 1, 1, 4, 4, 0);
  add('ferris-wheel', 6, 1, 4, 3);
  add('big-top', AVENUE_X - 1, 1, 4, 4);
  add('peaked-tent', 15, 1, 4, 3, 0);
  add('round-tent', 19, 1, 4, 4, 1);
  add('planter', 5, 5);
  add('planter', 9, 5);
  add('planter', 14, 5);
  add('balloons', 18, 5);

  const booths: BoothSlot[] = [];
  for (let index = 0; index < rows * 2; index++) {
    const row = Math.floor(index / 2);
    const booth: BoothSlot = {
      index,
      x: index % 2 === 0 ? AVENUE_X - 3 : AVENUE_X + 3,
      y: avenueEnd - (row + 1) * ROW_SPACING,
      w: 2,
      h: 2,
      gameId: gameIds[index],
    };
    booths.push(booth);
    block(booth);
  }

  // Poles either side of the avenue between booth rows, with bunting strung
  // across the avenue and along it.
  const bunting: [Point, Point][] = [];
  for (let row = 0; row <= rows; row++) {
    const y = FIRST_ROW_Y - 1 + row * ROW_SPACING;
    const left = { x: AVENUE_X - 1, y };
    const right = { x: AVENUE_X + 2, y };
    add('bunting-pole', left.x, left.y);
    add('bunting-pole', right.x, right.y);
    bunting.push([left, right]);
    if (row > 0) {
      bunting.push([{ x: left.x, y: y - ROW_SPACING }, left]);
      bunting.push([{ x: right.x, y: y - ROW_SPACING }, right]);
    }
  }

  // Beside the booths: wagons and carts on the left, a tent and carts on the right.
  const side = FIRST_ROW_Y;
  // A billboard for AI DevCon, rising above the peaked tent on the right.
  add('billboard', 19, side - 1, 3, 1);
  add('wagon', 2, side, 3, 1, 0);
  add('wagon', 2, side + 2, 3, 1, 1);
  add('cart', 6, side, 1, 1, 0);
  add('bench', 5, side + 3);
  add('balloons', 1, side + 4);
  add('planter', 6, side + 5);
  add('peaked-tent', 18, side, 4, 3, 1);
  add('cart', 17, side + 4, 1, 1, 1);
  add('cart', 21, side + 4, 1, 1, 2);
  add('bench', 19, side + 5);
  // Each extra row of booths gets a little more scenery beside it.
  for (let band = 2; band < rows; band++) {
    const y = side + band * ROW_SPACING;
    add('planter', 2, y);
    add('bench', 4, y + 1);
    add('balloons', 6, y + 2);
    add('cart', 18, y + 1, 1, 1, band % CART_KINDS.length);
    add('planter', 21, y);
    add('bench', 20, y + 2);
  }

  // By the gate.
  add('round-tent', 2, entrance, 4, 4, 2);
  add('cart', 7, entrance + 1, 1, 1, 3);
  add('ticket-booth', AVENUE_X - 2, height - 2);
  add('carousel', 17, entrance, 4, 4);
  add('balloons', 22, entrance + 4);
  add('planter', 15, entrance);
  add('planter', 1, height - 2);

  return {
    width,
    height,
    ground,
    blocked,
    paths,
    booths,
    props,
    bunting,
    avenueX: AVENUE_X,
    // Just inside the gate, off to the side so the arch doesn't hide the player.
    spawn: { x: AVENUE_X + 3.5, y: height - 3 },
  };
}

/** Tile position to isometric screen pixels, relative to tile (0, 0)'s top corner. */
export function toScreen(x: number, y: number): Point {
  return { x: ((x - y) * TILE_W) / 2, y: ((x + y) * TILE_H) / 2 };
}

/** Isometric screen pixels back to a tile position. */
export function toTile(sx: number, sy: number): Point {
  return { x: sx / TILE_W + sy / TILE_H, y: sy / TILE_H - sx / TILE_W };
}

/**
 * Turns screen-relative input (each of -1, 0 or 1; up is negative) into a
 * unit direction in tiles, so "up" walks up the screen.
 */
export function inputDirection(right: number, down: number): Point {
  const x = right + down;
  const y = down - right;
  const length = Math.hypot(x, y);
  return length === 0 ? { x: 0, y: 0 } : { x: x / length, y: y / length };
}

export function isBlocked(map: MidwayMap, tx: number, ty: number): boolean {
  if (tx < 0 || ty < 0 || tx >= map.width || ty >= map.height) return true;
  return map.blocked[ty * map.width + tx];
}

/** Whether a walker of the given radius fits at a position. */
export function canStand(map: MidwayMap, x: number, y: number, radius = WALKER_RADIUS): boolean {
  for (let ty = Math.floor(y - radius); ty <= Math.floor(y + radius); ty++) {
    for (let tx = Math.floor(x - radius); tx <= Math.floor(x + radius); tx++) {
      if (isBlocked(map, tx, ty)) return false;
    }
  }
  return true;
}

export type Facing = 'front' | 'back';

export interface Walker extends Point {
  path: Point[];
  facing: Facing;
  /** True when the walker faces screen-left. */
  flipped: boolean;
  walking: boolean;
  /** Distance walked, in tiles; drives the walking animation. */
  stride: number;
}

export function createWalker(at: Point): Walker {
  return { x: at.x, y: at.y, path: [], facing: 'front', flipped: false, walking: false, stride: 0 };
}

function face(walker: Walker, dx: number, dy: number) {
  // Screen direction of a tile step: x is (dx - dy), y is (dx + dy).
  const sx = dx - dy;
  const sy = dx + dy;
  if (Math.abs(sy) > 1e-6) walker.facing = sy > 0 ? 'front' : 'back';
  if (Math.abs(sx) > 1e-6) walker.flipped = sx < 0;
}

/**
 * Moves a walker along a tile direction for `dt` seconds, sliding along
 * anything in the way. Returns how far it actually moved.
 */
export function walk(
  map: MidwayMap,
  walker: Walker,
  direction: Point,
  dt: number,
  speed = WALK_SPEED,
): number {
  const startX = walker.x;
  const startY = walker.y;
  const nx = walker.x + direction.x * speed * dt;
  if (canStand(map, nx, walker.y)) walker.x = nx;
  const ny = walker.y + direction.y * speed * dt;
  if (canStand(map, walker.x, ny)) walker.y = ny;

  const moved = Math.hypot(walker.x - startX, walker.y - startY);
  walker.walking = moved > 0;
  if (moved > 0) {
    face(walker, direction.x, direction.y);
    walker.stride += moved;
  }
  return moved;
}

/**
 * Moves a walker along its path for `dt` seconds. Returns true once the path
 * is used up.
 */
export function followPath(walker: Walker, dt: number, speed = WALK_SPEED): boolean {
  let budget = speed * dt;
  walker.walking = false;
  while (budget > 0 && walker.path.length > 0) {
    const next = walker.path[0];
    const dx = next.x - walker.x;
    const dy = next.y - walker.y;
    const distance = Math.hypot(dx, dy);
    if (distance <= budget) {
      walker.x = next.x;
      walker.y = next.y;
      walker.path.shift();
      budget -= distance;
      walker.stride += distance;
    } else {
      walker.x += (dx / distance) * budget;
      walker.y += (dy / distance) * budget;
      walker.stride += budget;
      budget = 0;
    }
    if (distance > 0) face(walker, dx, dy);
    walker.walking = true;
  }
  return walker.path.length === 0;
}

const STEPS = [
  [1, 0],
  [-1, 0],
  [0, 1],
  [0, -1],
  [1, 1],
  [1, -1],
  [-1, 1],
  [-1, -1],
] as const;

/**
 * The shortest walk from a position to the centre of a tile, as a list of tile
 * centres (A* over eight directions, without cutting corners). Returns
 * undefined when the tile can't be reached.
 */
export function findPath(map: MidwayMap, from: Point, to: Point): Point[] | undefined {
  const start = { x: Math.floor(from.x), y: Math.floor(from.y) };
  const goal = { x: Math.floor(to.x), y: Math.floor(to.y) };
  if (isBlocked(map, goal.x, goal.y)) return undefined;

  const key = (x: number, y: number) => y * map.width + x;
  const heuristic = (x: number, y: number) => {
    const dx = Math.abs(x - goal.x);
    const dy = Math.abs(y - goal.y);
    return Math.max(dx, dy) + (Math.SQRT2 - 1) * Math.min(dx, dy);
  };
  const cost = new Map<number, number>([[key(start.x, start.y), 0]]);
  const cameFrom = new Map<number, number>();
  const open: { x: number; y: number; f: number }[] = [
    { ...start, f: heuristic(start.x, start.y) },
  ];
  const closed = new Set<number>();

  while (open.length > 0) {
    let best = 0;
    for (let i = 1; i < open.length; i++) if (open[i].f < open[best].f) best = i;
    const current = open.splice(best, 1)[0];
    const currentKey = key(current.x, current.y);
    if (closed.has(currentKey)) continue;
    closed.add(currentKey);

    if (current.x === goal.x && current.y === goal.y) {
      const path: Point[] = [];
      let k: number | undefined = currentKey;
      while (k !== undefined && k !== key(start.x, start.y)) {
        path.unshift({ x: (k % map.width) + 0.5, y: Math.floor(k / map.width) + 0.5 });
        k = cameFrom.get(k);
      }
      return path;
    }

    for (const [dx, dy] of STEPS) {
      const nx = current.x + dx;
      const ny = current.y + dy;
      if (isBlocked(map, nx, ny)) continue;
      if (
        dx !== 0 &&
        dy !== 0 &&
        (isBlocked(map, current.x + dx, current.y) || isBlocked(map, current.x, current.y + dy))
      ) {
        continue;
      }
      const nextKey = key(nx, ny);
      const nextCost = cost.get(currentKey)! + (dx !== 0 && dy !== 0 ? Math.SQRT2 : 1);
      if (nextCost < (cost.get(nextKey) ?? Infinity)) {
        cost.set(nextKey, nextCost);
        cameFrom.set(nextKey, currentKey);
        open.push({ x: nx, y: ny, f: nextCost + heuristic(nx, ny) });
      }
    }
  }
  return undefined;
}

/** Distance in tiles from a point to the nearest edge of a rectangle. */
export function distanceToRect(point: Point, rect: Rect): number {
  const dx = Math.max(rect.x - point.x, 0, point.x - (rect.x + rect.w));
  const dy = Math.max(rect.y - point.y, 0, point.y - (rect.y + rect.h));
  return Math.hypot(dx, dy);
}

/** The booth the walker is close enough to use, if any. */
export function boothInReach(
  map: MidwayMap,
  point: Point,
  reach = BOOTH_REACH,
): BoothSlot | undefined {
  let nearest: BoothSlot | undefined;
  let nearestDistance = reach;
  for (const booth of map.booths) {
    const distance = distanceToRect(point, booth);
    if (distance <= nearestDistance) {
      nearest = booth;
      nearestDistance = distance;
    }
  }
  return nearest;
}

/** A walk to the open tile beside a booth that is closest to `from`. */
export function pathToBooth(map: MidwayMap, from: Point, booth: BoothSlot): Point[] | undefined {
  let best: Point[] | undefined;
  let bestLength = Infinity;
  for (let y = booth.y - 1; y <= booth.y + booth.h; y++) {
    for (let x = booth.x - 1; x <= booth.x + booth.w; x++) {
      if (isBlocked(map, x, y)) continue;
      const path = findPath(map, from, { x, y });
      if (!path) continue;
      let length = 0;
      let prev: Point = from;
      for (const step of path) {
        length += Math.hypot(step.x - prev.x, step.y - prev.y);
        prev = step;
      }
      if (length < bestLength) {
        best = path;
        bestLength = length;
      }
    }
  }
  return best;
}

export interface Visitor extends Walker {
  /** Seconds to wait before setting off again. */
  rest: number;
  look: number;
}

/** Tiles visitors like to stroll to: the avenue and the plazas. */
export function strollTiles(map: MidwayMap): Point[] {
  const tiles: Point[] = [];
  for (let y = 0; y < map.height; y++) {
    for (let x = 0; x < map.width; x++) {
      if (map.ground[y * map.width + x] !== 'grass' && !isBlocked(map, x, y)) tiles.push({ x, y });
    }
  }
  return tiles;
}

export function createVisitors(map: MidwayMap, count: number, random: () => number): Visitor[] {
  const tiles = strollTiles(map);
  return Array.from({ length: count }, (_, look) => {
    const tile = tiles[Math.floor(random() * tiles.length)];
    return { ...createWalker({ x: tile.x + 0.5, y: tile.y + 0.5 }), rest: random() * 3, look };
  });
}

/** Visitors rest a while, then stroll to somewhere else on the midway. */
export function updateVisitor(
  map: MidwayMap,
  visitor: Visitor,
  dt: number,
  random: () => number,
  tiles = strollTiles(map),
) {
  if (visitor.path.length > 0) {
    if (followPath(visitor, dt, VISITOR_SPEED)) visitor.rest = 1 + random() * 4;
    return;
  }
  visitor.walking = false;
  visitor.rest -= dt;
  if (visitor.rest > 0) return;
  const tile = tiles[Math.floor(random() * tiles.length)];
  visitor.path = findPath(map, visitor, tile) ?? [];
  visitor.rest = 1;
}
