# crop_circles

> Reference data library for crop circle formations — structured for use in generative art, shader systems, and AI-assisted creative tools.

## What This Is

This repo is a **data library**, not an application. It contains:

- **`docs/crop-circle-schema.jsonc`** — The canonical schema defining all formation fields, enums, and parameters
- **`docs/crop-circle-visual-language.md`** — Deep reference doc on the visual grammar of crop circles (symmetry types, motif families, flow/layering, famous formations)
- **`formations/`** — Individual JSON files for 17 documented canonical formations, each conforming to the schema
- **`index.json`** — Flat manifest of all formations for quick browsing/filtering
- **`validate.js`** — Node.js script to validate formation files against the schema

## Purpose

This is a context source for:

- **reposcripter** — AI-driven generative art pipeline (primary consumer)
- **Shader Forge / GLSL generation** — formation data drives procedural crop circle shader generation
- **Generative art systems** — schema parameters map directly to shader uniforms and p5.js sketch params

## Formations Included

| ID | Name | Epoch | Complexity | Motif Family |
|----|------|-------|------------|--------------|
| `milk_hill_2001` | Milk Hill Galaxy Spiral | modern | 4 | spiral_galaxy |
| `julia_set_stonehenge_1996` | Julia Set Stonehenge | classic_90s | 3 | spiral_galaxy |
| `triple_julia_avebury_1996` | Triple Julia Set Avebury | classic_90s | 4 | spiral_galaxy |
| `koch_fractal_milk_hill_1997` | Koch Fractal Milk Hill | classic_90s | 4 | circle_mandala |
| `barbury_castle_tetrahedron_1991` | Barbury Castle Tetrahedron | early | 3 | cube_projection |
| `solar_system_longwood_warren_1995` | Solar System Longwood Warren | classic_90s | 3 | solar_system |
| `galaxy_west_stowell_1994` | Galaxy West Stowell | classic_90s | 3 | spiral_galaxy |
| `dna_helix_alton_barnes_1996` | DNA Helix Alton Barnes | classic_90s | 3 | dna_helix |
| `spiderweb_avebury_1994` | Spiderweb Avebury | classic_90s | 3 | vesica_torus |
| `angel_great_shelford_2001` | Angel Great Shelford | modern | 3 | bird_angel |
| `magnetic_fields_avebury_2000` | Magnetic Fields Avebury Trusloe | modern | 4 | magnet_field |
| `silbury_sun_wheel_2004` | Silbury Sun Wheel | modern | 3 | circle_mandala |
| `chilbolton_arecibo_2001` | Chilbolton Arecibo Response | modern | 4 | message_grid |
| `chilbolton_face_2001` | Chilbolton Face | modern | 3 | message_grid |
| `crabwood_alien_disk_2002` | Crabwood Alien Face & Disk | modern | 4 | message_grid |
| `barbury_pi_2008` | Barbury Castle Pi Encoder | modern | 4 | pi_encoder |
| `sunnyside_labyrinth_2015` | Sunnyside Classical Labyrinth | modern | 3 | labyrinth |

## Quick Usage

```js
// Load all formations
const index = require('./index.json');

// Load a specific formation
const milkHill = require('./formations/milk_hill_2001.json');

// Get all complexity-4 formations
const complex = index.formations.filter(f => f.complexity === 4);

// Get all spiral_galaxy formations
const spirals = index.formations.filter(f =>
  f.primary_motif_family === 'spiral_galaxy'
);
```

## Validation

```bash
node validate.js                          # validate all formations
node validate.js milk_hill_2001.json      # validate one formation
```

## Schema

See `docs/crop-circle-schema.jsonc` for the full schema with comments.
Key top-level fields per formation: `id`, `name`, `epoch`, `complexity`, `medium`, `layout`, `style_weights`, `motifs`, `micro_motifs`, `flow`, `encoding`, `medium_render`.

## Part of the Ecosystem

- [`merrypranxter/little_green_men`](https://github.com/merrypranxter/little_green_men) — alien iconography creative coding lab
- [`merrypranxter/raymarching`](https://github.com/merrypranxter/raymarching) — GLSL raymarching workbench
- [`merrypranxter/merrys_visual_bible`](https://github.com/merrypranxter/merrys_visual_bible) — creative/technical reference
