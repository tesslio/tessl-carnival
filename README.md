# Tessl Carnival 🎪

A small browser carnival, and the starter repo for the AI DevCon workshop
**Build your own software factory with context**.

It ships with one game, the **water cannon**, and a midway you walk around: a
sunny isometric fairground with tents, rides and a booth for every game.
You grow your carnival by adding games through your factory: label an issue, and
an agent turns it into a pull request.

## Get it running

You need Node 20.19 or later and git.

```bash
npm ci
npm run dev
```

Open http://localhost:5173, walk up to the water cannon booth and press **E**.
Walk with WASD or the arrow keys, or click where you want to go.

## Commands

| Command         | What it does                         |
| --------------- | ------------------------------------ |
| `npm run dev`   | Run the carnival locally             |
| `npm run check` | Lint, type-check and test everything |
| `npm run build` | Build the site into `dist/`          |
| `npm run test`  | Run the tests once                   |

## How it's built

- `index.html` and `src/main.ts`: the page and the router.
- `src/midway/`: the walkable midway. Every registered game gets a booth along
  the avenue, and empty slots show as "coming soon" until a game fills them.
- `src/carnival/`: the shared base every game uses: the game registry, scores,
  prizes and theme.
- `src/games/<game-id>/`: one folder per game. The water cannon is the pattern
  to copy.

[`AGENTS.md`](AGENTS.md) has the house rules every game follows, and
[`skills/add-carnival-game`](skills/add-carnival-game/SKILL.md) walks an agent
through adding a new one.

## Play it on GitHub Pages

Every merge to `main` deploys the carnival to GitHub Pages, so you can play new
games without pulling them. On a fork, switch Pages on once:

1. Go to **Settings → Pages** in your fork.
2. Under **Build and deployment**, set **Source** to **GitHub Actions**.
3. Re-run the **Deploy to GitHub Pages** workflow, or merge anything to `main`.

Your carnival will be at `https://<your-username>.github.io/tessl-carnival/`.
