---
name: Press Escape to go back to the midway
about: 'Small, a good second issue: leave a game with the Escape key.'
title: Press Escape to go back to the midway
---

While you're playing a game, the only way back to the midway is the "Back to the
midway" link. Let players press **Escape** as well.

## Notes

- The game page is built in `src/main.ts` (`renderGame`). This works the same for
  every game, so no game needs to change.
- Add the listener when a game starts and remove it when the player leaves, the
  same way the midway cleans up after itself.

## Done when

- Pressing Escape on any game's page goes back to the midway.
- Escape does nothing extra once you're back on the midway.
- `npm run check` passes.
