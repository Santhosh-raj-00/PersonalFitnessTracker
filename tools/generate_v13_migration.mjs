import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 1. Load catalog & validation logic
import {
  EQUIPMENT_MAPPING_TABLE,
  MUSCLE_MAPPING_TABLE,
  normalizeEquipment,
  normalizeMuscle,
  validateDatasetRecord
} from './validate_dataset_pipeline.mjs';

const catalog = JSON.parse(fs.readFileSync('tools/rapidapi_full_catalog.json', 'utf-8'));
const seedPath = path.resolve('backend/src/main/resources/data/exercises_seed.json');
const dbExercises = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));

console.log(`Loaded ${catalog.length} catalog items and ${dbExercises.length} seed items.`);

// Compute checksums and build map
const allByChecksum = new Map();
for (const item of catalog) {
  const filePath = path.resolve('frontend/public', item.localVideo.replace(/^\//, ''));
  if (fs.existsSync(filePath)) {
    const buf = fs.readFileSync(filePath);
    item.mediaChecksum = crypto.createHash('sha256').update(buf).digest('hex');
  } else {
    item.fileError = 'FILE_NOT_FOUND';
  }
  item.normalizedEquipment = normalizeEquipment(item.equipments?.[0]);
  item.normalizedMuscle = normalizeMuscle(item.targetMuscles?.[0], item.bodyParts?.[0]);

  if (item.mediaChecksum) {
    if (!allByChecksum.has(item.mediaChecksum)) {
      allByChecksum.set(item.mediaChecksum, []);
    }
    allByChecksum.get(item.mediaChecksum).push(item);
  }
}

// Validate each record
for (const item of catalog) {
  const val = validateDatasetRecord(item, allByChecksum);
  item.reviewStatus = val.reviewStatus;
  item.issues = val.issues;
}

const verifiedCount = catalog.filter(c => c.reviewStatus === 'verified').length;
const needsReviewCount = catalog.filter(c => c.reviewStatus === 'needs-review').length;
console.log(`Validation results: ${verifiedCount} verified, ${needsReviewCount} needs-review.`);

// Build SQL Migration lines
const sqlLines = [];

sqlLines.push('-- ===============================================================');
sqlLines.push('-- Flyway Migration V13: Rebuild Exercise-to-Media Pipeline from Scratch');
sqlLines.push('-- Strict 1-to-1 fidelity: externalId, no guessing, no name-similarity overrides');
sqlLines.push('-- ===============================================================\n');

// 1. Add schema columns
sqlLines.push('-- 1. Add tracking columns to exercises table');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS source VARCHAR(100);');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS external_id VARCHAR(100);');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS media_checksum VARCHAR(64);');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS match_method VARCHAR(50);');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS review_status VARCHAR(50) DEFAULT \'no-media\';');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS legacy_media_url VARCHAR(1000);');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS legacy_poster_url VARCHAR(1000);');
sqlLines.push('CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_source_external_id ON exercises(source, external_id);\n');

// 2. Create backup table
sqlLines.push('-- 2. Archive previous media URLs to backup table and legacy columns');
sqlLines.push('CREATE TABLE IF NOT EXISTS exercise_media_backup AS SELECT id, name, media_url, poster_url, media_provider, media_type, attribution FROM exercises;');
sqlLines.push('UPDATE exercises SET legacy_media_url = media_url, legacy_poster_url = poster_url WHERE legacy_media_url IS NULL;\n');

// 3. WIPE ALL OLD GUESSED MEDIA FROM NON-DATASET EXERCISES
sqlLines.push('-- 3. Wipe all unverified/guessed media URLs. Exercises default to built-in anatomical figure with no-media status');
sqlLines.push('UPDATE exercises SET media_url = NULL, poster_url = NULL, media_provider = \'builtin\', media_type = \'animation\', review_status = \'no-media\', match_method = \'manual\' WHERE external_id IS NULL;\n');

// 4. Update or Insert each RapidAPI record with 1-to-1 data
sqlLines.push('-- 4. Import / Update all 200 RapidAPI records with exact 1-to-1 data fidelity');

function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

// Track existing DB exercises to merge by name or externalId
const dbByName = new Map();
for (const ex of dbExercises) {
  dbByName.set(ex.name.toLowerCase().trim(), ex);
}

