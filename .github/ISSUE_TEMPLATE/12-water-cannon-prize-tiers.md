---
name: 'Water cannon: add prize tiers'
about: 'Small: award a bronze, silver or gold prize at the end of a water cannon round.'
title: 'Water cannon: add prize tiers'
---

Award a prize at the end of each water cannon round, based on the score.

## How it should work

- Three tiers: bronze, silver and gold, each with a minimum score.
- The game over screen shows the prize won, or that no prize was won.
- Use `prizeFor` from `src/carnival` to pick the tier; the water cannon only
  defines its own tiers.

## Done when

- The game over screen shows the right prize for the score.
- The water cannon's tests cover each tier and a score below bronze.
- The water cannon's README lists the tiers and their scores.
- `npm run check` passes.
