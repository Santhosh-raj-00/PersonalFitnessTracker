import fs from 'fs';
import path from 'path';

/**
 * FitTrack Movement Pattern Mapping & Kinematics Normalizer
 * Assigns one of ~49 canonical movement patterns to every exercise in the dataset.
 */

export const MOVEMENT_PATTERNS = [
  'flat_press',
  'incline_press',
  'decline_press',
  'overhead_press',
  'chest_fly',
  'pullover',
  'push_up',
  'dip',
  'pull_up',
  'lat_pulldown',
  'horizontal_row',
  'bent_over_row',
  'single_arm_row',
  'deadlift_hinge',
  'romanian_deadlift',
  'good_morning',
  'back_squat',
  'front_goblet_squat',
  'lunge',
  'split_squat',
  'leg_press',
  'leg_extension',
  'leg_curl',
  'hip_thrust_bridge',
  'glute_kickback',
  'biceps_curl',
  'hammer_curl',
  'preacher_curl',
  'triceps_pushdown',
  'overhead_triceps_extension',
  'skull_crusher',
  'triceps_kickback',
  'lateral_raise',
  'front_raise',
  'rear_delt_fly',
  'shrug',
  'upright_row',
  'calf_raise',
  'crunch',
  'leg_raise',
  'plank',
  'russian_twist_rotation',
  'wrist_curl',
  'carry',
  'kettlebell_swing',
  'jump_rope',
  'running',
  'rowing_machine',
  'cycling'
];

