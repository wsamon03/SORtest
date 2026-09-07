# Rage Streets

A Streets of Rage-style side-scrolling beat-'em-up built with
[Phaser 3](https://phaser.io/) (loaded via CDN, no build step) and
original placeholder pixel art that's designed to be swapped out for
real art with a simple copy/paste — see
[`docs/ART_PIPELINE.md`](docs/ART_PIPELINE.md).

## Running it

No build step is required — the game is plain ES modules plus Phaser
loaded from a CDN `<script>` tag. Serve the folder statically and open
it in a browser:

```
npx http-server -p 8080 .
# or: python3 -m http.server 8080
```

Then visit `http://localhost:8080/index.html`.

## Controls

| Action        | Keys              |
| ------------- | ----------------- |
| Move          | Arrow keys / WASD  |
| Attack combo  | J or Z            |
| Jump (hop)    | K or X            |
| Pause         | P or Esc          |

## Regenerating placeholder art

```
npm install
npm run generate:sprites
```

This (re)draws all 5 sample spritesheets (2 playable characters, 3
enemy types) and their `manifest.json` animation manifests under
`assets/sprites/`. See [`docs/ART_PIPELINE.md`](docs/ART_PIPELINE.md)
for the full manifest schema and exactly how to replace this art with
your own — every character/enemy is just a spritesheet PNG + a JSON
file, swappable without touching any game code.

## Project layout

- `index.html` — entry point (Phaser CDN script + `src/main.js`)
- `src/` — game code (scenes, entities, systems, input)
- `assets/sprites/` — per-character/enemy spritesheets + manifests,
  registered in `assets/sprites/registry.json`
- `tools/` — the offline placeholder-art generator (build-time only,
  never loaded by the browser)
- `docs/ART_PIPELINE.md` — the art-swap workflow and manifest schema
