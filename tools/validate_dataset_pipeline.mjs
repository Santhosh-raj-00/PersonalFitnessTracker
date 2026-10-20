import fs from 'fs';
import path from 'path';
import crypto from 'crypto';

// 1. Load dataset records
const catalogPath = path.resolve('tools/rapidapi_full_catalog.json');
const catalog = JSON.parse(fs.readFileSync(catalogPath, 'utf-8'));

// 2. Normalization Mappings
export const EQUIPMENT_MAPPING_TABLE = [
  { raw: 'BARBELL', normalized: 'Barbell', targetEnum: 'BARBELL' },
  { raw: 'DUMBBELL', normalized: 'Dumbbell', targetEnum: 'DUMBBELL' },
  { raw: 'KETTLEBELL', normalized: 'Kettlebell', targetEnum: 'KETTLEBELL' },
  { raw: 'LEVERAGE MACHINE', normalized: 'Machine', targetEnum: 'MACHINE' },
  { raw: 'MACHINE', normalized: 'Machine', targetEnum: 'MACHINE' },
  { raw: 'CABLE', normalized: 'Cable', targetEnum: 'CABLE' },
  { raw: 'SMITH MACHINE', normalized: 'Smith Machine', targetEnum: 'SMITH_MACHINE' },
  { raw: 'SMITH_MACHINE', normalized: 'Smith Machine', targetEnum: 'SMITH_MACHINE' },
  { raw: 'BODY WEIGHT', normalized: 'Bodyweight', targetEnum: 'BODYWEIGHT' },
  { raw: 'BODYWEIGHT', normalized: 'Bodyweight', targetEnum: 'BODYWEIGHT' },
  { raw: 'BAND', normalized: 'Band', targetEnum: 'BAND' },
  { raw: 'RESISTANCE BAND', normalized: 'Band', targetEnum: 'BAND' },
  { raw: 'ROPE', normalized: 'Other', targetEnum: 'OTHER' },
  { raw: 'TIRE', normalized: 'Other', targetEnum: 'OTHER' },
  { raw: 'SLED', normalized: 'Other', targetEnum: 'OTHER' },
  { raw: 'OTHER', normalized: 'Other', targetEnum: 'OTHER' }
];

