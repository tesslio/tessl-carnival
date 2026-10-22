# Tessl Carnival: agent guide

A small browser carnival. The midway (`index.html`, `src/main.ts`,
`src/midway/`) is a walkable isometric map with a booth for every game; each
game lives in its own folder under `src/games/`.

## Stack

- TypeScript, Vite and plain HTML canvas. No UI framework.
- Vitest for game logic. No browser tests: they need system packages the cloud
  machine doesn't have.
- Scores live in the browser (local storage) behind `src/carnival/scores.ts`.
- No native dependencies, and nothing that needs `sudo`. `npm ci` is the whole setup.

## Commands

| Command          | What it does                                              |
| ---------------- | --------------------------------------------------------- |
| `npm ci`         | Install dependencies                                      |
| `npm run dev`    | Run the carnival at localhost:5173                        |
| `npm run format` | Format the repo with Prettier, skipping `.prettierignore` |
| `npm run check`  | Lint, check formatting, type-check and test everything    |
| `npm run build`  | Build the site into `dist/`                               |

Run `npm run check` before you finish any change. CI runs the same command.

Every change reaches `main` through a pull request, and CI must pass before it
merges. Nobody pushes to `main` directly.

## Layout

```txt
index.html                the midway page
WORKSHOP.md               the workshop, module by module
docs/midway.jpg           the screenshot at the top of the README
docs/social-preview.jpg   the 1280x640 image for link previews and GitHub's social preview
tessl-factory/skills/     sample skills for maintenance loops
src/
  main.ts                 the router (#/play/<game-id>) and the midway's overlay
  midway/                 the walkable midway map
    world.ts              layout, movement and pathfinding (plain functions)
    world.test.ts
    render.ts             drawing the scenery, booths and people
    palette.ts            the map's scenery colours, built on the theme
    midway.ts             input, camera and the animation loop
  carnival/               shared base every game uses
    registry.ts           the CarnivalGame shape and the registry
    scores.ts             recordScore, bestScore, topScores
    prizes.ts             prize tiers
    theme.ts              colours, fonts and sizes
  games/
    index.ts              every game registers here
    water-cannon/         the finished game, and the pattern to copy
      game.ts
      game.test.ts
      README.md
```

## The midway

The midway is a walkable map, drawn on a 2D canvas, with a booth for every game
in `src/games/index.ts`.

- A new game gets its booth automatically when it registers. Adding a game never
  needs a change in `src/midway/`.
- The text around the map lives in `src/main.ts`: the booth card that opens when
  you walk up to a booth, and the list of booths in the corner. Changes to what
  the midway shows about a game, such as scores, usually go there.
- `src/midway/` is the map itself: layout, movement and drawing. Keep it plain 2D
  canvas so it stays fast on slow laptops.

## House rules

1. **Every game registers on the midway.** A game lives in
   `src/games/<game-id>/`, exports a `CarnivalGame` from `game.ts`, and is added
   to the list in `src/games/index.ts`. The folder name and the game's `id` match.
2. **Every game reports scores through the shared scores module.** Call
   `recordScore(game.id, score)` from `src/carnival` once, when a round ends. No
   game reads or writes local storage itself, or keeps its own high score table.
3. **Every game draws with the carnival's theme.** Colours, fonts and sizes come
   from `theme` and `canvasFont` in `src/carnival/theme.ts`. No hex colours or
   font strings inside a game.
4. **Game logic is testable without a browser.** Keep state changes (scoring,
   moving, hits) in plain exported functions, and test them in `game.test.ts`.
   Only `start` touches the canvas, the DOM or `requestAnimationFrame`.
5. **`start` cleans up after itself.** It returns a function that cancels the
   animation frame and removes every listener it added.
6. **Each game has a README** that says how to play and how scoring works, and
   stays true to the code.
7. **One game per change.** A change to one game stays inside its folder, plus a
   line in `src/games/index.ts` for a new game. Changes to `src/carnival/` are
   their own change.

## Working on an issue

You often work on an issue with nobody around to answer questions.

- **Read the issue's "Done when"** and treat it as the checklist.
- **Stay inside the issue.** If you notice something else wrong along the way,
  such as a stale doc, a weak test or a colour that skips the theme, don't fix
  it: mention it in the pull request so it can get its own issue.
- **If something is unclear,** pick the simplest reading that keeps the house
  rules, and say which reading you picked in the pull request.
- **Leave these alone** unless the issue asks for them: `.github/`, `tessl.json`,
  `.tessl/` and `package-lock.json`.
- **Don't add dependencies.** `npm ci` has to stay quick, and the cloud machine
  can't install system packages.
- **Before you finish,** run `npm run format`, then `npm run check`, and make
  sure every README you touched still matches the code.
- **In the pull request,** say what changed and how to try it, and end with
  `Closes #<issue number>`.

## Skills

- `skills/add-carnival-game/SKILL.md`: how to add a new game to the midway.
- `skills/set-up-your-fork/SKILL.md`: turn on Issues, Actions and GitHub Pages
  in a fork, and deploy the carnival.
- `tessl-factory/skills/`: sample skills for scheduled maintenance loops
  (rule mining, doc gardening, test health). Each one files issues and never
  changes code.

`WORKSHOP.md` walks people through the workshop this repo was built for, module
by module.
