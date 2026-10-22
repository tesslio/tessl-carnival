---
name: 'Hello world: welcome visitors to the midway'
about: 'Tiny: add one line of text to see your factory work.'
title: Welcome visitors to the midway
---

Greet people when they arrive on the midway.

## What to change

The help box in the bottom corner of the midway is built in `src/main.ts`, in
the paragraph with the class `midway-help`. Add a short welcome line at the
start of it, such as "Welcome to the carnival!", and keep the controls text
that's already there.

Change nothing else.

## Done when

- The help box on the midway starts with the welcome line, above the controls.
  It shows on laptop-sized windows; narrow phone screens hide it.
- `npm run check` passes.