export const MUSCLE_MAPPING_TABLE = [
  // Pectorals -> Chest
  { raw: 'CHEST', type: 'bodyPart', normalized: 'Chest', targetEnum: 'CHEST' },
  { raw: 'PECTORALIS MAJOR STERNAL HEAD', type: 'targetMuscle', normalized: 'Chest', targetEnum: 'CHEST' },
  { raw: 'PECTORALIS MAJOR CLAVICULAR HEAD', type: 'targetMuscle', normalized: 'Chest', targetEnum: 'CHEST' },
  { raw: 'SERRATUS ANTERIOR', type: 'targetMuscle', normalized: 'Chest', targetEnum: 'CHEST' },
  { raw: 'SERRATUS ANTE', type: 'targetMuscle', normalized: 'Chest', targetEnum: 'CHEST' },

  // Back
  { raw: 'BACK', type: 'bodyPart', normalized: 'Back', targetEnum: 'BACK' },
  { raw: 'LATISSIMUS DORSI', type: 'targetMuscle', normalized: 'Back', targetEnum: 'BACK' },
  { raw: 'TERES MAJOR', type: 'targetMuscle', normalized: 'Back', targetEnum: 'BACK' },
  { raw: 'TERES MINOR', type: 'targetMuscle', normalized: 'Back', targetEnum: 'BACK' },
  { raw: 'INFRASPINATUS', type: 'targetMuscle', normalized: 'Back', targetEnum: 'BACK' },
  { raw: 'ERECTOR SPINAE', type: 'targetMuscle', normalized: 'Back', targetEnum: 'BACK' },

  // Shoulders
  { raw: 'SHOULDERS', type: 'bodyPart', normalized: 'Shoulders', targetEnum: 'SHOULDERS' },
  { raw: 'ANTERIOR DELTOID', type: 'targetMuscle', normalized: 'Shoulders', targetEnum: 'SHOULDERS' },
  { raw: 'LATERAL DELTOID', type: 'targetMuscle', normalized: 'Shoulders', targetEnum: 'SHOULDERS' },
  { raw: 'POSTERIOR DELTOID', type: 'targetMuscle', normalized: 'Shoulders', targetEnum: 'SHOULDERS' },

  // Traps / Neck
  { raw: 'NECK', type: 'bodyPart', normalized: 'Traps', targetEnum: 'TRAPS' },
  { raw: 'TRAPEZIUS UPPER FIBERS', type: 'targetMuscle', normalized: 'Traps', targetEnum: 'TRAPS' },
  { raw: 'TRAPEZIUS MIDDLE FIBERS', type: 'targetMuscle', normalized: 'Traps', targetEnum: 'TRAPS' },
  { raw: 'TRAPEZIUS LOWER FIBERS', type: 'targetMuscle', normalized: 'Traps', targetEnum: 'TRAPS' },
  { raw: 'LEVATOR SCAPULAE', type: 'targetMuscle', normalized: 'Traps', targetEnum: 'TRAPS' },
  { raw: 'STERNOCLEIDOMASTOID', type: 'targetMuscle', normalized: 'Traps', targetEnum: 'TRAPS' },
  { raw: 'SPLENIUS', type: 'targetMuscle', normalized: 'Traps', targetEnum: 'TRAPS' },

  // Arms
  { raw: 'BICEPS', type: 'bodyPart', normalized: 'Biceps', targetEnum: 'BICEPS' },
  { raw: 'BICEPS BRACHII', type: 'targetMuscle', normalized: 'Biceps', targetEnum: 'BICEPS' },
  { raw: 'BRACHIALIS', type: 'targetMuscle', normalized: 'Biceps', targetEnum: 'BICEPS' },
  { raw: 'TRICEPS', type: 'bodyPart', normalized: 'Triceps', targetEnum: 'TRICEPS' },
  { raw: 'TRICEPS BRACHII', type: 'targetMuscle', normalized: 'Triceps', targetEnum: 'TRICEPS' },
  { raw: 'FOREARMS', type: 'bodyPart', normalized: 'Forearms', targetEnum: 'FOREARMS' },
  { raw: 'BRACHIORADIALIS', type: 'targetMuscle', normalized: 'Forearms', targetEnum: 'FOREARMS' },
  { raw: 'WRIST FLEXORS', type: 'targetMuscle', normalized: 'Forearms', targetEnum: 'FOREARMS' },
  { raw: 'WRIST EXTENSORS', type: 'targetMuscle', normalized: 'Forearms', targetEnum: 'FOREARMS' },

  // Core / Abs
  { raw: 'WAIST', type: 'bodyPart', normalized: 'Abs', targetEnum: 'ABS' },
  { raw: 'RECTUS ABDOMINIS', type: 'targetMuscle', normalized: 'Abs', targetEnum: 'ABS' },
  { raw: 'OBLIQUES', type: 'targetMuscle', normalized: 'Abs', targetEnum: 'ABS' },
  { raw: 'TRANSVERSUS ABDOMINIS', type: 'targetMuscle', normalized: 'Abs', targetEnum: 'ABS' },

  // Lower Body
  { raw: 'HIPS', type: 'bodyPart', normalized: 'Glutes', targetEnum: 'GLUTES' },
  { raw: 'GLUTEUS MAXIMUS', type: 'targetMuscle', normalized: 'Glutes', targetEnum: 'GLUTES' },
  { raw: 'GLUTEUS MEDIUS', type: 'targetMuscle', normalized: 'Glutes', targetEnum: 'GLUTES' },
  { raw: 'DEEP HIP EXTERNAL ROTATORS', type: 'targetMuscle', normalized: 'Glutes', targetEnum: 'GLUTES' },
  { raw: 'TENSOR FASCIAE LATAE', type: 'targetMuscle', normalized: 'Glutes', targetEnum: 'GLUTES' },
  { raw: 'ILIOPSOAS', type: 'targetMuscle', normalized: 'Glutes', targetEnum: 'GLUTES' },
  { raw: 'PECTINEUS', type: 'targetMuscle', normalized: 'Glutes', targetEnum: 'GLUTES' },

  { raw: 'QUADRICEPS', type: 'bodyPart', normalized: 'Quads', targetEnum: 'QUADS' },
  { raw: 'THIGHS', type: 'bodyPart', normalized: 'Quads', targetEnum: 'QUADS' },
  { raw: 'SARTORIUS', type: 'targetMuscle', normalized: 'Quads', targetEnum: 'QUADS' },
  { raw: 'ADDUCTOR LONGUS', type: 'targetMuscle', normalized: 'Quads', targetEnum: 'QUADS' },
  { raw: 'ADDUCTOR MAGNUS', type: 'targetMuscle', normalized: 'Quads', targetEnum: 'QUADS' },
  { raw: 'ADDUCTOR BREVIS', type: 'targetMuscle', normalized: 'Quads', targetEnum: 'QUADS' },
  { raw: 'GRACILIS', type: 'targetMuscle', normalized: 'Quads', targetEnum: 'QUADS' },

  { raw: 'HAMSTRINGS', type: 'bodyPart', normalized: 'Hamstrings', targetEnum: 'HAMSTRINGS' },
  { raw: 'HAMSTRINGS', type: 'targetMuscle', normalized: 'Hamstrings', targetEnum: 'HAMSTRINGS' },
  { raw: 'CALVES', type: 'bodyPart', normalized: 'Calves', targetEnum: 'CALVES' },
  { raw: 'GASTROCNEMIUS', type: 'targetMuscle', normalized: 'Calves', targetEnum: 'CALVES' },
  { raw: 'SOLEUS', type: 'targetMuscle', normalized: 'Calves', targetEnum: 'CALVES' },
  { raw: 'TIBIALIS ANTERIOR', type: 'targetMuscle', normalized: 'Calves', targetEnum: 'CALVES' },

  // Full Body / Cardio
  { raw: 'FULL BODY', type: 'bodyPart', normalized: 'Full Body', targetEnum: 'FULL_BODY' },
  { raw: 'CARDIO', type: 'bodyPart', normalized: 'Cardio', targetEnum: 'CARDIO' }
];

