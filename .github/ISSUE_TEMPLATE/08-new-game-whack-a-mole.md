---
name: 'New game: whack-a-mole'
about: 'Medium: add a whack-a-mole booth to the midway.'
title: 'New game: whack-a-mole'
---

Add a whack-a-mole game to the carnival.

## How it plays

- Moles pop up from a grid of holes for a short time, then drop back down.
- The player clicks a mole while it's up to whack it and score.
- Moles pop up faster as the round goes on.
- The round lasts a fixed time.

## Notes

- Follow the `add-carnival-game` skill in `skills/add-carnival-game/SKILL.md`.
  The water cannon in `src/games/water-cannon/` is the pattern to copy.
- The game id is `whack-a-mole`.

## Done when

- The whack-a-mole booth shows on the midway and the game is playable at `#/play/whack-a-mole`.
- Its best score shows on the midway after a round.
- `npm run check` passes.
