import { readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { registry } from './index';

const gamesDir = import.meta.dirname;
const folders = readdirSync(gamesDir).filter((name) =>
  statSync(join(gamesDir, name)).isDirectory(),
);

describe('game registry', () => {
  it('registers every game folder on the midway', () => {
    expect(
      registry
        .all()
        .map((g) => g.id)
        .sort(),
    ).toEqual([...folders].sort());
  });

  it('gives every game a name and a description', () => {
    for (const game of registry.all()) {
      expect(game.name.trim(), game.id).not.toBe('');
      expect(game.description.trim(), game.id).not.toBe('');
    }
  });
});
