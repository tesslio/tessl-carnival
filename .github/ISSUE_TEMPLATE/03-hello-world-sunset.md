---
name: 'Hello world: paint the sky at sunset'
about: 'Tiny: change two colors to see your factory work.'
title: Paint the sky at sunset
---

Turn the midway's daytime blue sky into a sunset.

## What to change

The sky is drawn from two colors in `src/midway/palette.ts`: `sky`, near the
horizon, and `skyHigh`, at the top. Change both to sunset colors, for example
a warm orange for `sky` and a deep pink or purple for `skyHigh`.

The comment above the palette calls it "the midway map's daytime palette".
Change "daytime" to "sunset" there too, so it matches.

Change nothing else.

## Done when

- The sky on the midway fades from orange near the horizon to pink or purple at
  the top.
- The palette's comment says it's a sunset palette.
- `npm run check` passes.
