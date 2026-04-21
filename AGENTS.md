# AGENTS.md — Instructions for AI Agents

> Read this before touching anything.

## What This Repo Is

A **structured data library**. Not an app. Not a website. Just JSON formation files, schema docs, and a validator. The primary consumer is reposcripter (AI generative art pipeline). Secondary consumers are GLSL shader generation tools and p5.js sketch generators.

## Rules

### Data format
- All formation files in `formations/` MUST be **strict JSON** (no comments, no trailing commas)
- The schema reference is `docs/crop-circle-schema.jsonc` — JSONC (comments allowed) for human reading only
- Every formation file MUST pass `node validate.js [filename]` before being considered complete
- `index.json` MUST be regenerated any time a formation file is added, removed, or its top-level metadata changes

### File naming
- Formation files: `[slug]_[location]_[year].json` — all lowercase, underscores only
- Slug should be the formation's common name or nickname, not a description
- Examples: `milk_hill_2001.json`, `chilbolton_face_2001.json`, `barbury_pi_2008.json`

### Field rules
- `id` MUST match the filename without `.json`
- `epoch` MUST be one of: `"early"`, `"classic_90s"`, `"modern"`, `"experimental"`
- `complexity` MUST be 1, 2, 3, or 4 (integer, not string)
- `style_weights` values MUST sum to ≤ 3.0 and each be between 0.0 and 1.0
- `symmetry_order` of 0 or 1 = no rotational symmetry (valid for pictograms)
- `motifs` array MUST have at least one entry with `priority: 1`
- `flow.imperfection` MUST be between 0.0 (perfect) and 1.0 (very irregular)

### What NOT to do
- ❌ Do not add application code, HTML, CSS, or any frontend
- ❌ Do not modify `docs/crop-circle-schema.jsonc` without explicit instruction — it's the source of truth
- ❌ Do not add formations without sourcing them from the documented visual record
- ❌ Do not use JSONC (comments) in `formations/` files — strict JSON only
- ❌ Do not change the `validate.js` schema validation logic without testing all 17 existing formations

## When Adding a New Formation

1. Create `formations/[id].json` conforming to the schema
2. Run `node validate.js [id].json` — must pass clean
3. Add entry to `index.json` under `formations` array
4. Increment `index.json` → `meta.formation_count`
5. Update `README.md` formations table

## index.json Structure

Each entry in `index.json` must include:
```json
{
  "id": "string",
  "name": "string",
  "epoch": "string",
  "complexity": 1-4,
  "location": "string",
  "date": "string",
  "primary_motif_family": "string",
  "symmetry_order": number,
  "style_weights": { "sacred_geometry": 0-1, "alien_technical": 0-1, "minimalist": 0-1 }
}
```

## Validator Notes

`validate.js` checks:
- Required fields present
- Enum values valid
- Numeric ranges in bounds
- `id` matches expected format
- `motifs` array has a priority-1 entry

Run with `node validate.js` (all files) or `node validate.js [filename]` (one file).
Requires Node.js 14+. No npm install needed — uses only stdlib.
