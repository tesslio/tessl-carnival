---
name: 'New game: hook a duck'
about: 'Medium: add a hook a duck booth to the midway.'
title: 'New game: hook a duck'
---

Add a hook a duck game to the carnival.

## How it plays

- Rubber ducks float round a stream in a loop.
- The player lowers a hook on a rod to catch a duck as it passes.
- Each duck has a number on its base: that's what it scores.
- The round ends after a fixed number of casts.

## Notes

- Follow the `add-carnival-game` skill in `skills/add-carnival-game/SKILL.md`.
  The water cannon in `src/games/water-cannon/` is the pattern to copy.
- The game id is `hook-a-duck`.

## Done when

- The hook a duck booth shows on the midway and the game is playable at `#/play/hook-a-duck`.
- Its best score shows on the midway after a round.
- `npm run check` passes.
