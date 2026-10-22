---
name: Show the top five scores on the midway
about: "Small, a good second issue: show each game's top five scores on its booth card."
title: Show the top five scores on the midway
---

When you walk up to a booth on the midway, its card shows the game's best score.
Show the top five scores instead, so players can see what they're up against.

## Notes

- The booth card is built in `src/main.ts` (`renderMidway`). The map itself, in
  `src/midway/`, doesn't need to change.
- Read scores with `topScores(gameId, 5)` from `src/carnival`. Don't read local
  storage directly.
- When a game has no scores yet, keep showing "No scores yet".

## Done when

- A booth card lists up to five scores, highest first.
- A game with no scores still shows "No scores yet".
- `npm run check` passes.
