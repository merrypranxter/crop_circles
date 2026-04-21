#!/usr/bin/env node
// validate.js
// Validates formation JSON files in formations/ against the crop circle schema.
// Usage:
//   node validate.js                    → validate all files in formations/
//   node validate.js milk_hill_2001     → validate one (with or without .json)
//   node validate.js formations/milk_hill_2001.json  → validate by path

const fs = require('fs');
const path = require('path');

// ── Schema constraints ──────────────────────────────────────────────────────

const VALID_EPOCHS = ['early', 'classic_90s', 'modern', 'experimental'];
const VALID_COMPLEXITY = [1, 2, 3, 4];
const VALID_CROP_TYPES = ['wheat', 'barley', 'canola', 'maize', 'oats', 'grass', 'snow', 'other'];
const VALID_MOTIF_FAMILIES = [
  'circle_simple', 'circle_group', 'circle_mandala', 'spiral_galaxy',
  'labyrinth', 'yin_yang', 'cube_projection', 'hypercube_cross',
  'metatrons_cube', 'vesica_torus', 'dna_helix', 'insectogram',
  'serpent_chain', 'bird_angel', 'tree_axis', 'chakra_column',
  'magnet_field', 'solar_system', 'message_grid', 'pi_encoder',
  'calendar_diagram', 'symbolic_icon'
];
const VALID_MICRO_MOTIF_TYPES = [
  'mini_circle', 'horn', 'figure8', 'checkerboard', 'weave_ring', 'star_cluster'
];
const VALID_GLOBAL_FLOWS = ['radial', 'spiral', 'tangential', 'custom_field'];
const VALID_GRID_MODES = ['none', 'rectangular', 'polar'];
const VALID_SYMBOL_TYPES = ['pentagram', 'triquetra', 'tree', 'bird', 'goddess', 'eye', 'chakra', 'other'];
const VALID_EMBEDDING_MODES = ['center', 'ring', 'satellite'];

// ── Validator ───────────────────────────────────────────────────────────────