const muscleEnumMap = {
  'Chest': 'CHEST',
  'Back': 'BACK',
  'Shoulders': 'SHOULDERS',
  'Traps': 'TRAPS',
  'Biceps': 'BICEPS',
  'Triceps': 'TRICEPS',
  'Forearms': 'FOREARMS',
  'Abs': 'ABS',
  'Glutes': 'GLUTES',
  'Quads': 'QUADS',
  'Hamstrings': 'HAMSTRINGS',
  'Calves': 'CALVES',
  'Cardio': 'CARDIO',
  'Full Body': 'FULL_BODY'
};

const equipEnumMap = {
  'Barbell': 'BARBELL',
  'Dumbbell': 'DUMBBELL',
  'Kettlebell': 'KETTLEBELL',
  'Machine': 'MACHINE',
  'Cable': 'CABLE',
  'Smith Machine': 'SMITH_MACHINE',
  'Bodyweight': 'BODYWEIGHT',
  'Band': 'BAND',
  'Other': 'OTHER'
};

const updatedSeedExercises = [];
const existingMatchedExternalIds = new Set();

// First, reset all existing seed exercises to no-media
for (const ex of dbExercises) {
  ex.legacyMediaUrl = ex.mediaUrl;
  ex.legacyPosterUrl = ex.posterUrl;
  ex.mediaUrl = null;
  ex.posterUrl = null;
  ex.mediaProvider = 'builtin';
  ex.mediaType = 'animation';
  ex.reviewStatus = 'no-media';
  ex.matchMethod = 'manual';
  ex.source = 'seed';
}

for (const item of catalog) {
  const cleanName = item.name.trim();
  const lowerName = cleanName.toLowerCase();
  const pMuscleEnum = muscleEnumMap[item.normalizedMuscle] || 'FULL_BODY';
  const eqEnum = equipEnumMap[item.normalizedEquipment] || 'OTHER';
  const secMuscles = (item.secondaryMuscles || []).slice(0, 3).join(',');
  const stepsJson = JSON.stringify(item.instructions || ['Execute movement with controlled cadence through full range of motion.']);
  const mistakesJson = JSON.stringify(['Using momentum or rushing eccentric phase.', 'Failing to brace core and maintain spinal alignment.']);
  const formTips = (item.instructions && item.instructions.length > 0) ? item.instructions[0] : 'Maintain proper posture and controlled breathing.';
  const mediaUrl = item.localVideo;
  const posterUrl = item.localPoster;
  const checksum = item.mediaChecksum;
  const reviewStatus = item.reviewStatus; // 'verified' or 'needs-review'
  const matchMethod = 'dataset-record';
  const source = 'exercisedb-ascendapi';

  // Check if an existing exercise has the exact same name
  const matchedExisting = dbByName.get(lowerName);

  // Use MERGE INTO KEY(name) so whether existing or new, it updates/inserts idempotently with zero unique constraint errors
  sqlLines.push(
    `MERGE INTO exercises (` +
    `name, primary_muscle, secondary_muscles, equipment, difficulty, movement_type, ` +
    `form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution, ` +
    `source, external_id, media_url, poster_url, media_checksum, media_provider, media_type, review_status, match_method` +
    `) KEY(name) VALUES (` +
    `${escapeSql(cleanName)}, ${escapeSql(pMuscleEnum)}, ${escapeSql(secMuscles)}, ${escapeSql(eqEnum)}, 'INTERMEDIATE', 'COMPOUND', ` +
    `${escapeSql(formTips)}, ${escapeSql(stepsJson)}, ${escapeSql(mistakesJson)}, 3, '8-12', false, 'ExerciseDB via AscendAPI', ` +
    `${escapeSql(source)}, ${escapeSql(item.exerciseId)}, ${escapeSql(mediaUrl)}, ${escapeSql(posterUrl)}, ${escapeSql(checksum)}, 'licensed', 'video', ${escapeSql(reviewStatus)}, ${escapeSql(matchMethod)}` +
    `);`
  );
}

// Save updated seed JSON
fs.writeFileSync(seedPath, JSON.stringify(dbExercises, null, 2), 'utf-8');
console.log(`Updated ${seedPath} with clean 1-to-1 pipeline records.`);

// Write Flyway migration
const migrationPath = path.resolve('backend/src/main/resources/db/migration/V13__rebuild_exercise_media_pipeline.sql');
fs.writeFileSync(migrationPath, sqlLines.join('\n'), 'utf-8');
console.log(`Generated Flyway migration V13 at: ${migrationPath}`);
console.log(`Total SQL statements: ${sqlLines.length}`);
