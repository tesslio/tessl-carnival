---
name: doc-gardening
description: Find docs and agent instructions in the carnival that no longer match the code, and file one GitHub issue per stale doc. Use when running the doc gardening maintenance loop, or when asked to check whether the README, AGENTS.md, a game's README or a skill is out of date. Files issues only; never changes code or docs.
---

# Doc gardening

Docs drift when code changes and nobody updates them. Agents read these docs
before they work, so a stale one leads them astray. Your job is to find the
drift and file issues. Don't fix anything yourself: the factory ships the fixes.

## What to check

Read each doc, then check every concrete claim it makes against the code:

- `README.md`: commands, setup steps and the layout it describes.
- `AGENTS.md`: the layout, commands and house rules.
- Each game's `src/games/<game-id>/README.md`: how to play, scoring, options and
  files. Check numbers (shot counts, speeds, points) and options (URL
  parameters, keys) against the game's code.
- Each `SKILL.md` under `skills/` and `tessl-factory/skills/`: file paths,
  function names and steps.

A claim is stale when the code does something different, or when it names a
file, function, option or command that doesn't exist. Run commands like
`npm run check` if you need to confirm one works.

## What to file

- **One issue per stale doc,** listing every stale claim in it.
- **Title:** `Docs: <file> is out of date`.
- **Body:** for each claim, quote the doc, say what the code actually does and
  point to the line, for example `src/games/water-cannon/game.ts:12`. End with
  a "Done when" saying the doc matches the code and `npm run check` passes.
- **No duplicates.** Before filing, check the open issues and skip any doc that
  already has one.
- **Nothing found is a fine result.** Say so, and file nothing.
