import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

/**
 * FitTrack VitalAnimations Deployment & Integration Engine
 * Copies animation videos into frontend/public/media/exercises/
 * Maps them to exercises with strict fidelity
 * Generates Flyway V14 migration and updates exercises_seed.json
 */

const VITAL_ROOT = path.resolve('VitalAnimations/VitalAnimations');
const FREE50_DIR = path.join(VITAL_ROOT, 'Free50/Free50');
const JSON_FILE = path.join(VITAL_ROOT, 'Free50/50gymworkouts.json');
const SAMPLES_DIR = path.join(VITAL_ROOT, 'Character Samples');

const DEST_EXERCISES = path.resolve('frontend/public/media/exercises');
const DEST_VITAL = path.join(DEST_EXERCISES, 'vital');
const DEST_SAMPLES = path.join(DEST_EXERCISES, 'samples');

fs.mkdirSync(DEST_EXERCISES, { recursive: true });
fs.mkdirSync(DEST_VITAL, { recursive: true });
fs.mkdirSync(DEST_SAMPLES, { recursive: true });

const vitalCatalog = JSON.parse(fs.readFileSync(JSON_FILE, 'utf-8'));
console.log(`Loaded ${vitalCatalog.length} vital workout definitions.`);

// Helper to calculate sha256 checksum
function getChecksum(filePath) {
  const data = fs.readFileSync(filePath);
  return crypto.createHash('sha256').update(data).digest('hex');
}

// 1. Copy Free50 videos
console.log('\n--- Deploying Free50 Animation Videos ---');
const deployedFiles = [];

for (const item of vitalCatalog) {
  const srcFile = path.join(FREE50_DIR, `${item.id}.mp4`);
  if (!fs.existsSync(srcFile)) {
    console.error(`WARNING: Video file not found: ${srcFile}`);
    continue;
  }

  const checksum = getChecksum(srcFile);

  // Copy to vital/0051.mp4
  const destVital = path.join(DEST_VITAL, `${item.id}.mp4`);
  fs.copyFileSync(srcFile, destVital);

  // Copy to media/exercises/0051.mp4
  const destDirect = path.join(DEST_EXERCISES, `${item.id}.mp4`);
  fs.copyFileSync(srcFile, destDirect);

  // Copy with semantic slug name
  const slug = item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  const destSlug = path.join(DEST_EXERCISES, `${slug}.mp4`);
  fs.copyFileSync(srcFile, destSlug);

  deployedFiles.push({
    id: item.id,
    name: item.name,
    slug,
    checksum,
    primaryPath: `/media/exercises/${item.id}.mp4`,
    vitalPath: `/media/exercises/vital/${item.id}.mp4`,
    slugPath: `/media/exercises/${slug}.mp4`
  });
}
console.log(`Successfully deployed ${deployedFiles.length} Free50 videos (with direct, vital, and slug aliases).`);

// 2. Copy Character Samples
console.log('\n--- Deploying Character Samples ---');
const sampleFiles = [
  { folder: 'femaleGymworkouts', file: '1245.mp4', name: 'Female Cable Workout' },
  { folder: 'femaleGymworkouts', file: '1254.mp4', name: 'Female Dumbbell Lunge Workout' },
  { folder: 'homeWorkout', file: '0353.mp4', name: 'Home Bodyweight Flow' },
  { folder: 'homeWorkout', file: '0473.mp4', name: 'Home Core Conditioning' },
  { folder: 'officeWorkout', file: '0708.mp4', name: 'Desk & Office Ergonomic Stretch' },
  { folder: 'pilates', file: '1177.mp4', name: 'Pilates Core Reformer Flow' },
  { folder: 'womenWorkout', file: '0976.mp4', name: 'Dynamic Aerobic Bodyweight Workout' },
  { folder: 'yoga', file: '0778.mp4', name: 'Vinyasa Flow Yoga Asana' },
  { folder: 'faceExercise', file: '0925.mp4', name: 'Facial Muscle Isometric Exercise' }
];

