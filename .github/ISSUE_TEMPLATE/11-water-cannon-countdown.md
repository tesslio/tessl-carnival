---
name: 'Water cannon: add a countdown timer'
about: 'Small: give each water cannon round a time limit as well as a tank.'
title: 'Water cannon: add a countdown timer'
---

A water cannon round only ends when the tank is empty. Add a time limit too, so
players have to shoot fast as well as straight.

## How it should work

- Each round lasts 30 seconds, shown counting down next to the water left.
- The round ends when the time runs out or the tank is empty, whichever comes
  first.
- The score is saved once, when the round ends, as it is now.

## Done when

- The countdown shows during a round and the round ends at zero.
- The water cannon's tests cover a round ending on time.
- The water cannon's README explains the timer.
- `npm run check` passes.
