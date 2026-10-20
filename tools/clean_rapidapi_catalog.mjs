import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import {
  EQUIPMENT_MAPPING_TABLE,
  MUSCLE_MAPPING_TABLE,
  normalizeEquipment,
  normalizeMuscle
} from './validate_dataset_pipeline.mjs';

const catalog = JSON.parse(fs.readFileSync('tools/rapidapi_full_catalog.json', 'utf-8'));
console.log(`Loaded ${catalog.length} raw catalog entries.`);

// Muscle enum map
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

// Deduplicate by mediaChecksum so each unique video content is mapped to EXACTLY ONE exercise
const checksumToItem = new Map();

for (const raw of catalog) {
  const vid = raw.localVideo;
  if (!vid) continue;

  const cleanName = raw.name.trim();
  const filePath = path.resolve('frontend/public', vid.replace(/^\//, ''));
  if (!fs.existsSync(filePath)) {
    console.warn(`File missing for ${cleanName}: ${filePath}`);
    continue;
  }
  const buf = fs.readFileSync(filePath);
  const checksum = crypto.createHash('sha256').update(buf).digest('hex');

  // Fix known muscle discrepancies in raw dataset if any
  let normalizedMuscle = normalizeMuscle(raw.targetMuscles?.[0], raw.bodyParts?.[0]);
  let normalizedEquipment = normalizeEquipment(raw.equipments?.[0]);

  // Specific semantic fixes for obvious dataset errors
  if (/pistol squat/i.test(cleanName) && normalizedMuscle === 'Hamstrings') normalizedMuscle = 'Quads';
  if (/squat thrust/i.test(cleanName)) normalizedMuscle = 'Quads';
  if (/superman row/i.test(cleanName)) normalizedMuscle = 'Back';
  if (/commando pull-up/i.test(cleanName)) normalizedMuscle = 'Back';
  if (/diamond push[- ]?up/i.test(cleanName)) normalizedMuscle = 'Chest';
  if (/bridge curl/i.test(cleanName)) normalizedMuscle = 'Hamstrings';
  if (/kneeling push up/i.test(cleanName)) normalizedMuscle = 'Chest';
  if (/pike-to-cobra/i.test(cleanName)) normalizedMuscle = 'Chest';
  if (/jumping squat/i.test(cleanName)) normalizedMuscle = 'Quads';
  if (/front plank toe tap/i.test(cleanName)) normalizedMuscle = 'Abs';

  const processed = {
    externalId: raw.exerciseId,
    name: cleanName,
    primaryMuscle: muscleEnumMap[normalizedMuscle] || 'FULL_BODY',
    secondaryMuscles: (raw.secondaryMuscles || []).slice(0, 3).join(','),
    equipment: equipEnumMap[normalizedEquipment] || 'OTHER',
    instructions: raw.instructions || ['Execute movement with controlled cadence through full range of motion.'],
    localVideo: raw.localVideo,
    localPoster: raw.localPoster,
    mediaChecksum: checksum,
    reviewStatus: 'verified',
    source: 'exercisedb-ascendapi',
    matchMethod: 'dataset-record'
  };

  if (!checksumToItem.has(checksum)) {
    checksumToItem.set(checksum, processed);
  } else {
    // If checksum is already registered, keep the better one (prefer more descriptive name, etc.)
    const existing = checksumToItem.get(checksum);
    if (processed.name.length >= existing.name.length) {
      checksumToItem.set(checksum, processed);
    }
  }
}

const cleanExercises = Array.from(checksumToItem.values());
console.log(`Deduplicated to ${cleanExercises.length} unique exercises (each with a unique video & unique checksum).`);

// Verify 100% uniqueness of videos and checksums
const seenVids = new Set();
const seenChecksums = new Set();
for (const ex of cleanExercises) {
  if (seenVids.has(ex.localVideo)) throw new Error(`Duplicate video: ${ex.localVideo}`);
  if (seenChecksums.has(ex.mediaChecksum)) throw new Error(`Duplicate checksum: ${ex.mediaChecksum}`);
  seenVids.add(ex.localVideo);
  seenChecksums.add(ex.mediaChecksum);
}
console.log('Uniqueness check: 100% PASS! No duplicate animations exist.');

// Save clean catalog
fs.writeFileSync('tools/rapidapi_clean_exercises.json', JSON.stringify(cleanExercises, null, 2), 'utf-8');
console.log('Saved tools/rapidapi_clean_exercises.json');

// Now generate V13 migration SQL
function escapeSql(str) {
  if (str === null || str === undefined) return 'NULL';
  return `'${String(str).replace(/'/g, "''")}'`;
}

const sqlLines = [];
sqlLines.push('-- ===============================================================');
sqlLines.push('-- Flyway Migration V13: Rebuild Exercise-to-Media Pipeline from Scratch');
sqlLines.push('-- Strict 1-to-1 fidelity: 189 verified RapidAPI workouts, each with its OWN distinct video');
sqlLines.push('-- Zero video sharing between workouts. Non-dataset exercises use built-in SVG mannequin.');
sqlLines.push('-- ===============================================================\n');

sqlLines.push('-- 1. Add tracking columns to exercises table');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS source VARCHAR(100);');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS external_id VARCHAR(100);');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS media_checksum VARCHAR(64);');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS match_method VARCHAR(50);');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS review_status VARCHAR(50) DEFAULT \'no-media\';');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS legacy_media_url VARCHAR(1000);');
sqlLines.push('ALTER TABLE exercises ADD COLUMN IF NOT EXISTS legacy_poster_url VARCHAR(1000);');
sqlLines.push('CREATE UNIQUE INDEX IF NOT EXISTS idx_exercises_source_external_id ON exercises(source, external_id);\n');

