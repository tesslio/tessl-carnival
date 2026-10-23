---
name: 'Hello world: paint the sky at sunset'
about: 'Tiny: change two colours to see your factory work.'
title: Paint the sky at sunset
---

Turn the midway's daytime blue sky into a sunset.

## What to change

The sky is drawn from two colours in `src/midway/palette.ts`: `sky`, near the
horizon, and `skyHigh`, at the top. Change both to sunset colours, for example
a warm orange for `sky` and a deep pink or purple for `skyHigh`.

Change nothing else.

## Done when

- The sky on the midway fades from orange near the horizon to pink or purple at
  the top.
- `npm run check` passes.
