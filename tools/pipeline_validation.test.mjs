import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeEquipment,
  normalizeMuscle,
  validateDatasetRecord,
  EQUIPMENT_MAPPING_TABLE,
  MUSCLE_MAPPING_TABLE
} from './validate_dataset_pipeline.mjs';

test('Equipment Normalization maps correctly to standard taxonomy', () => {
  assert.equal(normalizeEquipment('BODY WEIGHT'), 'Bodyweight');
  assert.equal(normalizeEquipment('DUMBBELL'), 'Dumbbell');
  assert.equal(normalizeEquipment('BARBELL'), 'Barbell');
  assert.equal(normalizeEquipment('LEVERAGE MACHINE'), 'Machine');
  assert.equal(normalizeEquipment('MACHINE'), 'Machine');
  assert.equal(normalizeEquipment('CABLE'), 'Cable');
  assert.equal(normalizeEquipment('SMITH MACHINE'), 'Smith Machine');
  assert.equal(normalizeEquipment('BAND'), 'Band');
  assert.equal(normalizeEquipment('ROPE'), 'Other');
  assert.equal(normalizeEquipment('TIRE'), 'Other');
  assert.equal(normalizeEquipment('SLED'), 'Other');
  assert.equal(normalizeEquipment('UNKNOWN_PROP'), 'Other');
  assert.equal(normalizeEquipment(null), 'Other');
});

test('Muscle Normalization maps target muscles and body parts to taxonomy', () => {
  assert.equal(normalizeMuscle('PECTORALIS MAJOR STERNAL HEAD', 'CHEST'), 'Chest');
  assert.equal(normalizeMuscle('LATISSIMUS DORSI', 'BACK'), 'Back');
  assert.equal(normalizeMuscle('ANTERIOR DELTOID', 'SHOULDERS'), 'Shoulders');
  assert.equal(normalizeMuscle('BICEPS BRACHII', 'UPPER ARMS'), 'Biceps');
  assert.equal(normalizeMuscle('TRICEPS BRACHII', 'UPPER ARMS'), 'Triceps');
  assert.equal(normalizeMuscle('RECTUS ABDOMINIS', 'WAIST'), 'Abs');
  assert.equal(normalizeMuscle('OBLIQUES', 'WAIST'), 'Abs');
  assert.equal(normalizeMuscle('GLUTEUS MAXIMUS', 'HIPS'), 'Glutes');
  assert.equal(normalizeMuscle('QUADRICEPS', 'THIGHS'), 'Quads');
  assert.equal(normalizeMuscle('HAMSTRINGS', 'THIGHS'), 'Hamstrings');
  assert.equal(normalizeMuscle('GASTROCNEMIUS', 'CALVES'), 'Calves');
  assert.equal(normalizeMuscle('WRIST FLEXORS', 'FOREARMS'), 'Forearms');
  assert.equal(normalizeMuscle('TRAPEZIUS UPPER FIBERS', 'NECK'), 'Traps');
});

test('Duplicate media validator flags records sharing identical checksums', () => {
  const dummyMap = new Map([
    ['hash123', [
      { exerciseId: 'ex1', name: 'Exercise A' },
      { exerciseId: 'ex2', name: 'Exercise B' }
    ]]
  ]);

  const record1 = {
    exerciseId: 'ex1',
    name: 'Exercise A',
    normalizedEquipment: 'Bodyweight',
    normalizedMuscle: 'Chest',
    mediaChecksum: 'hash123'
  };

  const res1 = validateDatasetRecord(record1, dummyMap);
  assert.equal(res1.reviewStatus, 'needs-review');
  assert.ok(res1.issues.some(i => i.code === 'DUPLICATE_MEDIA_FILE'));

  // Unique hash passes
  const dummyUniqueMap = new Map([
    ['hash_unique', [{ exerciseId: 'ex3', name: 'Exercise C' }]]
  ]);
  const recordUnique = {
    exerciseId: 'ex3',
    name: 'Push-up',
    normalizedEquipment: 'Bodyweight',
    normalizedMuscle: 'Chest',
    mediaChecksum: 'hash_unique'
  };
  const resUnique = validateDatasetRecord(recordUnique, dummyUniqueMap);
  assert.equal(resUnique.reviewStatus, 'verified');
});

test('Equipment consistency validator catches conflicts', () => {
  const emptyMap = new Map();
  // Name has "Dumbbell" but record says "Cable"
  const badRecord = {
    exerciseId: 'ex_bad',
    name: 'Alternate Incline Dumbbell Curl',
    normalizedEquipment: 'Cable',
    normalizedMuscle: 'Biceps',
    mediaChecksum: 'hash_single'
  };
  emptyMap.set('hash_single', [badRecord]);

  const res = validateDatasetRecord(badRecord, emptyMap);
  assert.equal(res.reviewStatus, 'needs-review');
  assert.ok(res.issues.some(i => i.code === 'EQUIPMENT_CONFLICT'));
});

test('Muscle consistency validator catches misclassified exercises', () => {
  const emptyMap = new Map();
  // Name has "curl" but muscle is "Chest"
  const badMuscleRecord = {
    exerciseId: 'ex_mus',
    name: 'Biceps Curl with Towel',
    normalizedEquipment: 'Bodyweight',
    normalizedMuscle: 'Chest',
    mediaChecksum: 'hash_single'
  };
  emptyMap.set('hash_single', [badMuscleRecord]);

  const res = validateDatasetRecord(badMuscleRecord, emptyMap);
  assert.equal(res.reviewStatus, 'needs-review');
  assert.ok(res.issues.some(i => i.code === 'MUSCLE_CONFLICT'));
});

test('Variant consistency validator catches contradictory variants in name', () => {
  const emptyMap = new Map();
  const contradictoryRecord = {
    exerciseId: 'ex_var',
    name: 'Incline Decline Bench Press',
    normalizedEquipment: 'Barbell',
    normalizedMuscle: 'Chest',
    mediaChecksum: 'hash_single'
  };
  emptyMap.set('hash_single', [contradictoryRecord]);

  const res = validateDatasetRecord(contradictoryRecord, emptyMap);
  assert.equal(res.reviewStatus, 'needs-review');
  assert.ok(res.issues.some(i => i.code === 'VARIANT_CONFLICT'));
});
