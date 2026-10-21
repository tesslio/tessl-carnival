import { describe, expect, it } from 'vitest';
import {
  boothInReach,
  canStand,
  createVisitors,
  createWalker,
  findPath,
  followPath,
  inputDirection,
  isBlocked,
  layoutMidway,
  pathToBooth,
  seededRandom,
  toScreen,
  toTile,
  updateVisitor,
  walk,
} from './world';

describe('layoutMidway', () => {
  it('gives every game its own booth, nearest the gate first', () => {
    const map = layoutMidway(['water-cannon', 'ring-toss', 'hook-a-duck']);
    const open = map.booths.filter((b) => b.gameId);
    expect(open.map((b) => b.gameId)).toEqual(['water-cannon', 'ring-toss', 'hook-a-duck']);
    expect(open[0].y).toBeGreaterThan(open[2].y);
  });

  it('fills spare slots with coming-soon booths', () => {
    const map = layoutMidway(['water-cannon']);
    expect(map.booths).toHaveLength(4);
    expect(map.booths.filter((b) => !b.gameId)).toHaveLength(3);
  });

  it('grows the avenue as games are added', () => {
    const ids = Array.from({ length: 9 }, (_, i) => `game-${i}`);
    const small = layoutMidway(ids.slice(0, 1));
    const big = layoutMidway(ids);
    expect(big.booths.filter((b) => b.gameId)).toHaveLength(9);
    expect(big.height).toBeGreaterThan(small.height);
  });

  it('blocks booths and keeps the edge fenced', () => {
    const map = layoutMidway(['water-cannon']);
    const booth = map.booths[0];
    expect(isBlocked(map, booth.x, booth.y)).toBe(true);
    expect(isBlocked(map, 0, 5)).toBe(true);
    expect(isBlocked(map, map.width - 1, 5)).toBe(true);
    expect(isBlocked(map, -1, 0)).toBe(true);
  });

  it('lets the player reach every booth from the gate', () => {
    const ids = Array.from({ length: 7 }, (_, i) => `game-${i}`);
    const map = layoutMidway(ids);
    expect(canStand(map, map.spawn.x, map.spawn.y)).toBe(true);
    for (const booth of map.booths) {
      const path = pathToBooth(map, map.spawn, booth);
      expect(path, `booth ${booth.index}`).toBeDefined();
      expect(boothInReach(map, path!.at(-1)!)).toBe(booth);
    }
  });

  it('never stacks booths and scenery on the same tile, however many games there are', () => {
    for (const count of [0, 1, 4, 9, 15]) {
      const map = layoutMidway(Array.from({ length: count }, (_, i) => `game-${i}`));
      const taken = new Set<string>();
      for (const thing of [...map.booths, ...map.props]) {
        for (let y = thing.y; y < thing.y + thing.h; y++) {
          for (let x = thing.x; x < thing.x + thing.w; x++) {
            expect(taken.has(`${x},${y}`), `${count} games: ${x},${y}`).toBe(false);
            expect(x > 0 && y > 0 && x < map.width - 1 && y < map.height - 1).toBe(true);
            taken.add(`${x},${y}`);
          }
        }
      }
    }
  });

  it('keeps the avenue clear from the gate to the big top', () => {
    const map = layoutMidway(['water-cannon']);
    for (let y = 6; y < map.height - 1; y++) {
      expect(isBlocked(map, map.avenueX, y)).toBe(false);
      expect(isBlocked(map, map.avenueX + 1, y)).toBe(false);
    }
  });

  it('is the same on every visit', () => {
    expect(layoutMidway(['a'])).toEqual(layoutMidway(['a']));
  });
});

describe('isometric projection', () => {
  it('turns tiles into screen pixels and back', () => {
    expect(toScreen(1, 0)).toEqual({ x: 16, y: 8 });
    expect(toScreen(0, 1)).toEqual({ x: -16, y: 8 });
    const back = toTile(toScreen(3.25, 7.5).x, toScreen(3.25, 7.5).y);
    expect(back.x).toBeCloseTo(3.25);
    expect(back.y).toBeCloseTo(7.5);
  });

  it('walks up the screen when up is pressed', () => {
    const up = inputDirection(0, -1);
    const step = toScreen(up.x, up.y);
    expect(step.x).toBeCloseTo(0);
    expect(step.y).toBeLessThan(0);
    expect(Math.hypot(up.x, up.y)).toBeCloseTo(1);
    expect(inputDirection(0, 0)).toEqual({ x: 0, y: 0 });
  });
});

describe('walking', () => {
  it('moves freely across open ground', () => {
    const map = layoutMidway([]);
    const walker = createWalker(map.spawn);
    walk(map, walker, { x: 0, y: -1 }, 0.25);
    expect(walker.y).toBeCloseTo(map.spawn.y - 0.25 * 4.2);
    expect(walker.walking).toBe(true);
    expect(walker.facing).toBe('back');
  });

  it("can't walk through a booth", () => {
    const map = layoutMidway(['water-cannon']);
    const booth = map.booths[0];
    const walker = createWalker({ x: booth.x + 1, y: booth.y + booth.h + 0.5 });
    for (let i = 0; i < 60; i++) walk(map, walker, { x: 0, y: -1 }, 1 / 60);
    expect(walker.y).toBeGreaterThanOrEqual(booth.y + booth.h + 0.3 - 1e-9);
  });

  it('follows a path to the end', () => {
    const map = layoutMidway([]);
    const walker = createWalker(map.spawn);
    walker.path = findPath(map, walker, { x: map.avenueX, y: 5 })!;
    let done = false;
    for (let i = 0; i < 600 && !done; i++) done = followPath(walker, 1 / 30);
    expect(done).toBe(true);
    expect(walker.x).toBe(map.avenueX + 0.5);
    expect(walker.y).toBe(5.5);
  });
});

describe('findPath', () => {
  it('goes round booths rather than through them', () => {
    const map = layoutMidway(['water-cannon']);
    const booth = map.booths[0];
    const path = findPath(
      map,
      { x: booth.x - 0.5, y: booth.y + 1 },
      { x: booth.x + booth.w, y: booth.y + 1 },
    )!;
    expect(path).toBeDefined();
    for (const step of path)
      expect(isBlocked(map, Math.floor(step.x), Math.floor(step.y))).toBe(false);
  });

  it('gives up on tiles nobody can stand on', () => {
    const map = layoutMidway(['water-cannon']);
    const booth = map.booths[0];
    expect(findPath(map, map.spawn, { x: booth.x, y: booth.y })).toBeUndefined();
  });
});

describe('boothInReach', () => {
  it('finds the booth the player is standing at, and nothing out in the open', () => {
    const map = layoutMidway(['water-cannon']);
    const booth = map.booths[0];
    expect(boothInReach(map, { x: booth.x + 1, y: booth.y + booth.h + 0.5 })).toBe(booth);
    expect(boothInReach(map, map.spawn)).toBeUndefined();
  });
});

describe('visitors', () => {
  it('stroll the midway without walking into anything', () => {
    const map = layoutMidway(['water-cannon']);
    const random = seededRandom(1);
    const visitors = createVisitors(map, 5, random);
    for (let i = 0; i < 900; i++) {
      for (const visitor of visitors) updateVisitor(map, visitor, 1 / 30, random);
    }
    for (const visitor of visitors) {
      expect(isBlocked(map, Math.floor(visitor.x), Math.floor(visitor.y))).toBe(false);
      expect(visitor.stride).toBeGreaterThan(0);
    }
  });
});