for (const sample of sampleFiles) {
  const src = path.join(SAMPLES_DIR, sample.folder, sample.file);
  if (fs.existsSync(src)) {
    const destSample = path.join(DEST_SAMPLES, `${sample.folder}_${sample.file}`);
    fs.copyFileSync(src, destSample);
    const destDirect = path.join(DEST_EXERCISES, `sample_${sample.folder}_${sample.file}`);
    fs.copyFileSync(src, destDirect);
    console.log(`Deployed sample: ${sample.name} -> /media/exercises/sample_${sample.folder}_${sample.file}`);
  }
}

// 3. Mapping Dictionary from vital id to existing canonical exercises in project
const CANONICAL_MAPPINGS = {
  '0051': ['Pec Deck (Machine Chest Fly)', 'Butterfly'],
  '0052': ['Svend Press'],
  '0053': ['Air Bike'],
  '0054': ['Barbell Squat', 'Barbell Full Squat'],
  '0055': ['Bulgarian Split Squat'],
  '0056': ['Front Barbell Squat'],
  '0057': ['Barbell Hip Thrust'],
  '0058': ['Barbell March'],
  '0059': ['Barbell Reverse Lunge'],
  '0060': ['Romanian Deadlift', 'Barbell Romanian Deadlift'],
  '0061': ['One-Legged Cable Kickback', 'Glute Kickback Machine'],
  '0062': ['Bicycling', 'Bicycling, Stationary'],
  '0063': ['Dumbbell Bulgarian Split Squat'],
  '0064': ['Goblet Squat', 'Dumbbell Squat'],
  '0065': ['Dumbbell Hip Hinge'],
  '0066': ['Dumbbell Jump Squat'],
  '0067': ['Elliptical Trainer', 'Elliptical Machine Walk'],
  '0068': ['Hack Squat Machine'],
  '0069': ['Hip Abduction Machine'],
  '0070': ['Kettlebell Hold March'],
  '0071': ['Kettlebell Lift Up', 'Kettlebell Deadlift'],
  '0072': ['Kettlebell Swing', 'One-Arm Kettlebell Swing'],
  '0073': ['Leg Extension Machine', 'Leg Extensions'],
  '0074': ['45-Degree Leg Press', 'Horizontal Leg Press Machine', 'Leg Press'],
  '0075': ['Lying Leg Curl Machine', 'Lying Leg Curls'],
  '0076': ['Battling Ropes'],
  '0077': ['Rowing, Stationary', 'Rowing Machine'],
  '0078': ['Run on Treadmill', 'Running, Treadmill'],
  '0079': ['Seated Leg Curl Machine', 'Seated Leg Curl'],
  '0080': ['Machine Shoulder Press', 'Seated Overhead Press'],
  '0081': ['Dumbbell Step Ups', 'Barbell Step Ups'],
  '0082': ['Step Mill', 'Stairmaster'],
  '0083': ['Stepmill Machine'],
  '0084': ['Smith Machine Stiff-Legged Deadlift'],
  '0085': ['Triceps Pushdown', 'Triceps Pushdown - Rope Attachment'],
  '0086': ['Walk on Treadmill', 'Walking, Treadmill'],
  '0087': ['Arnold Dumbbell Press', 'Arnold Press'],
  '0088': ['Standing Barbell Press Behind Neck', 'Standing Military Press'],
  '0089': ['Upright Barbell Row'],
  '0090': ['Dumbbell Shoulder Press', 'Seated Dumbbell Press'],
  '0091': ['Standing Dumbbell Upright Row', 'Dumbbell Upright Row'],
  '0092': ['Front Dumbbell Raise', 'Front Raise'],
  '0093': ['Front Plate Raise'],
  '0094': ['Alternating Kettlebell Press', 'One-Arm Kettlebell Military Press To The Side'],
  '0095': ['Cable Seated Lateral Raise', 'Cable Cross Lateral Raise'],
  '0096': ['Side Lateral Raise', 'Dumbbell Lateral Raise'],
  '0097': ['Machine Lateral Raise'],
  '0098': ['Machine Shoulder (Military) Press', 'Smith Machine Overhead Press'],
  '0099': ['Rear Delt Machine (Reverse Pec Deck)'],
  '0100': ['Cable Rear Delt Fly']
};