const eqMap = new Map(EQUIPMENT_MAPPING_TABLE.map(e => [e.raw, e.normalized]));
const muscleTargetMap = new Map(MUSCLE_MAPPING_TABLE.filter(m => m.type === 'targetMuscle').map(m => [m.raw, m.normalized]));
const muscleBodyPartMap = new Map(MUSCLE_MAPPING_TABLE.filter(m => m.type === 'bodyPart').map(m => [m.raw, m.normalized]));

export function normalizeEquipment(raw) {
  if (!raw) return 'Other';
  return eqMap.get(raw.trim().toUpperCase()) || 'Other';
}

export function normalizeMuscle(target, bodyPart) {
  if (target && muscleTargetMap.has(target.trim().toUpperCase())) {
    return muscleTargetMap.get(target.trim().toUpperCase());
  }
  if (bodyPart && muscleBodyPartMap.has(bodyPart.trim().toUpperCase())) {
    return muscleBodyPartMap.get(bodyPart.trim().toUpperCase());
  }
  return 'Full Body';
}

// 3. Automated Validation Engine
export function validateDatasetRecord(record, allRecordsByChecksum) {
  const issues = [];
  const nameLower = record.name.toLowerCase().trim();

  // Rule 3.1: Duplicate media check (shared checksum)
  const checksum = record.mediaChecksum;
  if (!checksum) {
    issues.push({ code: 'MEDIA_MISSING', message: 'Media file does not exist or has zero bytes.' });
  } else {
    const sharedWith = allRecordsByChecksum.get(checksum) || [];
    if (sharedWith.length > 1) {
      const otherNames = sharedWith.filter(r => r.exerciseId !== record.exerciseId).map(r => `"${r.name.trim()}" (${r.exerciseId})`);
      issues.push({
        code: 'DUPLICATE_MEDIA_FILE',
        message: `Media file SHA-256 (${checksum.slice(0, 10)}...) is shared by ${sharedWith.length} exercises: ${otherNames.join(', ')}`
      });
    }
  }

  // Rule 3.2: Media playable check
  if (record.fileError) {
    issues.push({ code: 'FILE_ERROR', message: `Media file error: ${record.fileError}` });
  }

  // Rule 3.3: Equipment consistency
  const eq = record.normalizedEquipment;
  if (/\bdumbbells?\b|\bdb\b/.test(nameLower) && eq !== 'Dumbbell') {
    issues.push({ code: 'EQUIPMENT_CONFLICT', message: `Name contains "dumbbell" but record equipment is "${eq}".` });
  }
  if (/\bbarbells?\b|\bbb\b/.test(nameLower) && eq !== 'Barbell') {
    issues.push({ code: 'EQUIPMENT_CONFLICT', message: `Name contains "barbell" but record equipment is "${eq}".` });
  }
  if (/\bkettlebells?\b|\bkb\b/.test(nameLower) && eq !== 'Kettlebell') {
    issues.push({ code: 'EQUIPMENT_CONFLICT', message: `Name contains "kettlebell" but record equipment is "${eq}".` });
  }
  if (/\bcables?\b/.test(nameLower) && eq !== 'Cable') {
    issues.push({ code: 'EQUIPMENT_CONFLICT', message: `Name contains "cable" but record equipment is "${eq}".` });
  }
  if (/\bmachines?\b|\bleverage machine\b/.test(nameLower) && eq !== 'Machine') {
    issues.push({ code: 'EQUIPMENT_CONFLICT', message: `Name contains "machine" but record equipment is "${eq}".` });
  }
  if (/\bsmith\b/.test(nameLower) && eq !== 'Smith Machine') {
    issues.push({ code: 'EQUIPMENT_CONFLICT', message: `Name contains "smith" but record equipment is "${eq}".` });
  }
  if (/\bbands?\b|\bresistance band\b/.test(nameLower) && eq !== 'Band') {
    issues.push({ code: 'EQUIPMENT_CONFLICT', message: `Name contains "band" but record equipment is "${eq}".` });
  }
  if (/\bbodyweight\b|\bbody weight\b/.test(nameLower) && eq !== 'Bodyweight') {
    issues.push({ code: 'EQUIPMENT_CONFLICT', message: `Name contains "bodyweight" but record equipment is "${eq}".` });
  }

  // Rule 3.4: Name and muscle consistency
  const mus = record.normalizedMuscle;
  if (/\bcurls?\b/.test(nameLower) && !['Biceps', 'Forearms', 'Hamstrings'].includes(mus)) {
    // Note: leg curl is hamstrings, biceps curl is biceps/forearms
    if (/\bleg curl\b|\bhamstring curl\b/.test(nameLower)) {
      if (mus !== 'Hamstrings') issues.push({ code: 'MUSCLE_CONFLICT', message: `Name indicates Leg Curl but muscle is "${mus}".` });
    } else if (!['Biceps', 'Forearms'].includes(mus)) {
      issues.push({ code: 'MUSCLE_CONFLICT', message: `Name contains "curl" but primary muscle is "${mus}" (expected Biceps or Forearms).` });
    }
  }

  if (/\btriceps?\b|\bpushdown\b|\bskull\b/.test(nameLower) && mus !== 'Triceps') {
    issues.push({ code: 'MUSCLE_CONFLICT', message: `Name contains triceps keyword but primary muscle is "${mus}" (expected Triceps).` });
  }

  if (/\bsquats?\b|\bleg press\b/.test(nameLower) && !['Quads', 'Glutes', 'Full Body'].includes(mus)) {
    issues.push({ code: 'MUSCLE_CONFLICT', message: `Name contains squat/leg press but primary muscle is "${mus}" (expected Quads or Glutes).` });
  }

  if (/\brows?\b|\bpulldowns?\b|\bpull[- ]?ups?\b|\bchin[- ]?ups?\b/.test(nameLower) && mus !== 'Back') {
    // Check if inverted curl or rear delt row
    if (!/\bcurl\b/.test(nameLower)) {
      issues.push({ code: 'MUSCLE_CONFLICT', message: `Name contains row/pulldown/pull-up but primary muscle is "${mus}" (expected Back).` });
    }
  }

  if (/\bbench press\b|\bfly\b|\bflyes\b|\bpush[- ]?ups?\b/.test(nameLower)) {
    if (/\brear delt fly\b/.test(nameLower)) {
      if (mus !== 'Shoulders') issues.push({ code: 'MUSCLE_CONFLICT', message: `Name is "rear delt fly" but muscle is "${mus}" (expected Shoulders).` });
    } else if (!['Chest', 'Triceps', 'Shoulders'].includes(mus)) {
      issues.push({ code: 'MUSCLE_CONFLICT', message: `Name contains bench/fly/push-up but primary muscle is "${mus}" (expected Chest).` });
    }
  }

  if (/\braises?\b|\boverhead press\b|\bshoulder press\b|\barnold\b/.test(nameLower)) {
    if (/\bcalf raise\b|\bleg raise\b/.test(nameLower)) {
      // Leg raise is Abs, calf raise is Calves
      if (/\bcalf raise\b/.test(nameLower) && mus !== 'Calves') {
        issues.push({ code: 'MUSCLE_CONFLICT', message: `Name contains "calf raise" but primary muscle is "${mus}" (expected Calves).` });
      }
      if (/\bleg raise\b/.test(nameLower) && mus !== 'Abs' && mus !== 'Glutes') {
        issues.push({ code: 'MUSCLE_CONFLICT', message: `Name contains "leg raise" but primary muscle is "${mus}" (expected Abs).` });
      }
    } else if (mus !== 'Shoulders') {
      issues.push({ code: 'MUSCLE_CONFLICT', message: `Name contains raise/shoulder press but primary muscle is "${mus}" (expected Shoulders).` });
    }
  }

  if (/\bcrunches?\b|\bplanks?\b/.test(nameLower) && mus !== 'Abs') {
    issues.push({ code: 'MUSCLE_CONFLICT', message: `Name contains crunch/plank but primary muscle is "${mus}" (expected Abs).` });
  }

  if (/\bcalfs?\b|\bcalves\b/.test(nameLower) && mus !== 'Calves') {
    issues.push({ code: 'MUSCLE_CONFLICT', message: `Name contains calf/calves but primary muscle is "${mus}" (expected Calves).` });
  }

  // Rule 3.5: Variant consistency
  // Check for contradiction within the record's own name or metadata
  const hasIncline = /\bincline\b/.test(nameLower);
  const hasDecline = /\bdecline\b/.test(nameLower);
  if (hasIncline && hasDecline) {
    issues.push({ code: 'VARIANT_CONFLICT', message: 'Name contains both "incline" and "decline".' });
  }

  const hasSeated = /\bseated\b/.test(nameLower);
  const hasStanding = /\bstanding\b/.test(nameLower);
  if (hasSeated && hasStanding) {
    issues.push({ code: 'VARIANT_CONFLICT', message: 'Name contains both "seated" and "standing".' });
  }

  const reviewStatus = issues.length === 0 ? 'verified' : 'needs-review';
  return {
    reviewStatus,
    issues
  };
}

