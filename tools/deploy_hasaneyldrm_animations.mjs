import fs from 'fs';
import path from 'path';

/**
 * FitTrack Dataset Animation Integration Engine
 * Source: https://github.com/hasaneyldrm/exercises-dataset
 * Precision non-random mapping for missing exercise animations.
 */

const datasetPath = path.resolve('tools/dataset-repo/data/exercises.json');
const seedPath = path.resolve('backend/src/main/resources/data/exercises_seed.json');
const v15Path = path.resolve('backend/src/main/resources/db/migration/V15__integrate_exercises_dataset_animations.sql');
const destExercises = path.resolve('frontend/public/media/exercises');
const destPosters = path.resolve('frontend/public/media/posters');

fs.mkdirSync(destExercises, { recursive: true });
fs.mkdirSync(destPosters, { recursive: true });

const dataset = JSON.parse(fs.readFileSync(datasetPath, 'utf8'));

// Extract all existing exercise names from migrations V1..V14
const migrationDir = path.resolve('backend/src/main/resources/db/migration');
const migrationFiles = fs.readdirSync(migrationDir).filter(f => f.startsWith('V') && !f.startsWith('V15'));
const existingDbNames = new Map(); // lowerName -> exactDbName
for (const f of migrationFiles) {
  const content = fs.readFileSync(path.join(migrationDir, f), 'utf8');
  const regex = /VALUES\s*\(\s*'([^']+)'/gi;
  let m;
  while ((m = regex.exec(content)) !== null) {
    existingDbNames.set(m[1].toLowerCase().trim(), m[1]);
  }
}
console.log(`Found ${existingDbNames.size} existing exercise names in database migrations V1-V14.`);

// Read base seed
const seed = JSON.parse(fs.readFileSync(seedPath, 'utf8'));
console.log(`Loaded ${dataset.length} dataset records and ${seed.length} seed exercises.`);

function clean(s) {
  return (s || '').toLowerCase()
    .replace(/[\(\)\[\],_\-\/]/g, ' ')
    .replace(/['’]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function titleCase(str) {
  return (str || '')
    .toLowerCase()
    .split(' ')
    .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1) : '')
    .join(' ');
}

function normMuscle(m) {
  const s = (m || '').toUpperCase();
  if (s.includes('CHEST') || s.includes('PEC')) return 'CHEST';
  if (s.includes('SHOULDER') || s.includes('DELT')) return 'SHOULDERS';
  if (s.includes('BACK') || s.includes('LAT') || s.includes('TRAP') || s.includes('LOWER BACK') || s.includes('MIDDLE BACK') || s.includes('UPPER BACK')) return 'BACK';
  if (s.includes('BICEP')) return 'BICEPS';
  if (s.includes('TRICEP')) return 'TRICEPS';
  if (s.includes('QUAD')) return 'QUADS';
  if (s.includes('HAMSTRING')) return 'HAMSTRINGS';
  if (s.includes('GLUTE')) return 'GLUTES';
  if (s.includes('CALV')) return 'CALVES';
  if (s.includes('AB') || s.includes('CORE') || s.includes('WAIST')) return 'ABS';
  if (s.includes('FOREARM') || s.includes('ARM')) return 'FOREARMS';
  if (s.includes('CARDIO')) return 'CARDIO';
  return 'OTHER';
}

function datasetMuscle(d) {
  const b = (d.body_part || '').toLowerCase();
  const t = (d.target || '').toLowerCase();
  const c = (d.category || '').toLowerCase();
  if (b.includes('chest') || t.includes('chest') || t.includes('pec')) return 'CHEST';
  if (b.includes('shoulder') || t.includes('delt')) return 'SHOULDERS';
  if (b.includes('back') || t.includes('lat') || t.includes('spine') || t.includes('trap')) return 'BACK';
  if (t.includes('bicep')) return 'BICEPS';
  if (t.includes('tricep')) return 'TRICEPS';
  if (t.includes('glute')) return 'GLUTES';
  if (t.includes('hamstring')) return 'HAMSTRINGS';
  if (t.includes('quad') || b.includes('upper legs') && (t.includes('quad') || !t.includes('hamstring') && !t.includes('glute'))) return 'QUADS';
  if (t.includes('calv') || b.includes('lower legs')) return 'CALVES';
  if (b.includes('waist') || t.includes('ab')) return 'ABS';
  if (b.includes('lower arms') || t.includes('forearm')) return 'FOREARMS';
  if (b.includes('cardio') || c.includes('cardio')) return 'CARDIO';
  return 'OTHER';
}