export function determinePattern(name, primaryMuscle, equipment, movementType) {
  const n = name.toLowerCase();
  const muscle = (primaryMuscle || '').toUpperCase();
  const eq = (equipment || '').toUpperCase();

  const isSingle = n.includes('single') || n.includes('one-arm') || n.includes('one arm') || n.includes('alternating') || n.includes('single leg') || n.includes('one-legged');
  const isWide = n.includes('wide');
  const isClose = n.includes('close') || n.includes('narrow') || n.includes('diamond');

  // 1. CHEST PRESSES & PUSH-UPS
  if (n.includes('push-up') || n.includes('push up') || n.includes('pushup')) {
    return {
      pattern: 'push_up',
      cameraView: 'side',
      params: { gripWidth: isClose ? 'narrow' : isWide ? 'wide' : 'normal', inclineAngle: n.includes('incline') ? 25 : n.includes('decline') ? -20 : 0, rom: 1.0, tempo: 2.4, singleArm: isSingle }
    };
  }

  if (n.includes('bench press') || n.includes('chest press') || n.includes('floor press') || (muscle === 'CHEST' && n.includes('press'))) {
    if (n.includes('incline')) {
      return {
        pattern: 'incline_press',
        cameraView: 'side',
        params: { gripWidth: isClose ? 'narrow' : isWide ? 'wide' : 'normal', inclineAngle: 30, rom: 1.0, tempo: 2.8, singleArm: isSingle }
      };
    }
    if (n.includes('decline')) {
      return {
        pattern: 'decline_press',
        cameraView: 'side',
        params: { gripWidth: isClose ? 'narrow' : isWide ? 'wide' : 'normal', inclineAngle: -20, rom: 1.0, tempo: 2.8, singleArm: isSingle }
      };
    }
    return {
      pattern: 'flat_press',
      cameraView: 'side',
      params: { gripWidth: isClose ? 'narrow' : isWide ? 'wide' : 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.8, singleArm: isSingle }
    };
  }

  // 2. CHEST FLYES & PULLOVERS
  if (n.includes('pec deck') || n.includes('fly') || n.includes('flye') || n.includes('crossover') || n.includes('butterfly')) {
    if (muscle === 'SHOULDERS' || n.includes('rear delt') || n.includes('reverse fly')) {
      return {
        pattern: 'rear_delt_fly',
        cameraView: 'front',
        params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.5, singleArm: isSingle }
      };
    }
    return {
      pattern: 'chest_fly',
      cameraView: 'front',
      params: { gripWidth: 'wide', inclineAngle: n.includes('incline') ? 30 : n.includes('decline') ? -20 : 0, rom: 1.0, tempo: 2.6, singleArm: isSingle }
    };
  }

  if (n.includes('pullover')) {
    return {
      pattern: 'pullover',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 3.0, singleArm: false }
    };
  }

  // 3. DIPS
  if (n.includes('dip') && !n.includes('toe dip')) {
    return {
      pattern: 'dip',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 15, rom: 1.0, tempo: 2.5, singleArm: false }
    };
  }

  // 4. VERTICAL PULLS (Pull-ups, Lat Pulldowns)
  if (n.includes('pull-up') || n.includes('pull up') || n.includes('chin-up') || n.includes('chin up')) {
    return {
      pattern: 'pull_up',
      cameraView: 'front',
      params: { gripWidth: isWide ? 'wide' : isClose ? 'narrow' : 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: isSingle }
    };
  }

  if (n.includes('pulldown') || n.includes('pull-down')) {
    return {
      pattern: 'lat_pulldown',
      cameraView: 'front',
      params: { gripWidth: isWide ? 'wide' : isClose ? 'narrow' : 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: isSingle }
    };
  }

  // 5. ROWS (Bent-over, Horizontal/Seated, Single-arm, Upright)
  if (n.includes('upright row')) {
    return {
      pattern: 'upright_row',
      cameraView: 'front',
      params: { gripWidth: isClose ? 'narrow' : 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.4, singleArm: isSingle }
    };
  }

  if (n.includes('row') || n.includes('face pull')) {
    if (isSingle || n.includes('one arm') || n.includes('single arm')) {
      return {
        pattern: 'single_arm_row',
        cameraView: 'side',
        params: { gripWidth: 'normal', inclineAngle: 45, rom: 1.0, tempo: 2.6, singleArm: true }
      };
    }
    if (n.includes('seated') || n.includes('cable row') || n.includes('t-bar') || n.includes('machine row') || n.includes('face pull')) {
      return {
        pattern: 'horizontal_row',
        cameraView: 'side',
        params: { gripWidth: isWide ? 'wide' : isClose ? 'narrow' : 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: false }
      };
    }
    return {
      pattern: 'bent_over_row',
      cameraView: 'side',
      params: { gripWidth: isWide ? 'wide' : isClose ? 'narrow' : 'normal', inclineAngle: 45, rom: 1.0, tempo: 2.6, singleArm: false }
    };
  }

  // 6. OVERHEAD & SHOULDER PRESSES
  if (
    n.includes('overhead press') || n.includes('shoulder press') || n.includes('military press') ||
    n.includes('arnold press') || n.includes('push press') || (muscle === 'SHOULDERS' && n.includes('press'))
  ) {
    return {
      pattern: 'overhead_press',
      cameraView: 'side',
      params: { gripWidth: isWide ? 'wide' : isClose ? 'narrow' : 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: isSingle }
    };
  }

  // 7. SHOULDER RAISES & SHRUGS
  if (n.includes('lateral raise') || (muscle === 'SHOULDERS' && n.includes('lateral')) || n.includes('side raise')) {
    return {
      pattern: 'lateral_raise',
      cameraView: 'front',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.4, singleArm: isSingle }
    };
  }

  if (n.includes('front raise')) {
    return {
      pattern: 'front_raise',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.4, singleArm: isSingle }
    };
  }

  if (n.includes('rear delt') || n.includes('reverse fly') || n.includes('face pull')) {
    return {
      pattern: 'rear_delt_fly',
      cameraView: 'front',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.4, singleArm: isSingle }
    };
  }

  if (n.includes('shrug')) {
    return {
      pattern: 'shrug',
      cameraView: 'front',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.0, singleArm: isSingle }
    };
  }

  // 8. BICEPS CURLS
  if (n.includes('curl') && (muscle === 'BICEPS' || muscle === 'FOREARMS' || muscle === 'TRAPS' || !n.includes('leg') && !n.includes('hamstring'))) {
    if (n.includes('wrist')) {
      return {
        pattern: 'wrist_curl',
        cameraView: 'side',
        params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.0, singleArm: isSingle }
      };
    }
    if (n.includes('preacher') || n.includes('scott')) {
      return {
        pattern: 'preacher_curl',
        cameraView: 'side',
        params: { gripWidth: isClose ? 'narrow' : isWide ? 'wide' : 'normal', inclineAngle: 45, rom: 1.0, tempo: 2.5, singleArm: isSingle }
      };
    }
    if (n.includes('hammer')) {
      return {
        pattern: 'hammer_curl',
        cameraView: 'side',
        params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.4, singleArm: isSingle }
      };
    }
    return {
      pattern: 'biceps_curl',
      cameraView: 'side',
      params: { gripWidth: isClose ? 'narrow' : isWide ? 'wide' : 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.4, singleArm: isSingle }
    };
  }

  // 9. TRICEPS MOVEMENTS
  if (n.includes('pushdown') || n.includes('push-down') || (muscle === 'TRICEPS' && n.includes('cable'))) {
    return {
      pattern: 'triceps_pushdown',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.4, singleArm: isSingle }
    };
  }

  if (n.includes('skull crusher') || n.includes('skullcrusher') || n.includes('lying triceps') || n.includes('lying extension')) {
    return {
      pattern: 'skull_crusher',
      cameraView: 'side',
      params: { gripWidth: isClose ? 'narrow' : 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: isSingle }
    };
  }

  if (n.includes('kickback')) {
    if (muscle === 'GLUTES' || n.includes('glute')) {
      return {
        pattern: 'glute_kickback',
        cameraView: 'side',
        params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: true }
      };
    }
    return {
      pattern: 'triceps_kickback',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 45, rom: 1.0, tempo: 2.4, singleArm: true }
    };
  }

  if (muscle === 'TRICEPS' || n.includes('triceps extension') || n.includes('french press')) {
    return {
      pattern: 'overhead_triceps_extension',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.5, singleArm: isSingle }
    };
  }

  // 10. SQUATS, LUNGES, LEG PRESS & LEG EXTENSION
  if (n.includes('leg press')) {
    if (n.includes('calf')) {
      return {
        pattern: 'calf_raise',
        cameraView: 'side',
        params: { gripWidth: 'normal', inclineAngle: 45, rom: 1.0, tempo: 2.2, singleArm: false }
      };
    }
    return {
      pattern: 'leg_press',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 45, rom: 1.0, tempo: 3.0, singleArm: isSingle }
    };
  }

  if (n.includes('leg extension')) {
    return {
      pattern: 'leg_extension',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: isSingle }
    };
  }

  if (n.includes('split squat') || n.includes('bulgarian')) {
    return {
      pattern: 'split_squat',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.8, singleArm: true }
    };
  }

  if (n.includes('lunge') || n.includes('step-up') || n.includes('step up')) {
    return {
      pattern: 'lunge',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.8, singleArm: true }
    };
  }

  if (n.includes('front squat') || n.includes('goblet') || n.includes('zercher')) {
    return {
      pattern: 'front_goblet_squat',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 3.0, singleArm: false }
    };
  }

  if (n.includes('squat') || n.includes('hack squat') || (muscle === 'QUADS' && !n.includes('curl') && !n.includes('drag'))) {
    return {
      pattern: 'back_squat',
      cameraView: 'side',
      params: { gripWidth: isWide ? 'wide' : 'normal', inclineAngle: 0, rom: 1.0, tempo: 3.0, singleArm: false }
    };
  }

  // 11. DEADLIFTS, HINGES & HAMSTRINGS
  if (n.includes('leg curl') || (muscle === 'HAMSTRINGS' && n.includes('curl'))) {
    return {
      pattern: 'leg_curl',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: isSingle }
    };
  }

  if (n.includes('romanian deadlift') || n.includes('rdl') || n.includes('stiff-leg') || n.includes('straight-leg')) {
    return {
      pattern: 'romanian_deadlift',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.8, singleArm: isSingle }
    };
  }

  if (n.includes('good morning')) {
    return {
      pattern: 'good_morning',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.8, singleArm: false }
    };
  }

  if (n.includes('deadlift') || n.includes('rack pull') || (muscle === 'BACK' && n.includes('pull'))) {
    return {
      pattern: 'deadlift_hinge',
      cameraView: 'side',
      params: { gripWidth: isWide ? 'wide' : 'normal', inclineAngle: 0, rom: 1.0, tempo: 3.0, singleArm: false }
    };
  }

  // 12. GLUTES & HIPS
  if (n.includes('hip thrust') || n.includes('glute bridge') || n.includes('bridge')) {
    return {
      pattern: 'hip_thrust_bridge',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: isSingle }
    };
  }

  if (n.includes('glute kickback') || n.includes('donkey kick') || n.includes('hip abduction') || n.includes('abductor') || n.includes('adductor')) {
    return {
      pattern: 'glute_kickback',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.5, singleArm: true }
    };
  }

  // 13. CALVES
  if (muscle === 'CALVES' || n.includes('calf raise') || n.includes('calf') || n.includes('calves')) {
    return {
      pattern: 'calf_raise',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.0, singleArm: isSingle }
    };
  }

  // 14. ABS & CORE
  if (n.includes('crunch') || n.includes('sit-up') || n.includes('sit up')) {
    return {
      pattern: 'crunch',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.2, singleArm: false }
    };
  }

  if (n.includes('leg raise') || n.includes('knee raise') || n.includes('hanging leg') || n.includes('flutter kick') || n.includes('scissor kick') || n.includes('hollow')) {
    return {
      pattern: 'leg_raise',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.4, singleArm: false }
    };
  }

  if (n.includes('plank')) {
    return {
      pattern: 'plank',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 4.0, singleArm: false }
    };
  }

  if (n.includes('twist') || n.includes('rotation') || n.includes('woodchop') || n.includes('oblique')) {
    return {
      pattern: 'russian_twist_rotation',
      cameraView: 'front',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.5, singleArm: false }
    };
  }

  // 15. CONDITIONING, CARDIO & SPECIALTY
  if (n.includes('swing') || n.includes('kettlebell swing')) {
    return {
      pattern: 'kettlebell_swing',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.0, singleArm: isSingle }
    };
  }

  if (n.includes('carry') || n.includes('farmer') || n.includes('walk') || n.includes('drag') || n.includes('sled')) {
    return {
      pattern: 'carry',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.0, singleArm: isSingle }
    };
  }

  if (n.includes('jump rope') || n.includes('rope jumping') || n.includes('skipping')) {
    return {
      pattern: 'jump_rope',
      cameraView: 'front',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 1.2, singleArm: false }
    };
  }

  if (n.includes('treadmill') || n.includes('running') || n.includes('jogging') || n.includes('sprint')) {
    return {
      pattern: 'running',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 1.0, singleArm: false }
    };
  }

  if (n.includes('rowing') || n.includes('rower') || n.includes('ergometer')) {
    return {
      pattern: 'rowing_machine',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.2, singleArm: false }
    };
  }

  if (n.includes('bike') || n.includes('cycling') || n.includes('bicycle')) {
    return {
      pattern: 'cycling',
      cameraView: 'side',
      params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 1.2, singleArm: false }
    };
  }

  // Fallbacks based on Primary Muscle Group
  switch (muscle) {
    case 'CHEST':
      return { pattern: 'flat_press', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.8, singleArm: false } };
    case 'BACK':
      return { pattern: 'horizontal_row', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: false } };
    case 'SHOULDERS':
      return { pattern: 'overhead_press', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: false } };
    case 'TRAPS':
      return { pattern: 'shrug', cameraView: 'front', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.0, singleArm: false } };
    case 'BICEPS':
      return { pattern: 'biceps_curl', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.4, singleArm: false } };
    case 'TRICEPS':
      return { pattern: 'triceps_pushdown', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.4, singleArm: false } };
    case 'FOREARMS':
      return { pattern: 'wrist_curl', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.0, singleArm: false } };
    case 'ABS':
      return { pattern: 'crunch', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.2, singleArm: false } };
    case 'QUADS':
      return { pattern: 'back_squat', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 3.0, singleArm: false } };
    case 'HAMSTRINGS':
      return { pattern: 'romanian_deadlift', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.8, singleArm: false } };
    case 'GLUTES':
      return { pattern: 'hip_thrust_bridge', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.6, singleArm: false } };
    case 'CALVES':
      return { pattern: 'calf_raise', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 2.0, singleArm: false } };
    default:
      return { pattern: 'back_squat', cameraView: 'side', params: { gripWidth: 'normal', inclineAngle: 0, rom: 1.0, tempo: 3.0, singleArm: false } };
  }
}

