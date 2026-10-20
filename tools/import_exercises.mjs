import fs from 'fs';
import path from 'path';

/**
 * FitTrack Full Exercise Library Import & Normalization Engine
 * 
 * Sources & Licenses:
 * 1. Free Exercise DB (https://github.com/yuhonas/free-exercise-db) - The Unlicense (Public Domain)
 * 2. wger Exercise Database (https://wger.de) - CC-BY-SA 4.0
 * 3. FitTrack Curated Core Biomechanical Library - CC0 / Public Domain
 * 
 * Equipment Taxonomy:
 * Barbell, Dumbbell, Kettlebell, Machine, Cable, Smith Machine, Bodyweight, Band, Other
 */

const RAW_MEDIA_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const CDN_MEDIA_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';
const DATASET_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

// Controlled Muscle Names:
// CHEST, BACK, SHOULDERS, TRAPS, BICEPS, TRICEPS, FOREARMS, ABS, GLUTES, QUADS, HAMSTRINGS, CALVES, CARDIO, FULL_BODY
export function normalizeMuscle(raw) {
  if (!raw) return 'CHEST';
  const m = raw.toLowerCase().trim().replace(/[_-]/g, ' ');

  if (m.includes('chest') || m.includes('pec')) return 'CHEST';
  if (m.includes('trap')) return 'TRAPS';
  if (m.includes('lat') || m.includes('middle back') || m.includes('lower back') || m.includes('upper back') || m.includes('back')) return 'BACK';
  if (m.includes('shoulder') || m.includes('delt')) return 'SHOULDERS';
  if (m.includes('bicep') || m.includes('brachialis')) return 'BICEPS';
  if (m.includes('tricep')) return 'TRICEPS';
  if (m.includes('forearm') || m.includes('wrist') || m.includes('brachioradialis')) return 'FOREARMS';
  if (m.includes('abdom') || m.includes('ab') || m.includes('core') || m.includes('oblique')) return 'ABS';
  if (m.includes('glute')) return 'GLUTES';
  if (m.includes('quad') || m.includes('quadriceps') || m.includes('adductor') || m.includes('abductor')) return 'QUADS';
  if (m.includes('hamstring')) return 'HAMSTRINGS';
  if (m.includes('calve') || m.includes('calf') || m.includes('soleus') || m.includes('gastrocnemius')) return 'CALVES';
  if (m.includes('cardio') || m.includes('aerobic') || m.includes('endurance')) return 'CARDIO';
  if (m.includes('full body') || m.includes('compound') || m.includes('total body')) return 'FULL_BODY';

  return 'CHEST';
}

/**
 * Strict Equipment Taxonomy Normalization
 * Values: BARBELL, DUMBBELL, KETTLEBELL, MACHINE, CABLE, SMITH_MACHINE, BODYWEIGHT, BAND, OTHER
 */
export function normalizeEquipment(raw, name = '') {
  const n = (name || '').toLowerCase();
  const eq = (raw || '').toLowerCase().trim();

  // 1. Smith Machine
  if (n.includes('smith machine') || n.includes('smith ') || eq.includes('smith')) {
    return 'SMITH_MACHINE';
  }

  // 2. Cable
  if (
    n.includes('cable') || n.includes('rope pushdown') || n.includes('cable pushdown') ||
    n.includes('lat pulldown (cable') || n.includes('seated cable row') || n.includes('face pull') ||
    n.includes('cable crossover') || n.includes('cable fly') || eq.includes('cable')
  ) {
    if (n.includes('plate-loaded') || n.includes('leverage') || n.includes('lat pulldown machine')) {
      return 'MACHINE';
    }
    return 'CABLE';
  }

  // 3. Bands
  if (
    n.includes('resistance band') || n.includes('band ') || n.includes('bands ') ||
    n.includes('band-assisted') || n.includes('band assisted') ||
    eq.includes('band') || eq === 'bands'
  ) {
    // If it's a machine like Assisted Pull-Up Machine, keep machine
    if (n.includes('machine')) return 'MACHINE';
    return 'BAND';
  }

  // 4. Barbell (and EZ-bar)
  if (
    n.includes('barbell') || n.includes('ez-bar') || n.includes('ez bar') ||
    n.includes('e-z curl') || eq.includes('barbell') || eq.includes('e-z') || eq.includes('ez')
  ) {
    return 'BARBELL';
  }

  // 5. Dumbbell
  if (n.includes('dumbbell') || eq.includes('dumbbell')) {
    return 'DUMBBELL';
  }

  // 6. Kettlebell
  if (n.includes('kettlebell') || eq.includes('kettlebell')) {
    return 'KETTLEBELL';
  }

  // 7. Other (Strongman, sleds, ropes, tires, chains, foam rolls, medicine ball, exercise ball, cardio machines)
  if (
    n.includes('atlas stone') || n.includes('axle') || n.includes('sled') ||
    n.includes('drag') || n.includes('prowler') || n.includes('tire') ||
    n.includes('battling rope') || n.includes('battle rope') || n.includes('chain') ||
    n.includes('farmer') || n.includes('yoke') || n.includes('log press') ||
    n.includes('medicine ball') || n.includes('exercise ball') || n.includes('foam roll') ||
    n.includes('-smr') || n.includes('balance board') || n.includes('treadmill') ||
    n.includes('stationary bike') || n.includes('bicycling') || n.includes('elliptical') ||
    n.includes('stairmaster') || n.includes('step mill') || n.includes('rowing, stationary') ||
    eq === 'other' || eq === 'medicine ball' || eq === 'exercise ball' || eq === 'foam roll'
  ) {
    return 'OTHER';
  }

  // 8. Machine (Fixed-path, selectorized, plate-loaded machines)
  if (
    n.includes('machine') || n.includes('pec deck') || n.includes('butterfly') ||
    n.includes('hack squat') || n.includes('leg press') || n.includes('leg extension') ||
    n.includes('leg curl') || n.includes('chest press') || n.includes('shoulder press') ||
    n.includes('ab crunch machine') || n.includes('rotary torso') || n.includes('torso rotation') ||
    n.includes('abductor') || n.includes('adductor') || n.includes('calf press') ||
    n.includes('dip machine') || n.includes('assisted pull-up') || n.includes('assisted dip') ||
    n.includes('back extension machine') || n.includes('glute kickback') ||
    n.includes('hip thrust machine') || n.includes('leverage') || eq === 'machine'
  ) {
    return 'MACHINE';
  }

  // 9. Bodyweight (Body only, calisthenics, suspension/TRX)
  if (
    eq === 'body only' || eq === 'none' || eq === '' || !raw ||
    n.includes('push-up') || n.includes('pull-up') || n.includes('chin-up') ||
    n.includes('dip') || n.includes('plank') || n.includes('crunch') ||
    n.includes('burpee') || n.includes('bodyweight') || n.includes('trx')
  ) {
    return 'BODYWEIGHT';
  }

  return 'OTHER';
}

