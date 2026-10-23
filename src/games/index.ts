import { createRegistry, type CarnivalGame } from '../carnival';

/**
 * Every game on the midway: each folder here whose `game.ts` has a default
 * export. Vite finds them when it builds, so adding a game never touches this
 * file, and games built at the same time don't clash here.
 */
const games = import.meta.glob<CarnivalGame | undefined>('./*/game.ts', {
  eager: true,
  import: 'default',
});

export const registry = createRegistry(
  Object.keys(games)
    .sort()
    .map((path) => {
      const game = games[path];
      if (!game) throw new Error(`${path} needs a default export of its CarnivalGame`);
      return game;
    }),
);