function validate(filePath) {
  const errors = [];
  const warnings = [];

  // Load file
  let raw;
  try {
    raw = fs.readFileSync(filePath, 'utf8');
  } catch (e) {
    return { ok: false, errors: [`Cannot read file: ${e.message}`], warnings: [] };
  }

  // Parse JSON
  let f;
  try {
    f = JSON.parse(raw);
  } catch (e) {
    return { ok: false, errors: [`Invalid JSON: ${e.message}`], warnings: [] };
  }

  const name = path.basename(filePath, '.json');

  // id matches filename
  if (!f.id) {
    errors.push('Missing required field: id');
  } else if (f.id !== name) {
    errors.push(`id "${f.id}" does not match filename "${name}"`);
  }

  // Required string fields
  for (const field of ['name', 'epoch']) {
    if (!f[field]) errors.push(`Missing required field: ${field}`);
  }

  // epoch enum
  if (f.epoch && !VALID_EPOCHS.includes(f.epoch)) {
    errors.push(`Invalid epoch "${f.epoch}". Must be one of: ${VALID_EPOCHS.join(', ')}`);
  }

  // complexity
  if (f.complexity === undefined) {
    errors.push('Missing required field: complexity');
  } else if (!VALID_COMPLEXITY.includes(f.complexity)) {
    errors.push(`Invalid complexity ${f.complexity}. Must be 1, 2, 3, or 4`);
  }

  // medium
  if (!f.medium) {
    errors.push('Missing required field: medium');
  } else {
    if (!f.medium.crop_type) errors.push('Missing medium.crop_type');
    else if (!VALID_CROP_TYPES.includes(f.medium.crop_type)) {
      errors.push(`Invalid medium.crop_type "${f.medium.crop_type}"`);
    }
    if (typeof f.medium.ghost_layers !== 'number') errors.push('medium.ghost_layers must be a number');
  }

  // layout
  if (!f.layout) {
    errors.push('Missing required field: layout');
  } else {
    if (typeof f.layout.footprint_radius !== 'number') errors.push('layout.footprint_radius must be a number');
    if (typeof f.layout.symmetry_order !== 'number') errors.push('layout.symmetry_order must be a number');
    if (typeof f.layout.sector_count !== 'number') errors.push('layout.sector_count must be a number');
    if (typeof f.layout.ring_count !== 'number') errors.push('layout.ring_count must be a number');
    if (!Array.isArray(f.layout.center_offset) || f.layout.center_offset.length !== 2) {
      errors.push('layout.center_offset must be [number, number]');
    }
  }

  // style_weights
  if (!f.style_weights) {
    errors.push('Missing required field: style_weights');
  } else {
    for (const key of ['sacred_geometry', 'alien_technical', 'minimalist']) {
      const v = f.style_weights[key];
      if (typeof v !== 'number') errors.push(`style_weights.${key} must be a number`);
      else if (v < 0 || v > 1) errors.push(`style_weights.${key} must be between 0.0 and 1.0, got ${v}`);
    }
    const sum = (f.style_weights.sacred_geometry || 0) +
                (f.style_weights.alien_technical || 0) +
                (f.style_weights.minimalist || 0);
    if (sum > 3.0) errors.push(`style_weights sum ${sum.toFixed(2)} exceeds 3.0`);
  }

  // motifs
  if (!Array.isArray(f.motifs)) {
    errors.push('Missing required field: motifs (must be array)');
  } else {
    if (f.motifs.length === 0) warnings.push('motifs array is empty');
    const hasPriority1 = f.motifs.some(m => m.priority === 1);
    if (!hasPriority1) errors.push('motifs must contain at least one entry with priority: 1');
    f.motifs.forEach((m, i) => {
      if (!m.family) errors.push(`motifs[${i}] missing family`);
      else if (!VALID_MOTIF_FAMILIES.includes(m.family)) {
        errors.push(`motifs[${i}] invalid family "${m.family}"`);
      }
      if (!m.id) errors.push(`motifs[${i}] missing id`);
      if (typeof m.priority !== 'number') errors.push(`motifs[${i}] priority must be a number`);
    });
  }

  // micro_motifs
  if (!Array.isArray(f.micro_motifs)) {
    errors.push('micro_motifs must be an array (can be empty [])');
  } else {
    f.micro_motifs.forEach((m, i) => {
      if (!m.type) errors.push(`micro_motifs[${i}] missing type`);
      else if (!VALID_MICRO_MOTIF_TYPES.includes(m.type)) {
        errors.push(`micro_motifs[${i}] invalid type "${m.type}"`);
      }
    });
  }

  // flow
  if (!f.flow) {
    errors.push('Missing required field: flow');
  } else {
    if (!VALID_GLOBAL_FLOWS.includes(f.flow.global_flow)) {
      errors.push(`Invalid flow.global_flow "${f.flow.global_flow}". Must be: ${VALID_GLOBAL_FLOWS.join(', ')}`);
    }
    if (typeof f.flow.imperfection !== 'number') {
      errors.push('flow.imperfection must be a number');
    } else if (f.flow.imperfection < 0 || f.flow.imperfection > 1) {
      errors.push(`flow.imperfection ${f.flow.imperfection} must be between 0.0 and 1.0`);
    }
    if (!Array.isArray(f.flow.ring_flows)) errors.push('flow.ring_flows must be an array');
  }

  // encoding
  if (!f.encoding) {
    errors.push('Missing required field: encoding');
  } else {
    if (!VALID_GRID_MODES.includes(f.encoding.grid_mode)) {
      errors.push(`Invalid encoding.grid_mode "${f.encoding.grid_mode}"`);
    }
    if (!Array.isArray(f.encoding.bitmap_resolution) || f.encoding.bitmap_resolution.length !== 2) {
      errors.push('encoding.bitmap_resolution must be [number, number]');
    }
    if (!f.encoding.pi_encoder || typeof f.encoding.pi_encoder.enabled !== 'boolean') {
      errors.push('encoding.pi_encoder.enabled must be boolean');
    }
  }

  // medium_render
  if (!f.medium_render) {
    errors.push('Missing required field: medium_render');
  } else {
    for (const key of ['edge_softness', 'contrast', 'specular_variation']) {
      const v = f.medium_render[key];
      if (typeof v !== 'number') errors.push(`medium_render.${key} must be a number`);
      else if (v < 0 || v > 1) errors.push(`medium_render.${key} ${v} must be between 0.0 and 1.0`);
    }
  }

  return {
    ok: errors.length === 0,
    errors,
    warnings
  };
}

// ── CLI runner ───────────────────────────────────────────────────────────────

function resolveFilePaths(arg) {
  if (!arg) {
    // No arg: validate all files in formations/
    const dir = path.join(__dirname, 'formations');
    if (!fs.existsSync(dir)) {
      console.error('formations/ directory not found');
      process.exit(1);
    }
    return fs.readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => path.join(dir, f));
  }

  // Single file arg
  let resolved = arg;
  if (!resolved.endsWith('.json')) resolved += '.json';
  if (!path.isAbsolute(resolved)) {
    // Try formations/ first, then relative
    const inFormations = path.join(__dirname, 'formations', resolved);
    const relative = path.join(__dirname, resolved);
    if (fs.existsSync(inFormations)) return [inFormations];
    if (fs.existsSync(relative)) return [relative];
    console.error(`File not found: ${arg}`);
    process.exit(1);
  }
  return [resolved];
}

const arg = process.argv[2];
const files = resolveFilePaths(arg);

let passCount = 0;
let failCount = 0;

for (const filePath of files) {
  const shortName = path.basename(filePath);
  const result = validate(filePath);

  if (result.ok) {
    console.log(`✅ ${shortName}`);
    if (result.warnings.length > 0) {
      result.warnings.forEach(w => console.log(`   ⚠️  ${w}`));
    }
    passCount++;
  } else {
    console.log(`❌ ${shortName}`);
    result.errors.forEach(e => console.log(`   ERROR: ${e}`));
    result.warnings.forEach(w => console.log(`   WARN:  ${w}`));
    failCount++;
  }
}

console.log(`\n${passCount} passed, ${failCount} failed (${files.length} total)`);
if (failCount > 0) process.exit(1);
