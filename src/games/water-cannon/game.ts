import { canvasFont, recordScore, theme, type CarnivalGame } from '../../carnival';

const { width: WIDTH, height: HEIGHT } = theme.canvas;

export const TANK_SIZE = 15;
export const SHOT_SPEED = 700;
export const CANNON = { x: WIDTH / 2, y: HEIGHT - 30 } as const;
const RAILS = [
  { y: 110, speed: 180, radius: 22 },
  { y: 200, speed: -120, radius: 28 },
  { y: 290, speed: 60, radius: 34 },
];
const TARGETS_PER_RAIL = 3;

export interface Target {
  x: number;
  y: number;
  radius: number;
  /** Pixels per second; negative moves left. */
  speed: number;
}

export interface Shot {
  x: number;
  y: number;
  vx: number;
  vy: number;
}

export interface Splash {
  x: number;
  y: number;
  age: number;
}

export interface WaterCannonState {
  targets: Target[];
  shots: Shot[];
  splashes: Splash[];
  tank: number;
  score: number;
  phase: 'playing' | 'over';
}

export function createState(): WaterCannonState {
  const spacing = WIDTH / TARGETS_PER_RAIL;
  const targets = RAILS.flatMap((rail) =>
    Array.from({ length: TARGETS_PER_RAIL }, (_, i) => ({
      x: spacing * i + spacing / 2,
      y: rail.y,
      radius: rail.radius,
      speed: rail.speed,
    })),
  );
  return { targets, shots: [], splashes: [], tank: TANK_SIZE, score: 0, phase: 'playing' };
}

/** Faster targets are worth more: 10 points per 60 px/s, rounded up. */
export function scoreForHit(target: Target): number {
  return 10 * Math.ceil(Math.abs(target.speed) / 60);
}

export function isHit(shot: Shot, target: Target): boolean {
  return Math.hypot(shot.x - target.x, shot.y - target.y) <= target.radius;
}

/** Fires one shot of water towards the aim point. Returns false if nothing fired. */
export function fire(state: WaterCannonState, aimX: number, aimY: number): boolean {
  if (state.phase !== 'playing' || state.tank === 0) return false;
  const dx = aimX - CANNON.x;
  const dy = Math.min(aimY - CANNON.y, -1);
  const length = Math.hypot(dx, dy);
  state.shots.push({
    x: CANNON.x,
    y: CANNON.y,
    vx: (dx / length) * SHOT_SPEED,
    vy: (dy / length) * SHOT_SPEED,
  });
  state.tank -= 1;
  return true;
}

/** Advances the game by `dt` seconds. */
export function step(state: WaterCannonState, dt: number): void {
  for (const target of state.targets) {
    target.x += target.speed * dt;
    if (target.x > WIDTH + target.radius) target.x = -target.radius;
    if (target.x < -target.radius) target.x = WIDTH + target.radius;
  }

  const remaining: Shot[] = [];
  for (const shot of state.shots) {
    shot.x += shot.vx * dt;
    shot.y += shot.vy * dt;
    const target = state.targets.find((t) => isHit(shot, t));
    if (target) {
      state.score += scoreForHit(target);
      state.splashes.push({ x: target.x, y: target.y, age: 0 });
      // Send the soaked target back to the start of its rail.
      target.x = target.speed > 0 ? -target.radius : WIDTH + target.radius;
    } else if (shot.y > -10 && shot.x > -10 && shot.x < WIDTH + 10) {
      remaining.push(shot);
    }
  }
  state.shots = remaining;

  for (const splash of state.splashes) splash.age += dt;
  state.splashes = state.splashes.filter((s) => s.age < 0.4);

  if (state.tank === 0 && state.shots.length === 0) state.phase = 'over';
}