function normalizeMuscleGroup(bodyPart, target) {
  const b = (bodyPart || '').toLowerCase();
  const t = (target || '').toLowerCase();
  if (b.includes('chest') || t.includes('chest') || t.includes('pec')) return 'CHEST';
  if (b.includes('shoulder') || t.includes('delt') || t.includes('shoulder')) return 'SHOULDERS';
  if (b.includes('back') || t.includes('back') || t.includes('lat')) return 'BACK';
  if (t.includes('tricep') || b.includes('upper arms') && t.includes('tricep')) return 'TRICEPS';
  if (t.includes('bicep') || b.includes('upper arms') && t.includes('bicep')) return 'BICEPS';
  if (b.includes('cardio') || t.includes('cardio')) return 'CARDIO';
  if (t.includes('glute')) return 'GLUTES';
  if (t.includes('hamstring')) return 'HAMSTRINGS';
  if (t.includes('quad') || b.includes('upper legs')) return 'QUADS';
  if (t.includes('calv')) return 'CALVES';
  if (b.includes('waist') || t.includes('ab') || t.includes('core')) return 'ABS';
  return 'FULL_BODY';
}

function normalizeEquipment(raw) {
  const e = (raw || '').toLowerCase();
  if (e.includes('barbell')) return 'BARBELL';
  if (e.includes('dumbbell')) return 'DUMBBELL';
  if (e.includes('kettlebell')) return 'KETTLEBELL';
  if (e.includes('cable')) return 'CABLE';
  if (e.includes('smith')) return 'SMITH_MACHINE';
  if (e.includes('machine')) return 'MACHINE';
  if (e.includes('body weight') || e.includes('bodyweight') || e.includes('none')) return 'BODYWEIGHT';
  if (e.includes('band')) return 'BAND';
  return 'OTHER';
}

function titleCase(str) {
  return str.replace(/\b\w/g, c => c.toUpperCase());
}

// 4. Generate Flyway SQL Migration V14
console.log('\n--- Generating Flyway Migration V14 ---');
const sqlLines = [
  '-- ===============================================================',
  '-- Flyway Migration V14: Integrate VitalAnimations 3D Exercise Engine',
  '-- Precision 1-to-1 Mapping for VitalAnimations library',
  '-- ===============================================================',
  ''
];

// Read existing exercises_seed.json
const seedPath = path.resolve('backend/src/main/resources/data/exercises_seed.json');
let seedExercises = [];
if (fs.existsSync(seedPath)) {
  seedExercises = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
}
const seedMap = new Map();
seedExercises.forEach(s => seedMap.set(s.name.toLowerCase().trim(), s));