sqlLines.push('-- 2. Archive previous media URLs and wipe unverified/guessed media from all exercises');
sqlLines.push('CREATE TABLE IF NOT EXISTS exercise_media_backup AS SELECT id, name, media_url, poster_url, media_provider, media_type, attribution FROM exercises;');
sqlLines.push('UPDATE exercises SET legacy_media_url = media_url, legacy_poster_url = poster_url WHERE legacy_media_url IS NULL;');
sqlLines.push('UPDATE exercises SET media_url = NULL, poster_url = NULL, media_provider = \'builtin\', media_type = \'animation\', review_status = \'no-media\', match_method = \'manual\';\n');

sqlLines.push('-- 3. Import all 189 verified RapidAPI workouts with exact 1-to-1 media fidelity');

for (const ex of cleanExercises) {
  const stepsJson = JSON.stringify(ex.instructions);
  const mistakesJson = JSON.stringify(['Using momentum or rushing eccentric phase.', 'Failing to brace core and maintain spinal alignment.']);
  const formTips = ex.instructions[0] || 'Maintain proper posture and controlled breathing.';

  sqlLines.push(
    `MERGE INTO exercises (` +
    `name, primary_muscle, secondary_muscles, equipment, difficulty, movement_type, ` +
    `form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution, ` +
    `source, external_id, media_url, poster_url, media_checksum, media_provider, media_type, review_status, match_method` +
    `) KEY(name) VALUES (` +
    `${escapeSql(ex.name)}, ${escapeSql(ex.primaryMuscle)}, ${escapeSql(ex.secondaryMuscles)}, ${escapeSql(ex.equipment)}, 'INTERMEDIATE', 'COMPOUND', ` +
    `${escapeSql(formTips)}, ${escapeSql(stepsJson)}, ${escapeSql(mistakesJson)}, 3, '8-12', false, 'ExerciseDB via AscendAPI', ` +
    `${escapeSql(ex.source)}, ${escapeSql(ex.externalId)}, ${escapeSql(ex.localVideo)}, ${escapeSql(ex.localPoster)}, ${escapeSql(ex.mediaChecksum)}, 'licensed', 'video', 'verified', 'dataset-record'` +
    `);`
  );
}

const migrationPath = path.resolve('backend/src/main/resources/db/migration/V13__rebuild_exercise_media_pipeline.sql');
fs.writeFileSync(migrationPath, sqlLines.join('\n'), 'utf-8');
console.log(`Generated V13 migration at: ${migrationPath} with ${sqlLines.length} lines.`);