function draw(
  ctx: CanvasRenderingContext2D,
  state: WaterCannonState,
  aim: { x: number; y: number },
) {
  const { colors } = theme;

  ctx.fillStyle = colors.background;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Booth awning.
  const stripe = WIDTH / 16;
  for (let i = 0; i < 16; i++) {
    ctx.fillStyle = i % 2 === 0 ? colors.stripeA : colors.stripeB;
    ctx.fillRect(i * stripe, 0, stripe, 40);
  }

  for (const rail of RAILS) {
    ctx.fillStyle = colors.wood;
    ctx.fillRect(0, rail.y + rail.radius + 4, WIDTH, 6);
  }

  for (const target of state.targets) {
    ctx.fillStyle = colors.stripeB;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.stripeA;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * 0.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = colors.stripeB;
    ctx.beginPath();
    ctx.arc(target.x, target.y, target.radius * 0.25, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.fillStyle = '#4fc3f7';
  for (const shot of state.shots) {
    ctx.beginPath();
    ctx.arc(shot.x, shot.y, 5, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.strokeStyle = colors.water;
  ctx.lineWidth = 3;
  for (const splash of state.splashes) {
    ctx.globalAlpha = 1 - splash.age / 0.4;
    ctx.beginPath();
    ctx.arc(splash.x, splash.y, 10 + splash.age * 90, 0, Math.PI * 2);
    ctx.stroke();
  }
  ctx.globalAlpha = 1;

  // Cannon, pointing at the aim.
  const angle = Math.atan2(Math.min(aim.y - CANNON.y, -1), aim.x - CANNON.x);
  ctx.save();
  ctx.translate(CANNON.x, CANNON.y);
  ctx.rotate(angle);
  ctx.fillStyle = colors.accent;
  ctx.fillRect(0, -8, 46, 16);
  ctx.restore();
  ctx.fillStyle = colors.surface;
  ctx.beginPath();
  ctx.arc(CANNON.x, CANNON.y, 20, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = colors.text;
  ctx.font = canvasFont('body', 'bold');
  ctx.textAlign = 'left';
  ctx.fillText(`Score ${state.score}`, 16, HEIGHT - 20);
  ctx.textAlign = 'right';
  ctx.fillText(`Water ${state.tank}/${TANK_SIZE}`, WIDTH - 16, HEIGHT - 20);

  if (state.phase === 'over') {
    ctx.fillStyle = colors.background;
    ctx.globalAlpha = 0.8;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    ctx.globalAlpha = 1;
    ctx.textAlign = 'center';
    ctx.fillStyle = colors.accent;
    ctx.font = canvasFont('title', 'bold');
    ctx.fillText(`Tank empty! You scored ${state.score}`, WIDTH / 2, HEIGHT / 2);
    ctx.fillStyle = colors.text;
    ctx.font = canvasFont('body');
    ctx.fillText('Click to play again', WIDTH / 2, HEIGHT / 2 + 40);
  }
}

export const waterCannon: CarnivalGame = {
  id: 'water-cannon',
  name: 'Water Cannon',
  description: 'Soak the targets before your tank runs dry. Faster targets score more.',

  start(canvas) {
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas 2D is not available');
    canvas.width = WIDTH;
    canvas.height = HEIGHT;

    let state = createState();
    let scoreRecorded = false;
    const aim = { x: WIDTH / 2, y: 0 };

    const toCanvas = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      return {
        x: ((event.clientX - rect.left) / rect.width) * WIDTH,
        y: ((event.clientY - rect.top) / rect.height) * HEIGHT,
      };
    };
    const onMove = (event: PointerEvent) => Object.assign(aim, toCanvas(event));
    const onDown = (event: PointerEvent) => {
      Object.assign(aim, toCanvas(event));
      if (state.phase === 'over') {
        state = createState();
        scoreRecorded = false;
      } else {
        fire(state, aim.x, aim.y);
      }
    };
    canvas.addEventListener('pointermove', onMove);
    canvas.addEventListener('pointerdown', onDown);

    let frame = 0;
    let last = performance.now();
    const loop = (time: number) => {
      // Cap the step so a background tab doesn't teleport everything.
      const dt = Math.min((time - last) / 1000, 0.05);
      last = time;
      step(state, dt);
      if (state.phase === 'over' && !scoreRecorded) {
        recordScore(waterCannon.id, state.score);
        scoreRecorded = true;
      }
      draw(ctx, state, aim);
      frame = requestAnimationFrame(loop);
    };
    frame = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(frame);
      canvas.removeEventListener('pointermove', onMove);
      canvas.removeEventListener('pointerdown', onDown);
    };
  },
};