export async function runMapping() {
  const seedPath = path.resolve('backend/src/main/resources/data/exercises_seed.json');
  const exercises = JSON.parse(fs.readFileSync(seedPath, 'utf8'));

  console.log(`Processing ${exercises.length} exercises for movement pattern mapping...`);

  const patternCounts = {};
  const unmapped = [];

  for (const ex of exercises) {
    const res = determinePattern(ex.name, ex.primaryMuscle, ex.equipment, ex.movementType);
    if (!res || !res.pattern) {
      unmapped.push(ex.name);
      continue;
    }
    ex.animationPattern = res.pattern;
    ex.animationParams = JSON.stringify(res.params);
    ex.cameraView = res.cameraView;

    patternCounts[res.pattern] = (patternCounts[res.pattern] || 0) + 1;
  }

  console.log('\n=== MOVEMENT PATTERN MAPPING REPORT ===');
  console.log(`Total Exercises Evaluated: ${exercises.length}`);
  console.log(`Mapped Count: ${exercises.length - unmapped.length}`);
  console.log(`Unmapped Count: ${unmapped.length}`);
  if (unmapped.length > 0) {
    console.warn('Unmapped Exercises:', unmapped);
  } else {
    console.log('100% of exercises mapped successfully! No unmapped exercises remaining.');
  }

  console.log('\nExercises Mapped per Movement Pattern:');
  console.table(patternCounts);

  // Write updated seed JSON
  fs.writeFileSync(seedPath, JSON.stringify(exercises, null, 2), 'utf8');
  console.log(`Updated ${seedPath} with animationPattern, animationParams, and cameraView.`);

  // Generate V7 Migration
  const v7Path = path.resolve('backend/src/main/resources/db/migration/V7__add_exercise_animation_fields.sql');
  const sqlLines = [
    '-- V7__add_exercise_animation_fields.sql',
    '-- Add animation_pattern, animation_params, and camera_view fields',
    '-- Map all exercises to animated mannequin movement patterns',
    '',
    'ALTER TABLE exercises ADD COLUMN IF NOT EXISTS animation_pattern VARCHAR(100);',
    'ALTER TABLE exercises ADD COLUMN IF NOT EXISTS animation_params VARCHAR(500);',
    'ALTER TABLE exercises ADD COLUMN IF NOT EXISTS camera_view VARCHAR(20);',
    ''
  ];

  for (const ex of exercises) {
    const nameEsc = ex.name.replace(/'/g, "''");
    const patternEsc = ex.animationPattern.replace(/'/g, "''");
    const paramsEsc = ex.animationParams.replace(/'/g, "''");
    const camEsc = ex.cameraView.replace(/'/g, "''");

    sqlLines.push(
      `UPDATE exercises SET animation_pattern = '${patternEsc}', animation_params = '${paramsEsc}', camera_view = '${camEsc}' WHERE LOWER(name) = LOWER('${nameEsc}');`
    );
  }

  fs.writeFileSync(v7Path, sqlLines.join('\n'), 'utf8');
  console.log(`Generated Flyway migration V7 at ${v7Path}.`);
}

runMapping().catch(console.error);
