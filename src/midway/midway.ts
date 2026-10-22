import { palette } from './palette';
import {
  archBounds,
  BOOTH_SIGN_HEIGHT,
  boothBounds,
  drawArch,
  drawBooth,
  drawBunting,
  drawCloud,
  drawFloaters,
  drawFrontHedge,
  drawField,
  drawGroundLayer,
  drawProp,
  drawWalker,
  groundBounds,
  HORIZON,
  label,
  PLAYER_LOOK,
  propBounds,
  visitorLook,
  type Box,
  type Cloud,
  type Floater,
  type GroundLayer,
} from './render';
import {
  boothInReach,
  createVisitors,
  createWalker,
  findPath,
  followPath,
  inputDirection,
  layoutMidway,
  pathToBooth,
  strollTiles,
  toScreen,
  toTile,
  updateVisitor,
  walk,
  type BoothSlot,
  type Point,
  type Prop,
} from './world';

export interface MidwayOptions {
  games: readonly { id: string; name: string }[];
  /** Called when the player asks to play the booth they're standing at. */
  onPlay(gameId: string): void;
  /** Called whenever the booth in reach changes. */
  onReach(booth: BoothSlot | undefined): void;
}

export interface MidwayControls {
  /** Walks the player to a game's booth. */
  walkTo(gameId: string): void;
  stop(): void;
}

const MOVE_KEYS: Record<string, [number, number]> = {
  ArrowUp: [0, -1],
  KeyW: [0, -1],
  ArrowDown: [0, 1],
  KeyS: [0, 1],
  ArrowLeft: [-1, 0],
  KeyA: [-1, 0],
  ArrowRight: [1, 0],
  KeyD: [1, 0],
};
const PLAY_KEYS = new Set(['KeyE', 'Enter', 'Space']);
const DEVCON_URL =
  'https://tessl.io/devcon?utm_source=carnival&utm_medium=midway-billboard&utm_campaign=tessl-carnival';
const MIN_QUALITY = 0.5;

/** Where the player stood when they last left the midway, for this page load. */
let returnTo: Point | undefined;