function normEquip(e) {
  const s = (e || '').toUpperCase();
  if (s.includes('BARBELL') || s.includes('OLYMPIC')) return 'BARBELL';
  if (s.includes('DUMBBELL')) return 'DUMBBELL';
  if (s.includes('KETTLEBELL')) return 'KETTLEBELL';
  if (s.includes('CABLE')) return 'CABLE';
  if (s.includes('SMITH')) return 'SMITH_MACHINE';
  if (s.includes('MACHINE') || s.includes('LEVER') || s.includes('SLED')) return 'MACHINE';
  if (s.includes('BODY') || s.includes('NONE')) return 'BODYWEIGHT';
  if (s.includes('BAND')) return 'BAND';
  return 'OTHER';
}

function datasetEquip(d) {
  const e = (d.equipment || '').toLowerCase();
  if (e.includes('barbell') || e.includes('olympic')) return 'BARBELL';
  if (e.includes('dumbbell')) return 'DUMBBELL';
  if (e.includes('kettlebell')) return 'KETTLEBELL';
  if (e.includes('cable')) return 'CABLE';
  if (e.includes('smith')) return 'SMITH_MACHINE';
  if (e.includes('lever') || e.includes('sled') || e.includes('machine')) return 'MACHINE';
  if (e.includes('body weight') || e.includes('none')) return 'BODYWEIGHT';
  if (e.includes('band')) return 'BAND';
  return 'OTHER';
}

// Map dataset items by clean name
const datasetByClean = new Map();
for (const d of dataset) {
  const c = clean(d.name);
  if (!datasetByClean.has(c)) {
    datasetByClean.set(c, d);
  }
}

// Curated high-fidelity gym aliases
const manualAliases = {
  'machine chest press': 'lever chest press',
  'incline machine chest press': 'lever incline chest press',
  'decline machine chest press': 'lever decline chest press',
  'plate loaded lat pulldown machine': 'reverse grip machine lat pulldown',
  'seated machine row': 'lever seated row',
  'assisted pull up machine': 'assisted pull up',
  'assisted dip machine': 'assisted chest dip kneeling',
  'back extension machine': 'lever back extension',
  'smith machine squat': 'smith chair squat',
  'standing leg curl machine': 'standing single leg curl',
  'hip adduction machine': 'lever seated hip adduction',
  'calf press on leg press machine': 'sled calf press on leg press',
  'preacher curl machine': 'dumbbell preacher curl',
  'triceps extension machine': 'lever triceps extension',
  'triceps dip machine': 'assisted triceps dip kneeling',
  'incline dumbbell press': 'dumbbell incline bench press',
  'decline dumbbell press': 'dumbbell decline bench press',
  'dumbbell bench press': 'dumbbell bench press',
  'flat dumbbell bench press': 'dumbbell bench press',
  'incline barbell bench press': 'barbell incline bench press',
  'decline barbell bench press': 'barbell decline bench press',
  'cable seated row': 'cable seated row',
  'seated cable rows': 'cable seated row',
  'lat pulldown': 'cable lat pulldown full range of motion',
  'cable lat pulldown': 'cable lat pulldown full range of motion',
  'triceps pushdown': 'cable pushdown',
  'cable triceps pushdown': 'cable pushdown',
  'ez bar curl': 'ez barbell curl',
  'ez bar preacher curl': 'ez barbell preacher curl',
  'ez bar skullcrusher': 'ez barbell lying triceps extension skull crusher',
  'standing dumbbell lateral raise': 'dumbbell lateral raise',
  'lateral raise': 'dumbbell lateral raise',
  'dumbbell side lateral raise': 'dumbbell lateral raise',
  'dumbbell front raise': 'dumbbell front raise',
  'standing dumbbell front raise': 'dumbbell front raise',
  'dumbbell rear delt fly': 'dumbbell rear lateral raise',
  'standing calf raises': 'bodyweight standing calf raise',
  'standing dumbbell calf raise': 'dumbbell standing calf raise',
  'seated dumbbell calf raise': 'dumbbell seated calf raise',
  'romanian deadlift': 'barbell romanian deadlift',
  'barbell romanian deadlift': 'barbell romanian deadlift',
  'dumbbell romanian deadlift': 'dumbbell romanian deadlift',
  'bulgarian split squat': 'dumbbell single leg split squat',
  'dumbbell bulgarian split squat': 'dumbbell single leg split squat',
  'standing cable woodchop': 'cable twist',
  'cable crunch': 'cable kneeling crunch',
  'face pull': 'cable rear delt fly',
  'cable face pull': 'cable rear delt fly',
  'hanging leg raise': 'hanging leg raise',
  'parallel bars dip': 'chest dip',
  'chin up': 'chin-up',
  'chin ups': 'chin-up',
  'pullups': 'pull-up',
  'pull ups': 'pull-up',
  'pushups': 'push-up',
  'push ups': 'push-up',
  'dips': 'chest dip',
  'overhead press': 'barbell standing overhead press',
  'military press': 'barbell standing overhead press',
  'barbell overhead press': 'barbell standing overhead press',
  'seated dumbbell shoulder press': 'dumbbell seated shoulder press',
  'dumbbell shoulder press': 'dumbbell seated shoulder press',
  'incline dumbbell curl': 'dumbbell incline curl',
  'hammer curls': 'dumbbell hammer curl',
  'dumbbell hammer curl': 'dumbbell hammer curl',
  'concentration curl': 'dumbbell concentration curl',
  'concentration curls': 'dumbbell concentration curl',
  'cable bicep curl': 'cable curl',
  'bicep cable curl': 'cable curl',
  't bar row': 't-bar row',
  'cable face pulls': 'cable rear delt fly',
  'standing calf raise': 'bodyweight standing calf raise',
  'seated calf raise': 'lever seated calf raise'
};