export function normalizeDifficulty(raw) {
  if (!raw) return 'INTERMEDIATE';
  const d = raw.toLowerCase().trim();
  if (d.includes('begin')) return 'BEGINNER';
  if (d.includes('adv') || d.includes('expert')) return 'ADVANCED';
  return 'INTERMEDIATE';
}

export function deriveMovementType(name, primaryMuscle, equipment) {
  const n = name.toLowerCase();
  // Compounds: multi-joint movements
  if (
    n.includes('press') || n.includes('squat') || n.includes('deadlift') ||
    n.includes('row') || n.includes('pull-up') || n.includes('chin-up') ||
    n.includes('pulldown') || n.includes('dip') || n.includes('lunge') ||
    n.includes('clean') || n.includes('snatch') || n.includes('thruster') ||
    n.includes('push-up') || n.includes('push up') || n.includes('pushup') ||
    n.includes('step-up') || n.includes('burpee') || n.includes('carry') ||
    n.includes('hip thrust') || n.includes('hack squat') || n.includes('leg press')
  ) {
    // Exceptions: Skull crusher, French press, leg press calf raise
    if (n.includes('french press') || n.includes('skull crusher') || n.includes('calf press')) {
      return 'ISOLATION';
    }
    return 'COMPOUND';
  }

  // Isolations: single joint
  if (
    n.includes('curl') || n.includes('extension') || n.includes('raise') ||
    n.includes('fly') || n.includes('flye') || n.includes('crossover') ||
    n.includes('shrug') || n.includes('crunch') || n.includes('rollout') ||
    n.includes('pullover') || n.includes('kickback') || n.includes('abductor') ||
    n.includes('adductor') || n.includes('pec deck') || n.includes('butterfly') ||
    n.includes('torso rotation')
  ) {
    return 'ISOLATION';
  }

  return 'COMPOUND';
}

export function deriveChestRegion(name, primaryMuscle) {
  if (primaryMuscle !== 'CHEST') return null;
  const n = name.toLowerCase();

  // Inner
  if (
    n.includes('close-grip') || n.includes('close grip') || n.includes('diamond') ||
    n.includes('svend') || n.includes('hex press') || n.includes('pinch press')
  ) {
    return 'Inner';
  }

  // Upper (Clavicular Head)
  if (
    n.includes('incline') || n.includes('low cable') || n.includes('low-to-high') ||
    n.includes('guillotine') || n.includes('reverse-grip bench') ||
    (n.includes('push-up') && n.includes('decline'))
  ) {
    return 'Upper';
  }

  // Lower (Abdominal Head)
  if (
    n.includes('decline') || n.includes('dip') || n.includes('high cable') ||
    n.includes('high-to-low') || (n.includes('push-up') && n.includes('incline'))
  ) {
    return 'Lower';
  }

  // Mid (Sternal Head)
  return 'Mid';
}

export function deriveMistakes(exercise) {
  const name = exercise.name.toLowerCase();
  const mistakes = [];

  if (name.includes('press') || name.includes('bench')) {
    mistakes.push('Flaring elbows outward at a 90-degree angle, causing shoulder impingement and anterior rotator cuff stress.');
    mistakes.push('Bouncing the resistance violently off the chest instead of utilizing a controlled eccentric stretch.');
    mistakes.push('Over-arching the lumbar spine and lifting glutes completely off the bench.');
  } else if (name.includes('squat')) {
    mistakes.push('Allowing knees to cave inward (valgus collapse) during the concentric drive phase.');
    mistakes.push('Shifting weight forward onto the toes and lifting heels off the floor.');
    mistakes.push('Rounding the lumbar spine in the hole instead of maintaining rigid abdominal bracing.');
  } else if (name.includes('deadlift')) {
    mistakes.push('Rounding the lumbar spine when breaking the bar off the floor.');
    mistakes.push('Letting the barbell drift away from the shins, drastically lengthening the moment arm.');
    mistakes.push('Hyperextending the spine at lockout instead of squeezing the glutes.');
  } else if (name.includes('curl')) {
    mistakes.push('Swinging the torso backward and using hip momentum to throw weights up.');
    mistakes.push('Allowing elbows to drift forward excessively, shifting tension away from the biceps to front delts.');
  } else if (name.includes('row')) {
    mistakes.push('Yanking with lower back momentum rather than initiating with active scapular retraction.');
    mistakes.push('Shrugging shoulders into the neck rather than pulling elbows down toward the hip pockets.');
  } else if (name.includes('raise') || name.includes('lateral')) {
    mistakes.push('Using excessive momentum and swinging the torso.');
    mistakes.push('Leading with the hands instead of elbows, engaging the upper traps excessively.');
  } else if (name.includes('push-up') || name.includes('pushup')) {
    mistakes.push('Allowing hips to sag and lumbar spine to hyperextend, losing core tension.');
    mistakes.push('Short-changing the range of motion by not bringing the chest close to the floor.');
  } else if (name.includes('dip')) {
    mistakes.push('Descending too deeply with flared elbows, hyperextending anterior shoulder capsules.');
    mistakes.push('Kicking the legs or swinging for momentum instead of clean vertical pressing.');
  } else {
    mistakes.push('Rushing through repetitions without a controlled 2-3 second eccentric tempo.');
    mistakes.push('Failing to brace core and breathing erratically during execution.');
  }

  return mistakes;
}