export function startMidway(canvas: HTMLCanvasElement, options: MidwayOptions): MidwayControls {
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas 2D is not available');

  const map = layoutMidway(options.games.map((g) => g.id));
  const names = new Map(options.games.map((g) => [g.id, g.name]));
  const player = createWalker(returnTo ?? map.spawn);
  // Booths and scenery never move, so work out where each one sits once.
  const scenery: { depth: number; box: Box; booth?: BoothSlot; prop?: Prop; name: string }[] = [
    ...map.booths.map((booth) => ({
      depth: booth.x + booth.y + 2,
      box: boothBounds(booth),
      booth,
      name: booth.gameId ? (names.get(booth.gameId) ?? booth.gameId) : 'Coming soon',
    })),
    ...map.props.map((prop) => ({
      depth: prop.x + prop.y + (prop.w + prop.h) / 2,
      box: propBounds(prop),
      prop,
      name: '',
    })),
  ];
  const strolls = strollTiles(map);
  const visitors = createVisitors(map, 9, Math.random);
  const clouds: Cloud[] = Array.from({ length: 9 }, (_, i) => ({
    x: i / 9 + Math.random() * 0.08,
    y: Math.random(),
    size: 0.7 + Math.random() * 0.6,
    speed: 3 + Math.random() * 4,
  }));
  const floaters: Floater[] = [];
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let nextFloater = 2;
  let inReach: BoothSlot | undefined;
  let destination: Point | undefined;

  let dpr = 1;
  /** Drops below 1 on machines too slow to keep up, trading sharpness for speed. */
  let quality = 1;
  let slowFrames = 0;
  /** CSS pixels per world pixel. */
  let zoom = 2;
  let view = { w: 0, h: 0 };
  let ground: GroundLayer | undefined;
  const camera = { x: 0, y: 0 };
  let cameraReady = false;

  const resize = () => {
    // Sharper than 1.5x costs far more pixels than this flat style gains from it,
    // and slow laptops feel it.
    dpr = Math.min(window.devicePixelRatio || 1, 1.5) * quality;
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * dpr));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * dpr));
    // Fit most of the midway on screen, but never so small that people get lost.
    zoom = Math.max(
      1.3,
      Math.min(3, Math.min(canvas.clientWidth / 720, canvas.clientHeight / 540)),
    );
    view = { w: canvas.clientWidth / zoom, h: canvas.clientHeight / zoom };
    ground = drawGroundLayer(map, zoom * dpr);
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  const play = (booth: BoothSlot | undefined) => {
    if (!booth?.gameId) return;
    returnTo = { x: player.x, y: player.y };
    options.onPlay(booth.gameId);
  };

  const keys = new Set<string>();
  const isControl = (target: EventTarget | null) =>
    target instanceof HTMLElement && target.closest('a, button, input, textarea, select') !== null;
  const onKeyDown = (event: KeyboardEvent) => {
    if (event.metaKey || event.ctrlKey || event.altKey) return;
    if (event.code in MOVE_KEYS) {
      keys.add(event.code);
      player.path = [];
      destination = undefined;
      event.preventDefault();
    } else if (PLAY_KEYS.has(event.code) && !isControl(event.target) && inReach?.gameId) {
      event.preventDefault();
      play(inReach);
    }
  };
  const onKeyUp = (event: KeyboardEvent) => keys.delete(event.code);
  const onBlur = () => keys.clear();

  const toWorld = (event: PointerEvent): Point => {
    const box = canvas.getBoundingClientRect();
    return {
      x: (event.clientX - box.left) / zoom + camera.x,
      y: (event.clientY - box.top) / zoom + camera.y,
    };
  };
  const boothAt = (point: Point) =>
    map.booths
      .filter((booth) => {
        const b = boothBounds(booth);
        return point.x >= b.left && point.x <= b.right && point.y >= b.top && point.y <= b.bottom;
      })
      .sort((a, b) => b.x + b.y - (a.x + a.y))[0];

  const billboardAt = (point: Point) =>
    map.props.some((prop) => {
      if (prop.kind !== 'billboard') return false;
      const b = propBounds(prop);
      return point.x >= b.left && point.x <= b.right && point.y >= b.top && point.y <= b.bottom;
    });

  const walkToBooth = (booth: BoothSlot) => {
    player.path = pathToBooth(map, player, booth) ?? [];
    destination = player.path.at(-1);
  };

  const onPointerDown = (event: PointerEvent) => {
    const point = toWorld(event);
    const booth = boothAt(point);
    if (!booth && billboardAt(point)) {
      window.open(DEVCON_URL, '_blank', 'noopener');
      return;
    }
    if (booth) {
      if (booth === inReach) play(booth);
      else walkToBooth(booth);
      return;
    }
    const path = findPath(map, player, toTile(point.x, point.y));
    if (path) {
      player.path = path;
      destination = path.at(-1);
    }
  };
  const onPointerMove = (event: PointerEvent) => {
    const point = toWorld(event);
    canvas.style.cursor = boothAt(point) || billboardAt(point) ? 'pointer' : 'default';
  };

  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('blur', onBlur);
  canvas.addEventListener('pointerdown', onPointerDown);
  canvas.addEventListener('pointermove', onPointerMove);

  const updateFloaters = (dt: number) => {
    if (calm) return;
    nextFloater -= dt;
    if (nextFloater <= 0) {
      nextFloater = 4 + Math.random() * 5;
      const from = strolls[Math.floor(Math.random() * strolls.length)];
      const p = toScreen(from.x + 0.5, from.y + 0.5);
      floaters.push({
        x: p.x,
        y: p.y - 24,
        age: 0,
        color: palette.balloons[Math.floor(Math.random() * palette.balloons.length)],
      });
    }
    for (const f of floaters) {
      f.age += dt;
      f.y -= 22 * dt;
    }
    floaters.splice(0, floaters.length, ...floaters.filter((f) => f.age < 6));
  };

  const updateCamera = (dt: number) => {
    const focus = toScreen(player.x, player.y);
    const margin = 40;
    const left = -map.height * 16 - margin;
    const right = map.width * 16 + margin;
    const top = HORIZON - 150;
    const bottom = (map.width + map.height) * 8 + 30;
    const fit = (target: number, min: number, max: number, size: number) =>
      max - min <= size ? (min + max) / 2 - size / 2 : Math.max(min, Math.min(max - size, target));
    const target = {
      x: fit(focus.x - view.w / 2, left, right, view.w),
      y: fit(focus.y - view.h / 2 - 16, top, bottom, view.h),
    };
    const ease = cameraReady ? 1 - Math.exp(-dt * 5) : 1;
    camera.x += (target.x - camera.x) * ease;
    camera.y += (target.y - camera.y) * ease;
    cameraReady = true;
  };

  const draw = (t: number) => {
    // The sky, and clouds drifting slowly behind the midway.
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const horizon = (HORIZON - camera.y) * zoom;
    const sky = ctx.createLinearGradient(0, horizon - 260 * zoom, 0, horizon);
    sky.addColorStop(0, palette.skyHigh);
    sky.addColorStop(1, palette.sky);
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, canvas.clientWidth, Math.max(0, horizon + 2));

    ctx.setTransform(dpr * zoom, 0, 0, dpr * zoom, 0, 0);
    const span = view.w + 200;
    for (const cloud of clouds) {
      const x =
        ((((cloud.x * span - camera.x * 0.3 + (calm ? 0 : t * cloud.speed)) % span) + span) %
          span) -
        100;
      const y = HORIZON - camera.y - 50 - cloud.y * 100;
      drawCloud(ctx, x, y, cloud.size);
    }

    // Snap the camera to whole device pixels so the pre-drawn ground stays crisp.
    const k = dpr * zoom;
    const cam = { x: Math.round(camera.x * k) / k, y: Math.round(camera.y * k) / k };
    const visible: Box = { left: cam.x, top: cam.y, right: cam.x + view.w, bottom: cam.y + view.h };
    ctx.setTransform(k, 0, 0, k, -cam.x * k, -cam.y * k);
    drawField(ctx, visible);
    if (ground) {
      const bounds = groundBounds(map);
      if (ground.scale === k) {
        // Pixel for pixel, at a whole-pixel offset, so it stays crisp.
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        ctx.drawImage(
          ground.canvas,
          Math.round((bounds.left - cam.x) * k),
          Math.round((bounds.top - cam.y) * k),
        );
        ctx.setTransform(k, 0, 0, k, -cam.x * k, -cam.y * k);
      } else {
        // A midway too long to pre-draw at full sharpness: stretch it to fit.
        ctx.drawImage(
          ground.canvas,
          bounds.left,
          bounds.top,
          ground.canvas.width / ground.scale,
          ground.canvas.height / ground.scale,
        );
      }
    }

    if (destination && player.path.length > 0) {
      const p = toScreen(Math.floor(destination.x) + 0.5, Math.floor(destination.y) + 0.5);
      const pulse = 1 + Math.sin(t * 6) * 0.15;
      ctx.strokeStyle = palette.gold;
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.ellipse(p.x, p.y, 10 * pulse, 5 * pulse, 0, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Anything drawn in front of the player fades, so they never get lost.
    const feet = toScreen(player.x, player.y);
    const playerDepth = player.x + player.y;
    const hidesPlayer = (box: Box, depth: number) =>
      depth > playerDepth &&
      box.left < feet.x + 6 &&
      box.right > feet.x - 6 &&
      box.top < feet.y &&
      box.bottom > feet.y - 30;
    const faded = (box: Box, depth: number, paint: () => void) => {
      if (!hidesPlayer(box, depth)) return paint();
      ctx.globalAlpha = 0.4;
      paint();
      ctx.globalAlpha = 1;
    };

    // Only draw (and so only animate) what's on screen.
    const onScreen = (box: Box) =>
      box.right > visible.left &&
      box.left < visible.right &&
      box.bottom > visible.top &&
      box.top < visible.bottom;
    const walkerBox = (w: Point): Box => {
      const p = toScreen(w.x, w.y);
      return { left: p.x - 10, right: p.x + 10, top: p.y - 40, bottom: p.y + 4 };
    };

    type Drawable = { depth: number; box: Box; draw: () => void };
    const drawables: Drawable[] = [
      ...visitors.map((v) => ({
        depth: v.x + v.y,
        box: walkerBox(v),
        draw: () => drawWalker(ctx, v, visitorLook(v.look)),
      })),
      {
        depth: playerDepth,
        box: walkerBox(player),
        draw: () => drawWalker(ctx, player, PLAYER_LOOK, true, t),
      },
    ];
    for (const item of scenery) {
      if (!onScreen(item.box)) continue;
      const { depth, box, booth, prop, name } = item;
      const paint = booth
        ? () => drawBooth(ctx, booth, name, t, booth === inReach)
        : () => drawProp(ctx, prop!, t);
      drawables.push({ depth, box, draw: () => faded(box, depth, paint) });
    }
    drawables
      .filter((d) => onScreen(d.box))
      .sort((a, b) => a.depth - b.depth)
      .forEach((d) => d.draw());

    drawFrontHedge(ctx, map);
    if (onScreen(archBounds(map))) faded(archBounds(map), Infinity, () => drawArch(ctx, map, t));
    drawBunting(ctx, map, t, visible);
    drawFloaters(ctx, floaters);

    // The prompt over the booth in reach, at full resolution.
    if (inReach?.gameId) {
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const c = toScreen(inReach.x + 1, inReach.y + 1);
      label(
        ctx,
        'Press E to play',
        (c.x - cam.x) * zoom,
        (c.y - BOOTH_SIGN_HEIGHT - 46 - cam.y) * zoom,
      );
    }
  };

  let frame = 0;
  let last = performance.now();
  const loop = (time: number) => {
    // Cap the step so a background tab doesn't teleport everyone.
    const elapsed = (time - last) / 1000;
    const dt = Math.min(elapsed, 0.05);
    last = time;

    // If frames keep taking longer than 1/40 s, draw fewer pixels. Long gaps
    // (a background tab, a resize) don't count.
    if (elapsed < 0.25)
      slowFrames = elapsed > 1 / 40 ? slowFrames + 1 : Math.max(0, slowFrames - 1);
    if (slowFrames > 90 && quality > MIN_QUALITY) {
      quality = Math.max(MIN_QUALITY, quality * 0.75);
      slowFrames = 0;
      resize();
    }

    let right = 0;
    let down = 0;
    for (const code of keys) {
      right += MOVE_KEYS[code][0];
      down += MOVE_KEYS[code][1];
    }
    const direction = inputDirection(Math.sign(right), Math.sign(down));
    if (direction.x !== 0 || direction.y !== 0) walk(map, player, direction, dt);
    else if (player.path.length > 0) followPath(player, dt);
    else player.walking = false;

    for (const visitor of visitors) updateVisitor(map, visitor, dt, Math.random, strolls);

    const reach = boothInReach(map, player);
    if (reach !== inReach) {
      inReach = reach;
      options.onReach(reach);
    }

    updateFloaters(dt);
    updateCamera(dt);
    draw(time / 1000);
    frame = requestAnimationFrame(loop);
  };
  frame = requestAnimationFrame(loop);

  return {
    walkTo(gameId) {
      const booth = map.booths.find((b) => b.gameId === gameId);
      if (booth) walkToBooth(booth);
    },
    stop() {
      cancelAnimationFrame(frame);
      observer.disconnect();
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      window.removeEventListener('blur', onBlur);
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointermove', onPointerMove);
    },
  };
}