// 4. Run Dry Run Analysis
export async function runDryRun() {
  console.log('================================================================');
  console.log('FitTrack ExerciseDB Media Pipeline - DRY RUN VALIDATION');
  console.log('================================================================\n');

  // Compute checksums for all records
  const allByChecksum = new Map();
  for (const item of catalog) {
    const rawVideo = item.localVideo || '';
    const filePath = path.resolve('frontend/public', rawVideo.replace(/^\//, ''));
    if (fs.existsSync(filePath)) {
      const stats = fs.statSync(filePath);
      if (stats.size > 0) {
        const buf = fs.readFileSync(filePath);
        item.mediaChecksum = crypto.createHash('sha256').update(buf).digest('hex');
        item.fileSize = stats.size;
      } else {
        item.fileError = 'EMPTY_FILE';
      }
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
  const validatedRecords = [];
  const failuresCsvRows = [
    'externalId,name,equipment,primaryMuscle,mediaFile,reviewStatus,failureCode,failureReason'
  ];

  let verifiedCount = 0;
  let needsReviewCount = 0;
  const duplicateMediaGroups = [];

  const equipmentConflicts = [];
  const muscleConflicts = [];

  for (const item of catalog) {
    const validation = validateDatasetRecord(item, allByChecksum);
    item.reviewStatus = validation.reviewStatus;
    item.issues = validation.issues;

    if (validation.reviewStatus === 'verified') {
      verifiedCount++;
    } else {
      needsReviewCount++;
      for (const issue of validation.issues) {
        const escName = `"${item.name.replace(/"/g, '""').trim()}"`;
        const escMsg = `"${issue.message.replace(/"/g, '""')}"`;
        failuresCsvRows.push(
          `${item.exerciseId},${escName},${item.normalizedEquipment},${item.normalizedMuscle},${item.localVideo},${item.reviewStatus},${issue.code},${escMsg}`
        );
        if (issue.code === 'EQUIPMENT_CONFLICT') equipmentConflicts.push({ id: item.exerciseId, name: item.name, msg: issue.message });
        if (issue.code === 'MUSCLE_CONFLICT') muscleConflicts.push({ id: item.exerciseId, name: item.name, msg: issue.message });
      }
    }
    validatedRecords.push(item);
  }

  // Find duplicate media groups
  for (const [hash, group] of allByChecksum.entries()) {
    if (group.length > 1) {
      duplicateMediaGroups.push({
        checksum: hash,
        count: group.length,
        exercises: group.map(g => ({ externalId: g.exerciseId, name: g.name.trim(), file: g.localVideo }))
      });
    }
  }

  // Check counts per muscle and per equipment
  const countsPerMuscle = {};
  const countsPerEquipment = {};

  for (const item of validatedRecords) {
    countsPerMuscle[item.normalizedMuscle] = (countsPerMuscle[item.normalizedMuscle] || 0) + 1;
    countsPerEquipment[item.normalizedEquipment] = (countsPerEquipment[item.normalizedEquipment] || 0) + 1;
  }

  // Fetch local DB count
  const seedPath = path.resolve('backend/src/main/resources/data/exercises_seed.json');
  const dbExercises = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
  const oldDbTotal = dbExercises.length;
  const noMediaCount = oldDbTotal - validatedRecords.length;

  // Save report and CSV
  const csvPath = path.resolve('tools/dry_run_validation_failures.csv');
  fs.writeFileSync(csvPath, failuresCsvRows.join('\n'), 'utf-8');

  const report = {
    totalDatasetRecords: validatedRecords.length,
    verifiedCount,
    needsReviewCount,
    noMediaCountInOldDb: noMediaCount,
    duplicateMediaGroupsCount: duplicateMediaGroups.length,
    equipmentConflictsCount: equipmentConflicts.length,
    muscleConflictsCount: muscleConflicts.length,
    countsPerMuscle,
    countsPerEquipment,
    duplicateMediaGroups,
    equipmentConflicts,
    muscleConflicts
  };

  const reportPath = path.resolve('tools/dry_run_validation_report.json');
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2), 'utf-8');

  console.log('DRY RUN SUMMARY:');
  console.log(`- Total Dataset Records Analyzed: ${validatedRecords.length}`);
  console.log(`- Verified (Passed all checks):   ${verifiedCount} (${((verifiedCount / validatedRecords.length) * 100).toFixed(1)}%)`);
  console.log(`- Needs Review (Flagged):         ${needsReviewCount} (${((needsReviewCount / validatedRecords.length) * 100).toFixed(1)}%)`);
  console.log(`- Old DB Records (-> "no-media"): ${noMediaCount}`);
  console.log(`- Duplicate Media Groups:         ${duplicateMediaGroups.length}`);
  console.log(`- Equipment Conflicts Flagged:    ${equipmentConflicts.length}`);
  console.log(`- Muscle Conflicts Flagged:       ${muscleConflicts.length}`);
  console.log(`\nFailures CSV generated at: ${csvPath}`);
  console.log(`Detailed Report generated at: ${reportPath}`);

  return report;
}

if (process.argv[1] && process.argv[1].endsWith('validate_dataset_pipeline.mjs')) {
  runDryRun().catch(console.error);
}