export function deriveDefaults(name, equipment, difficulty) {
  const n = name.toLowerCase();
  if (n.includes('deadlift') || n.includes('squat') || (n.includes('bench press') && equipment === 'BARBELL')) {
    return { defaultSets: 4, defaultReps: '5-8' };
  }
  if (n.includes('press') || n.includes('row') || n.includes('pulldown')) {
    return { defaultSets: 3, defaultReps: '8-10' };
  }
  if (n.includes('curl') || n.includes('extension') || n.includes('raise') || n.includes('fly')) {
    return { defaultSets: 3, defaultReps: '10-15' };
  }
  if (n.includes('push-up') || n.includes('crunch') || n.includes('plank')) {
    return { defaultSets: 3, defaultReps: '12-20' };
  }
  return { defaultSets: 3, defaultReps: '8-12' };
}

// Curated indispensable exercises to guarantee completeness & accurate machine taxonomy
export const CURATED_CANONICAL_EXERCISES = [
  // --- CHEST MACHINES & BENCH PRESSES ---
  {
    name: 'Barbell Bench Press',
    primaryMuscle: 'CHEST',
    secondaryMuscles: 'TRICEPS,SHOULDERS',
    equipment: 'BARBELL',
    difficulty: 'INTERMEDIATE',
    movementType: 'COMPOUND',
    chestRegion: 'Mid',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
    steps: [
      'Lie flat on the bench with eyes directly beneath the racked barbell. Plant feet flat and drive into the floor.',
      'Grip the bar just wider than shoulder-width with wrists straight. Retract and depress scapulae firmly against bench pad.',
      'Unrack the bar and stabilize it directly over sternum with locked elbows and braced core.',
      'Lower bar in controlled diagonal arc touching mid-sternum while maintaining 45 to 70 degree elbow angle.',
      'Drive bar forcefully up and slightly back toward shoulder joint line to full lockout.'
    ],
    defaultSets: 4,
    defaultReps: '6-8'
  },
  {
    name: 'Machine Chest Press',
    primaryMuscle: 'CHEST',
    secondaryMuscles: 'TRICEPS,SHOULDERS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'COMPOUND',
    chestRegion: 'Mid',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Bench_Press/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Machine_Bench_Press/0.jpg',
    steps: [
      'Adjust seat height so machine handles align with mid-chest level.',
      'Plant feet firmly flat on floor and press upper back and hips into backrest pad.',
      'Grasp handles with firm grip and press outward smoothly along fixed guided motion path until arms extend without elbow hyperextension.',
      'Pause for 1 second at peak pectoral contraction.',
      'Control eccentric return with 2-3s tempo back until chest reaches deep comfortable stretch.'
    ],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Incline Machine Chest Press',
    primaryMuscle: 'CHEST',
    secondaryMuscles: 'TRICEPS,SHOULDERS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'COMPOUND',
    chestRegion: 'Upper',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Incline_Chest_Press/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Incline_Chest_Press/0.jpg',
    steps: [
      'Adjust seat so handles sit right at upper clavicular chest level.',
      'Drive shoulder blades down and back against 30-degree angled backrest pad.',
      'Press handles upward and forward targeting upper pectoralis major.',
      'Squeeze upper chest hard at peak lockout.',
      'Lower weights slowly under controlled eccentric stretch.'
    ],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Decline Machine Chest Press',
    primaryMuscle: 'CHEST',
    secondaryMuscles: 'TRICEPS,SHOULDERS',
    equipment: 'MACHINE',
    difficulty: 'INTERMEDIATE',
    movementType: 'COMPOUND',
    chestRegion: 'Lower',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Decline_Chest_Press/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Decline_Chest_Press/0.jpg',
    steps: [
      'Sit in decline chest press machine with hips back against lumbar support pad.',
      'Grasp handles with neutral or pronated grip aligned with lower chest line.',
      'Press downward and forward along machine arc until arms are extended.',
      'Squeeze lower sternal head of chest at full extension.',
      'Return slowly to starting stretch position.'
    ],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Pec Deck (Machine Chest Fly)',
    primaryMuscle: 'CHEST',
    secondaryMuscles: 'SHOULDERS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    chestRegion: 'Mid',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Butterfly/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Butterfly/0.jpg',
    steps: [
      'Adjust seat so elbow pads or handles align horizontally with mid-sternum.',
      'Rest forearms against pads or hold handles with a slight soft bend in elbows.',
      'Squeeze chest muscles to bring pads/handles together in front of sternum in smooth arc.',
      'Hold peak isometric squeeze hard for 1-2 seconds.',
      'Return under complete control feeling deep pectoral eccentric stretch.'
    ],
    defaultSets: 3,
    defaultReps: '10-15'
  },
  // --- SHOULDER MACHINES ---
  {
    name: 'Machine Shoulder Press',
    primaryMuscle: 'SHOULDERS',
    secondaryMuscles: 'TRICEPS,TRAPS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'COMPOUND',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Shoulder_Military_Press/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Machine_Shoulder_Military_Press/0.jpg',
    steps: [
      'Adjust seat height so handles sit at ear height.',
      'Press back firmly against pad and brace core.',
      'Press handles straight overhead along machine track until arms extend.',
      'Pause briefly overhead without shrugging traps excessively.',
      'Lower weights smoothly down to ear level.'
    ],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Machine Lateral Raise',
    primaryMuscle: 'SHOULDERS',
    secondaryMuscles: 'TRAPS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400',
    steps: [
      'Sit upright on lateral raise machine with chest against support pad.',
      'Rest outer arms against padded levers with elbows bent at 90 degrees.',
      'Raise elbows outward and upward using lateral deltoids until upper arms reach parallel.',
      'Hold peak contraction at top for 1 full second.',
      'Slowly lower arms back to starting position resisting the weight stack.'
    ],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Rear Delt Machine (Reverse Pec Deck)',
    primaryMuscle: 'SHOULDERS',
    secondaryMuscles: 'BACK,TRAPS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Reverse_Machine_Flyes/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Reverse_Machine_Flyes/0.jpg',
    steps: [
      'Sit facing the pec deck machine pad with chest flat against backrest.',
      'Hold handles with neutral or pronated grip and elbows soft.',
      'Drive arms back horizontally in wide arc focusing purely on posterior deltoids.',
      'Contract rear delts hard at full retraction.',
      'Return slowly to forward starting position.'
    ],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  // --- BACK MACHINES ---
  {
    name: 'Plate-Loaded Lat Pulldown Machine',
    primaryMuscle: 'BACK',
    secondaryMuscles: 'BICEPS,FOREARMS,SHOULDERS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'COMPOUND',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_High_Row/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_High_Row/0.jpg',
    steps: [
      'Adjust thigh pad snug against tops of thighs while sitting on seat.',
      'Grasp divergent handles with wide overhead grip.',
      'Pull handles downward and inward driving elbows towards hip pockets.',
      'Squeeze lats tight at bottom of stroke.',
      'Allow handles to travel back up fully stretching latissimus dorsi.'
    ],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Seated Machine Row',
    primaryMuscle: 'BACK',
    secondaryMuscles: 'BICEPS,TRAPS,FOREARMS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'COMPOUND',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leverage_Iso_Row/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leverage_Iso_Row/0.jpg',
    steps: [
      'Adjust chest pad so arms can reach handles with full forward extension.',
      'Sit upright, brace chest against pad, and grab handles.',
      'Retract shoulder blades and pull elbows back past torso.',
      'Squeeze rhomboids and middle back muscles firmly.',
      'Extend arms slowly back to full forward stretch.'
    ],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Chest-Supported T-Bar Row Machine',
    primaryMuscle: 'BACK',
    secondaryMuscles: 'BICEPS,TRAPS,FOREARMS',
    equipment: 'MACHINE',
    difficulty: 'INTERMEDIATE',
    movementType: 'COMPOUND',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_T-Bar_Row/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Lying_T-Bar_Row/0.jpg',
    steps: [
      'Lie face down on inclined chest support pad with feet hooked securely on platform.',
      'Grasp T-bar handles with overhand or neutral grip.',
      'Pull elbows up and back driving through upper back and lats without lifting chest off pad.',
      'Hold contraction at the top for 1 second.',
      'Lower weight under complete control.'
    ],
    defaultSets: 4,
    defaultReps: '8-10'
  },
  {
    name: 'Assisted Pull-Up Machine',
    primaryMuscle: 'BACK',
    secondaryMuscles: 'BICEPS,FOREARMS,ABS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'COMPOUND',
    mediaUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    steps: [
      'Select counterweight counter-balance on weight stack.',
      'Kneel or stand on assisted lever platform and grasp pull-up bars with wide grip.',
      'Pull chest up towards bar by driving elbows down to sides.',
      'Pause at peak chin-over-bar position.',
      'Lower body slowly until arms reach full extension.'
    ],
    defaultSets: 3,
    defaultReps: '6-10'
  },
  {
    name: 'Assisted Dip Machine',
    primaryMuscle: 'CHEST',
    secondaryMuscles: 'TRICEPS,SHOULDERS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'COMPOUND',
    chestRegion: 'Lower',
    mediaUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
    steps: [
      'Select desired assist weight on machine stack.',
      'Mount platform and grip dip bars with palms facing inward.',
      'Lean slightly forward to bias lower chest fibers.',
      'Lower body until elbows reach 90 degrees.',
      'Press forcefully through palms back to locked out arm position.'
    ],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  {
    name: 'Back Extension Machine',
    primaryMuscle: 'BACK',
    secondaryMuscles: 'GLUTES,HAMSTRINGS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    steps: [
      'Sit on back extension machine with feet flat on footrest and pad positioned against upper back.',
      'Cross arms across chest or hold handles.',
      'Push back against pad using spinal erectors until spine is in neutral upright alignment.',
      'Hold contraction for 1 second.',
      'Return slowly to forward flexed stretch position.'
    ],
    defaultSets: 3,
    defaultReps: '10-15'
  },
  // --- QUAD & LEG MACHINES ---
  {
    name: '45-Degree Leg Press',
    primaryMuscle: 'QUADS',
    secondaryMuscles: 'GLUTES,HAMSTRINGS,CALVES',
    equipment: 'MACHINE',
    difficulty: 'INTERMEDIATE',
    movementType: 'COMPOUND',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Press/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Press/0.jpg',
    steps: [
      'Sit into 45-degree sled press with lower back and hips firmly planted against backrest.',
      'Place feet shoulder-width apart in middle of sled footplate.',
      'Disengage safety locks and lower sled slowly until knees bend to 90 degrees.',
      'Drive forcefully through mid-foot and heels to press sled back up without hyperextending knees.'
    ],
    defaultSets: 4,
    defaultReps: '8-12'
  },
  {
    name: 'Horizontal Leg Press Machine',
    primaryMuscle: 'QUADS',
    secondaryMuscles: 'GLUTES,HAMSTRINGS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'COMPOUND',
    mediaUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
    steps: [
      'Sit in seated horizontal leg press machine with back pad adjusted so knees start at 90 degrees.',
      'Place feet flat on footplate shoulder-width apart.',
      'Press platform horizontally away until legs are fully extended.',
      'Pause and slowly return seat sled back to starting stack position.'
    ],
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Vertical Leg Press Machine',
    primaryMuscle: 'QUADS',
    secondaryMuscles: 'GLUTES,HAMSTRINGS',
    equipment: 'MACHINE',
    difficulty: 'ADVANCED',
    movementType: 'COMPOUND',
    mediaUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1434682881908-b43d0467b798?w=400',
    steps: [
      'Lie flat on back on floor pad with legs extended directly upward toward vertical carriage.',
      'Place feet shoulder-width flat on platform.',
      'Unlock safeties and lower carriage straight down towards chest with strict control.',
      'Press carriage straight up using quads and glutes.'
    ],
    defaultSets: 3,
    defaultReps: '8-10'
  },
  {
    name: 'Hack Squat Machine',
    primaryMuscle: 'QUADS',
    secondaryMuscles: 'GLUTES,HAMSTRINGS,CALVES',
    equipment: 'MACHINE',
    difficulty: 'INTERMEDIATE',
    movementType: 'COMPOUND',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Hack_Squat/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Hack_Squat/0.jpg',
    steps: [
      'Position shoulders under padded shoulder rests with back flat against sled pad.',
      'Place feet shoulder-width on platform slightly forward to bias quadriceps.',
      'Release safety levers and squat down until thighs are parallel to footplate.',
      'Drive through mid-foot and heels to return sled to upright starting position.'
    ],
    defaultSets: 4,
    defaultReps: '8-12'
  },
  {
    name: 'Smith Machine Squat',
    primaryMuscle: 'QUADS',
    secondaryMuscles: 'GLUTES,HAMSTRINGS',
    equipment: 'SMITH_MACHINE',
    difficulty: 'INTERMEDIATE',
    movementType: 'COMPOUND',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Smith_Machine_Squat/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Smith_Machine_Squat/0.jpg',
    steps: [
      'Position bar on upper traps across shoulders inside Smith machine frame.',
      'Place feet slightly out in front of hips to maximize knee flexion and quad recruitment.',
      'Rotate bar off safety hooks and descend into deep squat until hips break parallel.',
      'Drive straight up against the guided vertical track.'
    ],
    defaultSets: 4,
    defaultReps: '8-10'
  },
  {
    name: 'Leg Extension Machine',
    primaryMuscle: 'QUADS',
    secondaryMuscles: 'CALVES',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Leg_Extensions/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Leg_Extensions/0.jpg',
    steps: [
      'Adjust back pad so knees align directly with machine pivot axis.',
      'Hook shins behind padded lever arm just above ankles.',
      'Extend legs upward until knees are straight, squeezing rectus femoris hard at peak lockout.',
      'Hold contraction for 1 second.',
      'Lower weights smoothly through 2-3s eccentric return.'
    ],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  // --- HAMSTRING MACHINES ---
  {
    name: 'Seated Leg Curl Machine',
    primaryMuscle: 'HAMSTRINGS',
    secondaryMuscles: 'CALVES',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Leg_Curl/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Leg_Curl/0.jpg',
    steps: [
      'Adjust thigh hold-down pad tight against quadriceps to prevent hip lift.',
      'Position lower leg pad against Achilles tendon behind ankles.',
      'Curl heels downward and back toward seat squeezing hamstrings hard.',
      'Pause at full flexion.',
      'Slowly extend legs back to starting stretch position.'
    ],
    defaultSets: 3,
    defaultReps: '10-15'
  },
  {
    name: 'Lying Leg Curl Machine',
    primaryMuscle: 'HAMSTRINGS',
    secondaryMuscles: 'CALVES',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Lying_Leg_Curls/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Lying_Leg_Curls/0.jpg',
    steps: [
      'Lie face down on contoured bench with knee caps just off bottom of pad.',
      'Position lever pad against lower calves/Achilles tendon.',
      'Grip side handles and curl heels up toward glutes without arching lower back.',
      'Squeeze hamstrings at the top.',
      'Lower weight smoothly under control.'
    ],
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Standing Leg Curl Machine',
    primaryMuscle: 'HAMSTRINGS',
    secondaryMuscles: 'CALVES',
    equipment: 'MACHINE',
    difficulty: 'INTERMEDIATE',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Leg_Curl/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Leg_Curl/0.jpg',
    steps: [
      'Stand facing machine with front of thigh against support pad.',
      'Place back of active ankle against roller pad.',
      'Curl lower leg up toward glute while keeping working hip forward.',
      'Hold peak squeeze for 1 second.',
      'Lower slowly back to straight leg position and switch sides.'
    ],
    defaultSets: 3,
    defaultReps: '10-12'
  },
  // --- GLUTE & HIP MACHINES ---
  {
    name: 'Hip Abduction Machine',
    primaryMuscle: 'GLUTES',
    secondaryMuscles: 'QUADS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Abductor/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Thigh_Abductor/0.jpg',
    steps: [
      'Sit in machine with pads resting against outer knees and thighs.',
      'Press knees outward against pads spreading legs wide against stack resistance.',
      'Squeeze gluteus medius and minimus hard at full abduction.',
      'Slowly return knees together without letting weight stack touch down.'
    ],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Hip Adduction Machine',
    primaryMuscle: 'QUADS',
    secondaryMuscles: 'GLUTES',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Thigh_Adductor/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Thigh_Adductor/0.jpg',
    steps: [
      'Sit in machine with pads positioned against inner knees and thighs.',
      'Open legs to comfortable wide stretch.',
      'Squeeze inner thighs together driving knees inward until pads touch.',
      'Hold contraction for 1 second.',
      'Control eccentric spread back to start.'
    ],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Glute Kickback Machine',
    primaryMuscle: 'GLUTES',
    secondaryMuscles: 'HAMSTRINGS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    steps: [
      'Position chest and forearms on support pads with working foot hooked on lever footplate.',
      'Drive foot straight back and up contracting gluteus maximus.',
      'Squeeze glute hard at top of kick.',
      'Return knee slowly forward under control.'
    ],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Plate-Loaded Hip Thrust Machine',
    primaryMuscle: 'GLUTES',
    secondaryMuscles: 'HAMSTRINGS,QUADS',
    equipment: 'MACHINE',
    difficulty: 'INTERMEDIATE',
    movementType: 'COMPOUND',
    mediaUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
    steps: [
      'Sit into hip thrust machine with upper back on pivot bench and strap/lever secured across hips.',
      'Plant feet flat shoulder-width on platform.',
      'Drive through heels to extend hips fully upward to neutral horizontal lock.',
      'Squeeze glutes hard at the top without hyperextending lumbar spine.',
      'Lower hips back down with controlled cadence.'
    ],
    defaultSets: 4,
    defaultReps: '8-12'
  },
  // --- CALF MACHINES ---
  {
    name: 'Seated Calf Raise Machine',
    primaryMuscle: 'CALVES',
    secondaryMuscles: '',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Seated_Calf_Raise/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Seated_Calf_Raise/0.jpg',
    steps: [
      'Sit on machine with balls of feet on foot bar and thigh pads resting over lower thighs.',
      'Release safety bar and lower heels as far as comfortable for deep soleus stretch.',
      'Drive through balls of feet lifting heels as high as possible into full plantarflexion.',
      'Hold contraction at the top for 1-2 seconds.',
      'Lower slowly back to deep stretch.'
    ],
    defaultSets: 4,
    defaultReps: '12-15'
  },
  {
    name: 'Standing Calf Raise Machine',
    primaryMuscle: 'CALVES',
    secondaryMuscles: '',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Standing_Calf_Raises/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Standing_Calf_Raises/0.jpg',
    steps: [
      'Stand with balls of feet on step block and shoulder pads resting comfortably across shoulders.',
      'Lower heels below platform level for complete gastrocnemius stretch.',
      'Push forcefully through toes raising body straight up.',
      'Pause at peak calf contraction.',
      'Lower under complete control.'
    ],
    defaultSets: 4,
    defaultReps: '10-15'
  },
  {
    name: 'Calf Press on Leg Press Machine',
    primaryMuscle: 'CALVES',
    secondaryMuscles: '',
    equipment: 'MACHINE',
    difficulty: 'INTERMEDIATE',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Calf_Press_On_The_Leg_Press_Machine/0.jpg',
    steps: [
      'Sit into leg press machine with legs almost fully extended.',
      'Place balls of feet on bottom edge of footplate with heels hanging free.',
      'Press sled forward using ankles only.',
      'Hold peak squeeze for 1 second.',
      'Allow toes to flex backward for deep calf stretch without bending knees.'
    ],
    defaultSets: 4,
    defaultReps: '12-15'
  },
  // --- ARM MACHINES ---
  {
    name: 'Preacher Curl Machine',
    primaryMuscle: 'BICEPS',
    secondaryMuscles: 'FOREARMS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Preacher_Curls/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Machine_Preacher_Curls/0.jpg',
    steps: [
      'Sit into preacher machine with armpits resting snug at top of preacher pad.',
      'Grip handles with palms facing upward.',
      'Curl handles upward toward shoulders isolating biceps brachii.',
      'Squeeze biceps hard at peak flexion.',
      'Lower handles back down until arms are nearly fully extended.'
    ],
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Triceps Extension Machine',
    primaryMuscle: 'TRICEPS',
    secondaryMuscles: 'FOREARMS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Machine_Triceps_Extension/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Machine_Triceps_Extension/0.jpg',
    steps: [
      'Sit with upper arms resting flat on angled support pad.',
      'Grasp handles with neutral or overhand grip.',
      'Extend arms downward pushing handles forward until elbows lock out.',
      'Contract triceps heads intensely at bottom of stroke.',
      'Slowly allow handles to rise back to starting 90-degree elbow bend.'
    ],
    defaultSets: 3,
    defaultReps: '10-12'
  },
  {
    name: 'Triceps Dip Machine',
    primaryMuscle: 'TRICEPS',
    secondaryMuscles: 'CHEST,SHOULDERS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'COMPOUND',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Dip_Machine/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Dip_Machine/0.jpg',
    steps: [
      'Sit upright with back against pad and grip handles beside hips.',
      'Lock thighs under support roller pads.',
      'Press handles down by extending elbows until arms are straight.',
      'Hold contraction at the bottom for 1 second.',
      'Return slowly to chest height.'
    ],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  // --- CORE & ABS MACHINES ---
  {
    name: 'Ab Crunch Machine',
    primaryMuscle: 'ABS',
    secondaryMuscles: '',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/Ab_Crunch_Machine/0.jpg',
    thumbnailUrl: 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/Ab_Crunch_Machine/0.jpg',
    steps: [
      'Sit in ab machine with feet hooked behind ankle rollers and hands grasping chest/shoulder handles.',
      'Exhale and contract abdominal wall curling torso forward bringing ribs toward pelvis.',
      'Hold peak isometric abdominal contraction for 1-2 seconds.',
      'Slowly return to upright position while inhaling.'
    ],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Torso Rotation Machine',
    primaryMuscle: 'ABS',
    secondaryMuscles: '',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    movementType: 'ISOLATION',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
    steps: [
      'Sit in rotary torso machine with knees hooked securely against thigh pads.',
      'Hold chest handles with spine tall.',
      'Rotate torso smoothly to one side by contracting internal and external obliques.',
      'Pause at peak rotation for 1 second.',
      'Return under control to center and repeat on opposite side.'
    ],
    defaultSets: 3,
    defaultReps: '12-15'
  }
];

export async function run() {
  console.log('--- FitTrack Exercise Library Importer Starting ---');

  // 1. Fetch free-exercise-db dataset
  let rawDataset = [];
  try {
    console.log(`Fetching open dataset from: ${DATASET_URL}`);
    const res = await fetch(DATASET_URL);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    rawDataset = await res.json();
    console.log(`Successfully fetched ${rawDataset.length} exercises from free-exercise-db.`);
  } catch (err) {
    console.warn(`Dataset fetch failed (${err.message}). Using local backup if present.`);
    const backupPath = path.resolve('backend/src/main/resources/data/exercises_seed.json');
    if (fs.existsSync(backupPath)) {
      rawDataset = JSON.parse(fs.readFileSync(backupPath, 'utf-8'));
      console.log(`Loaded ${rawDataset.length} exercises from local backup.`);
    }
  }

  const processed = [];
  const seenNames = new Set();

  function registerExercise(ex) {
    const key = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenNames.has(key)) return false;
    seenNames.add(key);
    processed.push(ex);
    return true;
  }

  // A. First register all curated canonical exercises
  for (const item of CURATED_CANONICAL_EXERCISES) {
    const primaryGroup = normalizeMuscle(item.primaryMuscle);
    const secList = (item.secondaryMuscles || '').split(',').map(normalizeMuscle).filter(m => m !== primaryGroup && m.length > 0);
    const uniqueSec = [...new Set(secList)];
    const equip = normalizeEquipment(item.equipment, item.name);
    const mvType = item.movementType || deriveMovementType(item.name, primaryGroup, equip);
    const chRegion = item.chestRegion || deriveChestRegion(item.name, primaryGroup);

    registerExercise({
      id: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: item.name,
      primaryMuscle: primaryGroup,
      primaryMuscles: [primaryGroup],
      secondaryMuscles: uniqueSec.join(','),
      secondaryMusclesList: uniqueSec,
      equipment: equip,
      difficulty: item.difficulty || 'INTERMEDIATE',
      movementType: mvType,
      chestRegion: chRegion,
      mediaUrl: item.mediaUrl || null,
      thumbnailUrl: item.thumbnailUrl || null,
      steps: item.steps,
      mistakes: deriveMistakes({ name: item.name }),
      defaultSets: item.defaultSets || 3,
      defaultReps: item.defaultReps || '8-12',
      formTips: item.steps[0] || 'Maintain controlled form throughout range.',
      isCustom: false,
      attribution: 'FitTrack Core Canonical Library & Anatomy Standard (CC0 / Public Domain)'
    });
  }

  // B. Process and merge open dataset exercises
  for (const item of rawDataset) {
    let cleanName = (item.name || '').trim();
    if (!cleanName) continue;

    // Fix specific known tagging issues in raw dataset
    let overridePrimary = null;
    let overrideSecondary = null;
    let overrideChestRegion = null;

    const lower = cleanName.toLowerCase();
    if (lower === 'close-grip dumbbell press') {
      overridePrimary = 'CHEST';
      overrideSecondary = ['TRICEPS', 'SHOULDERS'];
      overrideChestRegion = 'Inner';
    } else if (lower === 'close-grip barbell bench press') {
      overridePrimary = 'CHEST';
      overrideSecondary = ['TRICEPS', 'SHOULDERS'];
      overrideChestRegion = 'Inner';
    } else if (lower.includes('diamond push-up') || lower.includes('diamond push up')) {
      overridePrimary = 'CHEST';
      overrideSecondary = ['TRICEPS', 'SHOULDERS', 'ABS'];
      overrideChestRegion = 'Inner';
    } else if (lower.includes('chest dip')) {
      overridePrimary = 'CHEST';
      overrideSecondary = ['TRICEPS', 'SHOULDERS'];
      overrideChestRegion = 'Lower';
    } else if (lower === 'cable incline pushdown') {
      overridePrimary = 'TRICEPS';
      overrideSecondary = ['FOREARMS'];
    } else if (lower === 'backward drag') {
      overridePrimary = 'QUADS';
      overrideSecondary = ['CALVES', 'HAMSTRINGS'];
    } else if (lower === 'low pulley row to neck') {
      overridePrimary = 'BACK';
      overrideSecondary = ['SHOULDERS', 'BICEPS'];
    } else if (lower === 'split squats') {
      overridePrimary = 'QUADS';
      overrideSecondary = ['HAMSTRINGS', 'GLUTES', 'CALVES'];
    } else if (lower === 'scapular pull-up') {
      overridePrimary = 'BACK';
      overrideSecondary = ['TRAPS', 'BICEPS'];
    }

    const rawPrimary = item.primaryMuscles?.[0] || item.primaryMuscle || 'CHEST';
    const primaryGroup = overridePrimary || normalizeMuscle(rawPrimary);

    let rawSecList = item.secondaryMusclesList || item.secondaryMuscles || [];
    if (typeof rawSecList === 'string') rawSecList = rawSecList.split(',');
    let secList = (overrideSecondary || rawSecList).map(normalizeMuscle).filter(m => m !== primaryGroup && m.length > 0);
    const uniqueSec = [...new Set(secList)];

    const equipment = normalizeEquipment(item.equipment, cleanName);
    const difficulty = normalizeDifficulty(item.level || item.difficulty);
    const movementType = item.movementType || deriveMovementType(cleanName, primaryGroup, equipment);
    const chestRegion = overrideChestRegion || item.chestRegion || deriveChestRegion(cleanName, primaryGroup);

    const images = item.images || [];
    let mediaUrl = item.mediaUrl || (images.length > 0 ? `${RAW_MEDIA_BASE}${images[0]}` : null);
    let thumbnailUrl = item.thumbnailUrl || (images.length > 0 ? `${CDN_MEDIA_BASE}${images[0]}` : null);

    const steps = (item.instructions && item.instructions.length > 0)
      ? item.instructions
      : (item.steps && item.steps.length > 0)
        ? item.steps
        : [
            `Assume correct posture and stable base using ${equipment.toLowerCase().replace('_', ' ')}.`,
            `Initiate movement smoothly targeting the ${primaryGroup.toLowerCase()}.`,
            `Reach peak contraction, pause for 1 second, and return through eccentric stretch with 2-3s control.`
          ];

    const mistakes = (item.mistakes && item.mistakes.length > 0)
      ? item.mistakes
      : deriveMistakes({ name: cleanName });

    const defaults = deriveDefaults(cleanName, equipment, difficulty);

    registerExercise({
      id: item.id || cleanName.toLowerCase().replace(/[^a-z0-9]+/g, '_'),
      name: cleanName,
      primaryMuscle: primaryGroup,
      primaryMuscles: [primaryGroup],
      secondaryMuscles: uniqueSec.join(','),
      secondaryMusclesList: uniqueSec,
      equipment,
      difficulty,
      movementType,
      chestRegion,
      mediaUrl,
      thumbnailUrl,
      steps,
      mistakes,
      defaultSets: item.defaultSets || defaults.defaultSets,
      defaultReps: item.defaultReps || defaults.defaultReps,
      formTips: steps[0] || 'Maintain proper posture and steady breathing.',
      isCustom: false,
      attribution: item.attribution || 'Open dataset by free-exercise-db (The Unlicense / Public Domain).'
    });
  }

  console.log(`\n=== IMPORT SUMMARY ===`);
  console.log(`Total Deduplicated Exercises: ${processed.length}`);

  const counts = {};
  for (const ex of processed) {
    counts[ex.primaryMuscle] = (counts[ex.primaryMuscle] || 0) + 1;
  }
  console.log('Count per Muscle Group:');
  console.table(counts);

  const equipCounts = {};
  for (const ex of processed) {
    equipCounts[ex.equipment] = (equipCounts[ex.equipment] || 0) + 1;
  }
  console.log('Count per Equipment:');
  console.table(equipCounts);

  // 1. Write full exercises_seed.json
  const outDir = path.resolve('backend/src/main/resources/data');
  if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
  const jsonPath = path.join(outDir, 'exercises_seed.json');
  fs.writeFileSync(jsonPath, JSON.stringify(processed, null, 2), 'utf-8');
  console.log(`\nWritten full JSON library (${processed.length} exercises) to: ${jsonPath}`);

  // 2. Generate Flyway migration V6
  const migDir = path.resolve('backend/src/main/resources/db/migration');
  if (!fs.existsSync(migDir)) fs.mkdirSync(migDir, { recursive: true });
  const v6SqlPath = path.join(migDir, 'V6__fix_equipment_taxonomy_and_machine_exercises.sql');

  const sqlLines = [
    '-- V6__fix_equipment_taxonomy_and_machine_exercises.sql',
    '-- Fix equipment taxonomy: Barbell, Dumbbell, Kettlebell, Machine, Cable, Smith Machine, Bodyweight, Band, Other',
    '-- Fix tagging bugs and guarantee complete machine exercise suite',
    ''
  ];

  for (const ex of processed) {
    const nameEsc = ex.name.replace(/'/g, "''");
    const secEsc = ex.secondaryMuscles.replace(/'/g, "''");
    const mediaEsc = ex.mediaUrl ? `'${ex.mediaUrl.replace(/'/g, "''")}'` : 'NULL';
    const thumbEsc = ex.thumbnailUrl ? `'${ex.thumbnailUrl.replace(/'/g, "''")}'` : 'NULL';
    const tipsEsc = (ex.formTips || '').replace(/'/g, "''");
    const attrEsc = (ex.attribution || '').replace(/'/g, "''");
    const stepsJson = JSON.stringify(ex.steps).replace(/'/g, "''");
    const mistakesJson = JSON.stringify(ex.mistakes).replace(/'/g, "''");
    const mvType = ex.movementType || 'COMPOUND';
    const chRegion = ex.chestRegion ? `'${ex.chestRegion}'` : 'NULL';

    sqlLines.push(
      `MERGE INTO exercises (name, primary_muscle, secondary_muscles, equipment, difficulty, movement_type, chest_region, media_url, thumbnail_url, form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution)` +
      ` KEY(name) VALUES ('${nameEsc}', '${ex.primaryMuscle}', '${secEsc}', '${ex.equipment}', '${ex.difficulty}', '${mvType}', ${chRegion}, ${mediaEsc}, ${thumbEsc}, '${tipsEsc}', '${stepsJson}', '${mistakesJson}', ${ex.defaultSets}, '${ex.defaultReps}', FALSE, '${attrEsc}');`
    );
  }

  fs.writeFileSync(v6SqlPath, sqlLines.join('\n'), 'utf-8');
  console.log(`Written Flyway migration V6 (${processed.length} exercises) to: ${v6SqlPath}`);
  console.log('--- Import Complete Successfully ---');
}

// Run if called directly
run().catch(err => {
  console.error('Fatal error during import:', err);
  process.exit(1);
});