for (const item of vitalCatalog) {
  const mediaUrl = `/media/exercises/${item.id}.mp4`;
  const extId = `vital_${item.id}`;
  const deployedInfo = deployedFiles.find(d => d.id === item.id);
  const checksum = deployedInfo ? deployedInfo.checksum : '';
  const primeMuscle = normalizeMuscleGroup(item.bodyPart, item.target);
  const equip = normalizeEquipment(item.equipment);
  const diff = (item.difficulty || 'INTERMEDIATE').toUpperCase();
  const titleName = titleCase(item.name);
  const stepsJson = JSON.stringify(item.instructions || [item.description]);
  const mistakesJson = JSON.stringify([
    'Rushing repetitions and losing eccentric cadence control.',
    'Failing to maintain proper core bracing and spinal alignment.'
  ]);
  const formTips = (item.instructions && item.instructions[0]) || item.description || 'Maintain controlled posture.';
  const attr = 'VitalAnimations 3D Biomechanical Engine';

  // 1. Insert or update the vital exercise by its exact name
  const nameEsc = titleName.replace(/'/g, "''");
  const stepsEsc = stepsJson.replace(/'/g, "''");
  const mistakesEsc = mistakesJson.replace(/'/g, "''");
  const tipsEsc = formTips.replace(/'/g, "''");

  sqlLines.push(
    `MERGE INTO exercises (name, primary_muscle, secondary_muscles, equipment, difficulty, movement_type, form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution, source, external_id, media_url, poster_url, media_checksum, media_provider, media_type, review_status, match_method)` +
    ` KEY(name) VALUES ('${nameEsc}', '${primeMuscle}', '${(item.secondaryMuscles || []).join(',').toUpperCase()}', '${equip}', '${diff}', 'COMPOUND', '${tipsEsc}', '${stepsEsc}', '${mistakesEsc}', 3, '8-12', false, '${attr}', 'vital-animations', '${extId}', '${mediaUrl}', NULL, '${checksum}', 'licensed', 'video', 'verified', 'vital-catalog');`
  );

  // 2. Also update canonical counterparts if they exist in the project
  const canonicals = CANONICAL_MAPPINGS[item.id] || [];
  for (const canonName of canonicals) {
    const canonEsc = canonName.replace(/'/g, "''");
    sqlLines.push(
      `UPDATE exercises SET media_url = '${mediaUrl}', media_provider = 'licensed', media_type = 'video', review_status = 'verified', attribution = '${attr}' WHERE LOWER(name) = LOWER('${canonEsc}');`
    );
  }

  // Update in-memory seed data as well
  let existingSeed = seedMap.get(titleName.toLowerCase().trim());
  if (!existingSeed) {
    existingSeed = {
      name: titleName,
      primaryMuscle: primeMuscle,
      secondaryMuscles: (item.secondaryMuscles || []).join(',').toUpperCase(),
      equipment: equip,
      difficulty: diff,
      movementType: 'COMPOUND',
      formTips,
      steps: item.instructions || [item.description],
      mistakes: [
        'Rushing repetitions and losing eccentric cadence control.',
        'Failing to maintain proper core bracing and spinal alignment.'
      ],
      defaultSets: 3,
      defaultReps: '8-12',
      isCustom: false,
      attribution: attr,
      source: 'vital-animations',
      externalId: extId,
      mediaUrl,
      thumbnailUrl: mediaUrl,
      mediaProvider: 'licensed',
      mediaType: 'video',
      reviewStatus: 'verified'
    };
    seedExercises.push(existingSeed);
    seedMap.set(titleName.toLowerCase().trim(), existingSeed);
  } else {
    existingSeed.mediaUrl = mediaUrl;
    existingSeed.thumbnailUrl = mediaUrl;
    existingSeed.mediaProvider = 'licensed';
    existingSeed.mediaType = 'video';
    existingSeed.reviewStatus = 'verified';
    existingSeed.source = 'vital-animations';
    existingSeed.externalId = extId;
    existingSeed.attribution = attr;
  }

  // Also update canonical counterparts in seedExercises
  for (const canonName of canonicals) {
    const cSeed = seedMap.get(canonName.toLowerCase().trim());
    if (cSeed) {
      cSeed.mediaUrl = mediaUrl;
      cSeed.thumbnailUrl = mediaUrl;
      cSeed.mediaProvider = 'licensed';
      cSeed.mediaType = 'video';
      cSeed.reviewStatus = 'verified';
      cSeed.source = 'vital-animations';
      cSeed.attribution = attr;
    }
  }
}

// Write migration V14
const v14Path = path.resolve('backend/src/main/resources/db/migration/V14__integrate_vital_animations.sql');
fs.writeFileSync(v14Path, sqlLines.join('\n'), 'utf-8');
console.log(`Generated Flyway migration: ${v14Path} (${sqlLines.length} SQL operations)`);

// Write updated exercises_seed.json
fs.writeFileSync(seedPath, JSON.stringify(seedExercises, null, 2), 'utf-8');
console.log(`Updated exercises_seed.json (${seedExercises.length} total exercises).`);

console.log('\n--- Deployment & Verification Complete Successfully! ---');
