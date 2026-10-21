---
name: 'New game: high striker'
about: 'Medium: add a high striker (strength tester) booth to the midway.'
title: 'New game: high striker'
---

Add a high striker game to the carnival: the strength tester where you swing a
mallet and try to ring the bell.

## How it plays

- A power meter swings up and down.
- The player clicks to swing the mallet. The higher the meter at that moment, the
  higher the puck flies up the tower.
- Ringing the bell at the top scores the most.
- The round is a fixed number of swings, and the score is their total.

## Notes

- Follow the `add-carnival-game` skill in `skills/add-carnival-game/SKILL.md`.
  The water cannon in `src/games/water-cannon/` is the pattern to copy.
- The game id is `high-striker`.

## Done when

- The high striker booth shows on the midway and the game is playable at `#/play/high-striker`.
- Its best score shows on the midway after a round.
- `npm run check` passes.
