---
name: 'New game: ring toss'
about: 'Medium: add a ring toss booth to the midway.'
title: 'New game: ring toss'
---

Add a ring toss game to the carnival.

## How it plays

- A grid of bottles stands at the back of the booth.
- The player aims and throws rings, one at a time, with a limited number of rings per round.
- A ring that lands on a bottle neck scores. Bottles further back score more.
- The round ends when the player runs out of rings.

## Notes

- Follow the `add-carnival-game` skill in `skills/add-carnival-game/SKILL.md`.
  The water cannon in `src/games/water-cannon/` is the pattern to copy.
- The game id is `ring-toss`.

## Done when

- The ring toss booth shows on the midway and the game is playable at `#/play/ring-toss`.
- Its best score shows on the midway after a round.
- `npm run check` passes.
