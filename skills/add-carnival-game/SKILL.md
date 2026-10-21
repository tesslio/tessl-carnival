---
name: add-carnival-game
description: Add a new game to the Tessl Carnival midway, following the water cannon pattern and the house rules. Use when asked to build, add or create a carnival game or booth, such as ring toss, whack-a-mole, hook a duck or high striker.
---

# Add a carnival game

Every game is a booth in its own folder, built the same way as the water cannon.
Read `src/games/water-cannon/game.ts` first: it is the pattern to copy.

## Steps

1. **Pick the id.** Kebab-case, short and plain, such as `ring-toss`. The folder,
   the `id` and the URL (`#/play/ring-toss`) all use it.
2. **Create the folder** `src/games/<game-id>/` with three files:
   - `game.ts`
   - `game.test.ts`
   - `README.md`
3. **Write the logic as plain functions** in `game.ts`: a `createState()` and
   functions like `step(state, dt)` and the player's actions. Export them, and
   keep them free of the canvas and the DOM so Vitest can run them.
4. **Export the game** from `game.ts`:

   ```ts
   export const ringToss: CarnivalGame = {
     id: 'ring-toss',
     name: 'Ring Toss',
     description: 'One sentence for the midway.',
     start(canvas) {
       // size the canvas from theme.canvas, add listeners, start the loop
       return () => {
         // cancel the animation frame and remove the listeners
       };
     },
   };
   ```

5. **Report the score once per round** with `recordScore(ringToss.id, score)`
   from `src/carnival`, when the round ends. Never use local storage directly.
6. **Draw with the theme.** Every colour is `theme.colors.*` and every font is
   `canvasFont(...)`. If the game needs a colour the theme lacks, use the closest
   theme colour and say so in the pull request. Adding a colour to
   `src/carnival/theme.ts` is its own change, never part of a game's.
7. **Register it** by adding it to the list in `src/games/index.ts`.
8. **Test the logic** in `game.test.ts`: the starting state, scoring, how a round
   ends, and any edge the README promises.
9. **Write the README:** how to play, how scoring works and the files in the folder.
10. **Run `npm run format`, then `npm run check`,** and fix anything it
    reports. If you can open a browser, also run `npm run dev`, walk to the new
    booth and play a round.

## Done when

- The game shows on the midway and is playable at `#/play/<game-id>`.
- Its best score shows on the midway after a round.
- `npm run check` passes, including the registry test that every game folder
  is registered.