const sqlStatements = [
  '-- ==========================================================================',
  '-- Flyway Migration V15: Integrate Open Exercise Animations from hasaneyldrm dataset',
  '-- Precision non-random mapping for missing exercise animations',
  '-- ==========================================================================',
  ''
];

const seedByName = new Map();
seed.forEach(s => seedByName.set(s.name.toLowerCase().trim(), s));

// Track used (source, external_id) combinations to prevent any unique index collisions
const usedExternalIds = new Set();

function getUniqueExternalId(baseId) {
  let id = baseId;
  let counter = 1;
  while (usedExternalIds.has(id)) {
    id = `${baseId}_${counter++}`;
  }
  usedExternalIds.add(id);
  return id;
}

let matchedCount = 0;
const matchedDatasetIds = new Set();

// 1. MATCH EXISTING EXERCISES WHERE ANIMATION IS MISSING
for (let i = 0; i < seed.length; i++) {
  const s = seed[i];
  if (s.mediaUrl) continue; // Skip if already has animation

  const sClean = clean(s.name);
  let matchedItem = null;
  let matchRule = '';

  // Rule 1: Manual Alias
  if (manualAliases[sClean]) {
    const aliasKey = clean(manualAliases[sClean]);
    if (datasetByClean.has(aliasKey)) {
      matchedItem = datasetByClean.get(aliasKey);
      matchRule = 'alias';
    }
  }

  // Rule 2: Exact clean name
  if (!matchedItem && datasetByClean.has(sClean)) {
    matchedItem = datasetByClean.get(sClean);
    matchRule = 'exact';
  }

  // Rule 3: Equipment prefix
  if (!matchedItem) {
    const equip = normEquip(s.equipment);
    const prefixes = [];
    if (equip === 'DUMBBELL') prefixes.push('dumbbell ');
    if (equip === 'BARBELL') prefixes.push('barbell ', 'olympic barbell ', 'ez barbell ');
    if (equip === 'CABLE') prefixes.push('cable ');
    if (equip === 'BODYWEIGHT') prefixes.push('bodyweight ');
    if (equip === 'SMITH_MACHINE') prefixes.push('smith ');
    if (equip === 'MACHINE') prefixes.push('lever ', 'machine ');

    for (const p of prefixes) {
      if (datasetByClean.has(p + sClean)) {
        matchedItem = datasetByClean.get(p + sClean);
        matchRule = 'equip-prefix';
        break;
      }
    }
  }

  // Rule 4: Singular forms
  if (!matchedItem) {
    let sing = sClean
      .replace(/\bcurls\b/g, 'curl')
      .replace(/\braises\b/g, 'raise')
      .replace(/\bpresses\b/g, 'press')
      .replace(/\bcrunches\b/g, 'crunch')
      .replace(/\bshrugs\b/g, 'shrug')
      .replace(/\bpushups\b/g, 'push up')
      .replace(/\bpullups\b/g, 'pull up')
      .replace(/\bsquats\b/g, 'squat');
    if (datasetByClean.has(sing)) {
      matchedItem = datasetByClean.get(sing);
      matchRule = 'singular';
    } else {
      const equip = normEquip(s.equipment);
      const prefixes = [];
      if (equip === 'DUMBBELL') prefixes.push('dumbbell ');
      if (equip === 'BARBELL') prefixes.push('barbell ');
      if (equip === 'CABLE') prefixes.push('cable ');
      if (equip === 'BODYWEIGHT') prefixes.push('bodyweight ');
      if (equip === 'MACHINE') prefixes.push('lever ');

      for (const p of prefixes) {
        if (datasetByClean.has(p + sing)) {
          matchedItem = datasetByClean.get(p + sing);
          matchRule = 'equip-singular';
          break;
        }
      }
    }
  }

  // Rule 5: Position variation with strict muscle validation
  if (!matchedItem) {
    const noPosition = sClean.replace(/\b(seated|standing|lying|incline|decline)\s+/g, '');
    if (noPosition !== sClean && datasetByClean.has(noPosition)) {
      const candidate = datasetByClean.get(noPosition);
      if (normMuscle(s.primaryMuscle) === datasetMuscle(candidate)) {
        matchedItem = candidate;
        matchRule = 'position-variant';
      }
    }
  }

  if (matchedItem) {
    // Muscle group validation
    const seedM = normMuscle(s.primaryMuscle);
    const candM = datasetMuscle(matchedItem);
    const isCompatible = (seedM === candM) || 
      (seedM === 'OTHER' || candM === 'OTHER') ||
      (seedM === 'BACK' && candM === 'SHOULDERS') ||
      (seedM === 'SHOULDERS' && candM === 'BACK');

    if (!isCompatible) continue;

    const gifName = path.basename(matchedItem.gif_url);
    const posterName = path.basename(matchedItem.image);
    const mediaUrl = `/media/exercises/${gifName}`;
    const posterUrl = `/media/posters/${posterName}`;
    const extId = getUniqueExternalId(`hasaneyldrm_${matchedItem.id}`);
    const attr = 'Exercise dataset by hasaneyldrm (LogPress open dataset)';

    // Update in-memory seed object
    s.mediaUrl = mediaUrl;
    s.thumbnailUrl = posterUrl;
    s.posterUrl = posterUrl;
    s.mediaProvider = 'licensed';
    s.mediaType = 'image';
    s.reviewStatus = 'verified';
    s.source = 'exercises-dataset';
    s.externalId = extId;
    s.attribution = attr;

    // Add SQL update statement
    const escName = s.name.replace(/'/g, "''");
    sqlStatements.push(
      `UPDATE exercises SET media_url = '${mediaUrl}', poster_url = '${posterUrl}', media_provider = 'licensed', media_type = 'image', review_status = 'verified', source = 'exercises-dataset', external_id = '${extId}', attribution = '${attr.replace(/'/g, "''")}' WHERE LOWER(name) = LOWER('${escName}') AND (media_url IS NULL OR media_url = '');`
    );

    matchedCount++;
    matchedDatasetIds.add(matchedItem.id);
  }
}

console.log(`Matched and assigned animations to ${matchedCount} existing missing exercises.`);

// 2. ENRICH LIBRARY WITH REMAINING DATASET EXERCISES WITH VERIFIED ANIMATIONS
let newExercisesCount = 0;
for (const item of dataset) {
  // If this dataset item was already mapped, skip creating duplicate
  if (matchedDatasetIds.has(item.id)) continue;

  const titleName = titleCase(item.name);
  const lowerName = titleName.toLowerCase().trim();

  // If this exercise exists in database or seed, update it if missing media, but do not insert duplicate
  if (existingDbNames.has(lowerName) || seedByName.has(lowerName)) {
    const existingName = existingDbNames.get(lowerName) || (seedByName.get(lowerName) && seedByName.get(lowerName).name);
    if (existingName) {
      const gifName = path.basename(item.gif_url);
      const posterName = path.basename(item.image);
      const mediaUrl = `/media/exercises/${gifName}`;
      const posterUrl = `/media/posters/${posterName}`;
      const extId = getUniqueExternalId(`hasaneyldrm_${item.id}`);
      const attr = 'Exercise dataset by hasaneyldrm (LogPress open dataset)';

      const escName = existingName.replace(/'/g, "''");
      sqlStatements.push(
        `UPDATE exercises SET media_url = '${mediaUrl}', poster_url = '${posterUrl}', media_provider = 'licensed', media_type = 'image', review_status = 'verified', source = 'exercises-dataset', external_id = '${extId}', attribution = '${attr.replace(/'/g, "''")}' WHERE LOWER(name) = LOWER('${escName}') AND (media_url IS NULL OR media_url = '');`
      );

      const s = seedByName.get(lowerName);
      if (s && !s.mediaUrl) {
        s.mediaUrl = mediaUrl;
        s.thumbnailUrl = posterUrl;
        s.posterUrl = posterUrl;
        s.mediaProvider = 'licensed';
        s.mediaType = 'image';
        s.reviewStatus = 'verified';
        s.source = 'exercises-dataset';
        s.externalId = extId;
        s.attribution = attr;
      }
    }
    continue;
  }

  const primeMuscle = datasetMuscle(item);
  const equip = datasetEquip(item);
  const diff = 'INTERMEDIATE';
  const gifName = path.basename(item.gif_url);
  const posterName = path.basename(item.image);
  const mediaUrl = `/media/exercises/${gifName}`;
  const posterUrl = `/media/posters/${posterName}`;
  const extId = getUniqueExternalId(`hasaneyldrm_${item.id}`);
  const attr = 'Exercise dataset by hasaneyldrm (LogPress open dataset)';

  const steps = (item.instruction_steps && item.instruction_steps.en) || 
    (item.instructions && item.instructions.en ? [item.instructions.en] : ['Perform the exercise with controlled tempo and full range of motion.']);
  const mistakes = [
    'Rushing repetitions without controlled cadence.',
    'Losing proper core bracing and spinal alignment.'
  ];
  const formTips = steps[0] || 'Maintain controlled posture and tempo.';

  const newExercise = {
    name: titleName,
    primaryMuscle: primeMuscle,
    secondaryMuscles: (item.secondary_muscles || []).map(m => m.toUpperCase()).join(','),
    equipment: equip,
    difficulty: diff,
    movementType: 'COMPOUND',
    formTips,
    steps,
    mistakes,
    defaultSets: 3,
    defaultReps: '8-12',
    isCustom: false,
    attribution: attr,
    source: 'exercises-dataset',
    externalId: extId,
    mediaUrl,
    thumbnailUrl: posterUrl,
    posterUrl,
    mediaProvider: 'licensed',
    mediaType: 'image',
    reviewStatus: 'verified'
  };

  seed.push(newExercise);
  seedByName.set(lowerName, newExercise);
  existingDbNames.set(lowerName, titleName);

  // Generate SQL MERGE statement
  const nameEsc = titleName.replace(/'/g, "''");
  const tipsEsc = formTips.replace(/'/g, "''");
  const stepsEsc = JSON.stringify(steps).replace(/'/g, "''");
  const mistakesEsc = JSON.stringify(mistakes).replace(/'/g, "''");
  const secMuscles = (item.secondary_muscles || []).map(m => m.toUpperCase()).join(',');

  sqlStatements.push(
    `MERGE INTO exercises (name, primary_muscle, secondary_muscles, equipment, difficulty, movement_type, form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution, source, external_id, media_url, poster_url, media_provider, media_type, review_status, match_method)` +
    ` KEY(name) VALUES ('${nameEsc}', '${primeMuscle}', '${secMuscles}', '${equip}', '${diff}', 'COMPOUND', '${tipsEsc}', '${stepsEsc}', '${mistakesEsc}', 3, '8-12', false, '${attr.replace(/'/g, "''")}', 'exercises-dataset', '${extId}', '${mediaUrl}', '${posterUrl}', 'licensed', 'image', 'verified', 'dataset-record');`
  );

  newExercisesCount++;
}

console.log(`Added ${newExercisesCount} new verified exercises with animations.`);
console.log(`Total exercises now: ${seed.length}.`);

// Write updated exercises_seed.json
fs.writeFileSync(seedPath, JSON.stringify(seed, null, 2), 'utf8');
console.log(`Saved updated seed file: ${seedPath}`);

// Write Flyway V15 migration
fs.writeFileSync(v15Path, sqlStatements.join('\n'), 'utf8');
console.log(`Saved Flyway V15 migration: ${v15Path} (${sqlStatements.length} operations)`);

console.log('\n--- Deployment finished successfully! ---');
