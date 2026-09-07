# Art pipeline: how to swap sprites and animations

Every playable character and enemy is just a folder with two files:

```
assets/sprites/characters/<id>/spritesheet.png
assets/sprites/characters/<id>/manifest.json

assets/sprites/enemies/<id>/spritesheet.png
assets/sprites/enemies/<id>/manifest.json
```

Nothing in `src/` ever contains a character or enemy's id as a literal
string in a rendering/animation/combat code path — everything is looked
up generically through `assets/sprites/registry.json` and each entity's
own `manifest.json`. That's what makes the following two workflows
possible with **zero code changes**.

## Replacing the art for an existing character/enemy

1. Draw your replacement spritesheet as a grid PNG: one **row per
   animation**, frames laid out left-to-right starting at column 0 of
   that row. Keep the same `frameWidth`/`frameHeight`/`columns`/`rows`
   as the existing `manifest.json` (or change those fields in the JSON
   to match your new sheet — see the schema below).
2. Overwrite `spritesheet.png` in that entity's folder with your new
   image (same filename, unless you also update `manifest.json`'s
   `"spritesheet"` field).
3. Only right-facing frames are ever drawn — the game flips the sprite
   horizontally (`setFlipX`) for left-facing movement, so you never need
   to draw a mirrored set.
4. Reload the page. That's it — no source file needs to change.

You can regenerate the original placeholder art at any time with:

```
npm run generate:sprites
```

## Adding a brand-new character or enemy

1. Create a new folder under `assets/sprites/characters/<id>/` (playable)
   or `assets/sprites/enemies/<id>/` (enemy) with a `spritesheet.png` and
   `manifest.json` following the schema below.
2. Add one entry to `assets/sprites/registry.json`:
   ```json
   { "id": "newguy", "path": "assets/sprites/characters/newguy" }
   ```
3. For a playable character, that's enough — `TitleScene` builds its
   character-select list directly from `registry.json`. For an enemy,
   reference its `id` in a wave's `enemies` list in
   `src/scenes/StageScene.js` (`WAVES`) and register its class in the
   `ENEMY_CLASSES` map there (or, for the 3 provided types, reuse
   `Grunt`/`KnifeEnemy`/`Brute` with different `id`s and tuning by
   subclassing `src/entities/Enemy.js` the same way they do).

No changes are needed in `AnimationFactory.js`, `Entity.js`,
`CombatSystem.js`, or any other engine file.

## `manifest.json` schema

```json
{
  "id": "rook",
  "displayName": "Rook",
  "spritesheet": "spritesheet.png",
  "frameWidth": 64,
  "frameHeight": 64,
  "columns": 8,
  "rows": 6,
  "defaultAnimation": "idle",
  "animations": {
    "idle":    { "row": 0, "frameCount": 4, "frameRate": 6,  "loop": true },
    "walk":    { "row": 1, "frameCount": 6, "frameRate": 10, "loop": true },
    "attack1": { "row": 2, "frameCount": 4, "frameRate": 14, "loop": false, "hitFrame": 2 },
    "attack2": { "row": 3, "frameCount": 4, "frameRate": 14, "loop": false, "hitFrame": 2 },
    "hurt":    { "row": 4, "frameCount": 2, "frameRate": 8,  "loop": false },
    "ko":      { "row": 5, "frameCount": 4, "frameRate": 6,  "loop": false, "holdLastFrame": true }
  },
  "hurtbox": { "width": 20, "height": 40, "offsetX": 0, "offsetY": 10 },
  "attacks": {
    "attack1": { "width": 26, "height": 20, "offsetX": 24, "offsetY": 2,  "damage": 8,  "knockback": 120 },
    "attack2": { "width": 30, "height": 20, "offsetX": 26, "offsetY": 16, "damage": 14, "knockback": 200 }
  },
  "stats": { "maxHealth": 100, "walkSpeed": 150 }
}
```

### Field reference

- **`frameWidth` / `frameHeight`** — pixel size of one grid cell. Must
  match the actual spritesheet image (`sheet width = frameWidth * columns`,
  `sheet height = frameHeight * rows`).
- **`columns` / `rows`** — grid dimensions of the spritesheet.
- **`animations.<name>`**:
  - `row` — which grid row this animation's frames live on (0-indexed).
    The global Phaser frame index for row `r`, column `c` is
    `r * columns + c`.
  - `frameCount` — how many frames, read left-to-right from column 0 of
    that row. Can be less than `columns` — unused trailing columns in
    that row are simply left blank/transparent in the PNG.
  - `frameRate` — playback speed in frames per second.
  - `loop` — `true` for continuously-looping animations (idle, walk),
    `false` for one-shot animations (attacks, hurt, ko).
  - `hitFrame` *(attacks only)* — the 0-indexed frame within this
    animation where the hit actually lands; `CombatSystem` checks for
    hits starting at this frame.
  - `holdLastFrame` *(ko only, informational)* — the last frame is a
    resting/downed pose; Phaser naturally holds it since the animation
    doesn't loop.
  - Required animation keys: `idle`, `walk`, `attack1`, `hurt`, `ko`.
    `attack2` is optional — a character/enemy without it just repeats
    `attack1` on the second hit of a combo.
- **`hurtbox`** — a single rectangle, in **right-facing** coordinates,
  centered on the sprite: `offsetX`/`offsetY` shift the rect's center
  relative to the sprite's center. `offsetX` is mirrored automatically
  when the sprite is facing left; `offsetY` is not (it's vertical).
- **`attacks.<animName>`** — the hitbox rectangle and gameplay numbers
  for that specific attack animation, using the same offset convention
  as `hurtbox`. `damage` and `knockback` are applied directly to
  whatever it overlaps — this is what lets `CombatSystem.js` stay 100%
  generic with no per-character branching.
- **`stats`** — `maxHealth` and `walkSpeed` (pixels/second).

## Generating placeholder art

`tools/generate_sprites.mjs` (run via `npm run generate:sprites`)
procedurally draws all 5 sample spritesheets using a shared rectangle
rig (`tools/lib/humanoid-rig.mjs`) and per-entity color palettes
(`tools/lib/palettes.mjs`), writing PNGs via `pngjs`
(`tools/lib/pixel-canvas.mjs`). It's re-runnable and idempotent, and
writes each `manifest.json` from the exact same frame-count table used
to draw the art, so art and manifest can never drift out of sync. Adjust
the `ENTITIES`/`STATS`/`PALETTES` tables in `tools/` if you want to
regenerate different-looking placeholders before replacing them with
real art.
