import fs from 'fs';
import path from 'path';

// Free Exercise DB open dataset URL
const DATASET_URL = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/dist/exercises.json';

// Configurable media base URLs
const RAW_MEDIA_BASE = 'https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises/';
const CDN_MEDIA_BASE = 'https://cdn.jsdelivr.net/gh/yuhonas/free-exercise-db@main/exercises/';

// Target 11 muscle groups + Traps + Cardio
// CHEST, BACK, SHOULDERS, BICEPS, TRICEPS, FOREARMS, ABS, GLUTES, QUADS, HAMSTRINGS, CALVES, TRAPS
function normalizeMuscle(raw) {
  if (!raw) return 'CHEST';
  const m = raw.toLowerCase().trim();
  if (m.includes('chest') || m.includes('pec')) return 'CHEST';
  if (m.includes('lat') || m.includes('middle back') || m.includes('lower back') || m.includes('lats') || m.includes('back')) return 'BACK';
  if (m.includes('shoulder') || m.includes('delt')) return 'SHOULDERS';
  if (m.includes('bicep')) return 'BICEPS';
  if (m.includes('tricep')) return 'TRICEPS';
  if (m.includes('forearm') || m.includes('wrist')) return 'FOREARMS';
  if (m.includes('abdom') || m.includes('ab') || m.includes('core') || m.includes('oblique')) return 'ABS';
  if (m.includes('glute')) return 'GLUTES';
  if (m.includes('quad') || m.includes('quadriceps')) return 'QUADRICEPS';
  if (m.includes('hamstring')) return 'HAMSTRINGS';
  if (m.includes('calve') || m.includes('calf')) return 'CALVES';
  if (m.includes('trap')) return 'TRAPS';
  if (m.includes('adductor') || m.includes('abductor')) return 'QUADRICEPS'; // inner/outer thigh
  if (m.includes('cardio')) return 'CARDIO';
  return 'BACK';
}

function normalizeEquipment(raw) {
  if (!raw) return 'BODYWEIGHT';
  const eq = raw.toLowerCase().trim();
  if (eq.includes('barbell')) return 'BARBELL';
  if (eq.includes('dumbbell')) return 'DUMBBELL';
  if (eq.includes('cable')) return 'CABLE';
  if (eq.includes('machine')) return 'MACHINE';
  if (eq.includes('body') || eq.includes('none')) return 'BODYWEIGHT';
  if (eq.includes('kettlebell')) return 'KETTLEBELL';
  if (eq.includes('e-z') || eq.includes('ez')) return 'EZ_BAR';
  if (eq.includes('smith')) return 'SMITH_MACHINE';
  return 'MACHINE';
}

function normalizeDifficulty(raw) {
  if (!raw) return 'INTERMEDIATE';
  const d = raw.toLowerCase().trim();
  if (d.includes('begin')) return 'BEGINNER';
  if (d.includes('adv') || d.includes('expert')) return 'ADVANCED';
  return 'INTERMEDIATE';
}

function deriveMistakes(exercise) {
  const name = exercise.name.toLowerCase();
  const muscle = exercise.primaryMuscles[0] || '';
  const mistakes = [];

  if (name.includes('press') || name.includes('bench')) {
    mistakes.push('Flaring elbows outward beyond 75 degrees, placing excess strain on the rotator cuff.');
    mistakes.push('Arching the lower back excessively or lifting hips completely off the bench.');
    mistakes.push('Bouncing the barbell or dumbbells off the ribcage instead of controlling the turnaround.');
  } else if (name.includes('squat')) {
    mistakes.push('Allowing knees to cave inward (valgus collapse) during the upward drive phase.');
    mistakes.push('Lifting heels off the ground and shifting weight excessively onto toes.');
    mistakes.push('Rounding the lumbar spine at the bottom instead of maintaining neutral spinal bracing.');
  } else if (name.includes('deadlift')) {
    mistakes.push('Rounding the lower back when breaking the bar off the floor.');
    mistakes.push('Letting the barbell drift far away from shins during the pull.');
    mistakes.push('Hyperextending the lower back at lockout rather than squeezing glutes through.');
  } else if (name.includes('curl')) {
    mistakes.push('Swinging the hips and torso backward to generate momentum.');
    mistakes.push('Letting elbows flare forward rather than staying pinned close to ribs.');
    mistakes.push('Short-changing the stretch at the bottom without full elbow extension.');
  } else if (name.includes('row')) {
    mistakes.push('Yanking with lower back momentum rather than initiating with scapular retraction.');
    mistakes.push('Shrugging shoulders into the neck instead of driving elbows back towards hip pocket.');
  } else if (name.includes('raise') || name.includes('lateral')) {
    mistakes.push('Using overly heavy resistance and swinging the upper body.');
    mistakes.push('Raising hands higher than elbows, shifting tension to the upper traps.');
  } else if (name.includes('extension') || name.includes('pushdown')) {
    mistakes.push('Allowing upper arms to drift forward and backward during reps.');
    mistakes.push('Failing to lock out triceps fully at peak contraction.');
  } else if (name.includes('lunge') || name.includes('split squat')) {
    mistakes.push('Letting front knee collapse inwards or driving solely through toes.');
    mistakes.push('Leaning aggressively sideways instead of keeping pelvis squared.');
  } else if (name.includes('crunch') || name.includes('leg raise') || name.includes('sit-up')) {
    mistakes.push('Pulling on the neck with hands instead of flexing the spine using abdominal contraction.');
    mistakes.push('Swinging legs using hip flexor momentum rather than rolling the pelvis.');
  } else {
    mistakes.push('Using rapid momentum rather than a 2-second controlled eccentric tempo.');
    mistakes.push('Neglecting core bracing throughout the full range of motion.');
  }

  return mistakes;
}

const CHECKLIST_EXERCISES = [
  // CHEST
  {
    name: 'Barbell Bench Press',
    primaryMuscle: 'CHEST',
    secondaryMuscles: 'TRICEPS,SHOULDERS',
    equipment: 'BARBELL',
    difficulty: 'INTERMEDIATE',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
    steps: [
      'Lie flat on the bench with eyes directly under the racked bar. Plant feet firmly on the floor.',
      'Grip the bar slightly wider than shoulder-width with thumbs wrapped securely.',
      'Unrack the bar, retract and depress your scapulae, and bring bar directly over upper chest.',
      'Lower the bar with controlled tempo to touch your mid-to-lower sternum with elbows tucked at 45-75 degrees.',
      'Press powerfully upward driving through your chest and triceps back to starting position.'
    ],
    mistakes: [
      'Bouncing the bar violently off the sternum.',
      'Flaring elbows outward 90 degrees risking shoulder impingement.',
      'Lifting glutes off the bench to cheat leverage.'
    ],
    defaultSets: 4,
    defaultReps: '6-8'
  },
  {
    name: 'Incline Dumbbell Press',
    primaryMuscle: 'CHEST',
    secondaryMuscles: 'SHOULDERS,TRICEPS',
    equipment: 'DUMBBELL',
    difficulty: 'INTERMEDIATE',
    mediaUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    steps: [
      'Set an adjustable bench to an incline of 30 degrees (avoid steep 45+ degree angles).',
      'Kick dumbbells up to shoulder level using your knees as you lie back.',
      'Press dumbbells up in a slight arc until arms are extended but not hyper-locked.',
      'Lower weights smoothly until you feel an active stretch in the upper clavicular pectoralis.',
      'Press back up while driving your feet through the floor and keeping ribcage proud.'
    ],
    mistakes: [
      'Setting bench angle too high (>45°), turning it into a front delt press.',
      'Clanking dumbbells together at the top losing muscular tension.'
    ],
    defaultSets: 3,
    defaultReps: '8-12'
  },
  // BACK
  {
    name: 'Conventional Barbell Deadlift',
    primaryMuscle: 'BACK',
    secondaryMuscles: 'HAMSTRINGS,GLUTES,FOREARMS,TRAPS',
    equipment: 'BARBELL',
    difficulty: 'ADVANCED',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
    steps: [
      'Stand with mid-foot directly under the barbell, feet hip-width apart.',
      'Hinge at hips, grip the bar just outside your knees with double overhand or hook grip.',
      'Bring shins to touch the bar without moving it. Pull chest up, retract lats to pull out slack.',
      'Take a deep diaphragmatic breath, brace core 360 degrees, and push floor away with your legs.',
      'Lock out hips and knees simultaneously. Reverse movement by hinging hips back.'
    ],
    mistakes: [
      'Rounding the lumbar spine under heavy loads.',
      'Letting the bar drift forward away from shins and thighs.',
      'Hyperextending the lumbar spine at lockout.'
    ],
    defaultSets: 4,
    defaultReps: '5'
  },
  {
    name: 'Lat Pulldown',
    primaryMuscle: 'BACK',
    secondaryMuscles: 'BICEPS,FOREARMS,SHOULDERS',
    equipment: 'CABLE',
    difficulty: 'BEGINNER',
    mediaUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400',
    steps: [
      'Adjust thigh pads so your legs are locked securely with flat feet.',
      'Grip the bar slightly wider than shoulder width with an overhand grip.',
      'Lean back slightly (10-15 degrees), depress your shoulder blades, and pull elbows straight down towards ribs.',
      'Touch the bar to your upper chest while squeezing the latissimus dorsi.',
      'Control the return upward with a 2-second stretch at the top.'
    ],
    mistakes: [
      'Swinging backward with momentum to yank the weight down.',
      'Pulling the bar behind the neck, causing excessive cervical spine strain.'
    ],
    defaultSets: 3,
    defaultReps: '10-12'
  },
  // TRAPS
  {
    name: 'Barbell Shrug',
    primaryMuscle: 'TRAPS',
    secondaryMuscles: 'FOREARMS',
    equipment: 'BARBELL',
    difficulty: 'BEGINNER',
    mediaUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400',
    steps: [
      'Stand upright holding a barbell at shoulder width in front of your thighs.',
      'Keep arms straight without bending elbows.',
      'Elevate your shoulders straight up toward your ears in a pure vertical plane.',
      'Hold the peak contraction for 1-2 seconds, then lower under full control.'
    ],
    mistakes: [
      'Rolling shoulders in circular motions which creates rotator cuff friction without extra trap loading.',
      'Bending elbows to pull weight up.'
    ],
    defaultSets: 4,
    defaultReps: '12-15'
  },
  {
    name: 'Farmer\'s Walk',
    primaryMuscle: 'TRAPS',
    secondaryMuscles: 'FOREARMS,ABS,GLUTES',
    equipment: 'DUMBBELL',
    difficulty: 'INTERMEDIATE',
    mediaUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400',
    steps: [
      'Deadlift heavy dumbbells or kettlebells from the floor with neutral posture.',
      'Keep chest tall, shoulders packed down and back, and core braced tight.',
      'Walk forward with steady, short, controlled heel-to-toe strides for 30-60 seconds.',
      'Lower weights safely with a clean hip hinge.'
    ],
    mistakes: [
      'Allowing shoulders to slump forward or hunching neck.',
      'Taking long, unstable strides that compromise spinal alignment.'
    ],
    defaultSets: 3,
    defaultReps: '40m walk'
  },
  // FOREARMS
  {
    name: 'Barbell Wrist Curl',
    primaryMuscle: 'FOREARMS',
    secondaryMuscles: 'BICEPS',
    equipment: 'BARBELL',
    difficulty: 'BEGINNER',
    mediaUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    steps: [
      'Sit on a bench resting your forearms on your thighs with wrists hanging just over your knees.',
      'Hold a barbell with an underhand grip (palms up).',
      'Lower the bar allowing it to roll down to your fingertips for a deep forearm stretch.',
      'Curl wrists upward as high as possible while squeezing your forearm flexors.'
    ],
    mistakes: [
      'Lifting forearms off your thighs during the curl.',
      'Using jerky, bouncy motions that stress wrist tendons.'
    ],
    defaultSets: 3,
    defaultReps: '15-20'
  },
  {
    name: 'Dead Hang',
    primaryMuscle: 'FOREARMS',
    secondaryMuscles: 'BACK,SHOULDERS',
    equipment: 'BODYWEIGHT',
    difficulty: 'BEGINNER',
    mediaUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    steps: [
      'Grab a pull-up bar using an overhand grip slightly wider than shoulders.',
      'Hang freely with feet off the floor, allowing gravity to gently decompress spine.',
      'Keep grip clenched tight while engaging core and breathing steadily for time.'
    ],
    mistakes: [
      'Holding breath instead of diaphragmatic respiration.',
      'Shrugging shoulders into ears without active shoulder depression.'
    ],
    defaultSets: 3,
    defaultReps: '45-60s'
  },
  // INNER / OUTER THIGH
  {
    name: 'Seated Hip Adductor Machine',
    primaryMuscle: 'QUADRICEPS',
    secondaryMuscles: 'GLUTES',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    mediaUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400',
    steps: [
      'Sit in machine with back firmly supported and inner thighs placed against the pads.',
      'Adjust lever to comfortable wide spread for an active stretch in inner groin.',
      'Squeeze thighs together inward until pads touch in front of you.',
      'Hold peak squeeze for 1 second, then resist return slowly.'
    ],
    mistakes: [
      'Allowing the weight stack to slam at the stretch position.',
      'Lifting hips off seat during the squeeze.'
    ],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  {
    name: 'Seated Hip Abductor Machine',
    primaryMuscle: 'GLUTES',
    secondaryMuscles: 'QUADRICEPS',
    equipment: 'MACHINE',
    difficulty: 'BEGINNER',
    mediaUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400',
    steps: [
      'Sit upright with back supported and outer thighs against pads.',
      'Push thighs outward laterally against resistance focusing on outer gluteus medius.',
      'Pause at maximum abduction, then slowly control return to center.'
    ],
    mistakes: [
      'Using aggressive jerky momentum instead of isolated outer hip contraction.'
    ],
    defaultSets: 3,
    defaultReps: '12-15'
  },
  // OLYMPIC & FULL BODY
  {
    name: 'Barbell Power Clean',
    primaryMuscle: 'BACK',
    secondaryMuscles: 'TRAPS,GLUTES,HAMSTRINGS,SHOULDERS,QUADRICEPS',
    equipment: 'BARBELL',
    difficulty: 'ADVANCED',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
    steps: [
      'Start in a deadlift stance with bar over mid-foot, hook grip on the bar.',
      'Pull bar smoothly off the floor to mid-thigh maintaining upright torso angle.',
      'Explosively extend hips, knees, and ankles (triple extension) with an aggressive trap shrug.',
      'Pull yourself rapidly under the bar, snapping elbows forward to catch bar on front deltoids in a quarter squat.',
      'Stand fully erect, then return bar safely.'
    ],
    mistakes: [
      'Catching the bar with low, drooping elbows risking wrist injury.',
      'Reverse-curling the bar rather than driving with triple hip extension.'
    ],
    defaultSets: 4,
    defaultReps: '3-5'
  },
  {
    name: 'Barbell Thruster',
    primaryMuscle: 'QUADRICEPS',
    secondaryMuscles: 'SHOULDERS,GLUTES,TRICEPS,ABS',
    equipment: 'BARBELL',
    difficulty: 'ADVANCED',
    mediaUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400',
    steps: [
      'Rest barbell in front rack position across anterior deltoids, elbows high.',
      'Descend into a full front squat below parallel with knees tracking toes.',
      'Drive aggressively upward out of the squat, using leg drive to propel bar overhead.',
      'Lock out arms completely overhead in one fluid transition.',
      'Lower bar smoothly back to shoulders as you prepare for the next descent.'
    ],
    mistakes: [
      'Pausing at the top of the squat before pressing instead of a continuous fluid kinetic chain.',
      'Collapsing chest forward during the squat descent.'
    ],
    defaultSets: 3,
    defaultReps: '8-10'
  },
  {
    name: 'Kettlebell Swing',
    primaryMuscle: 'GLUTES',
    secondaryMuscles: 'HAMSTRINGS,BACK,FOREARMS,ABS',
    equipment: 'KETTLEBELL',
    difficulty: 'INTERMEDIATE',
    mediaUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
    steps: [
      'Stand feet shoulder-width apart, kettlebell placed 1 foot in front on floor.',
      'Hinge at hips, reach forward with both hands and tilt bell towards you.',
      'Hike bell between your legs like a center in football.',
      'Snap hips forward with powerful glute contraction to propel bell to chest level.',
      'Let bell swing back naturally into the hip hinge without squatting.'
    ],
    mistakes: [
      'Squatting the weight rather than performing a pure horizontal hip hinge.',
      'Lifting with shoulders and arms rather than hip drive.'
    ],
    defaultSets: 4,
    defaultReps: '15-20'
  },
  // CARDIO
  {
    name: 'Rowing Machine Intervals',
    primaryMuscle: 'CARDIO',
    secondaryMuscles: 'BACK,LEGS,BICEPS,ABS',
    equipment: 'MACHINE',
    difficulty: 'INTERMEDIATE',
    mediaUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400',
    steps: [
      'Catch: Sit tall, shins vertical, arms extended forward, hinge slightly forward from hips.',
      'Drive: Push explosively through feet and legs first, then swing torso back, and finish with arms pulling handle to sternum.',
      'Finish: Legs straight, slight backward body lean, handle at lower ribs.',
      'Recovery: Extend arms, hinge torso forward, then slide knees forward back to catch in a smooth 1:2 drive-to-recovery ratio.'
    ],
    mistakes: [
      'Bending knees before arms have cleared during recovery phase.',
      'Pulling with arms before legs have completed the drive.'
    ],
    defaultSets: 5,
    defaultReps: '500m split'
  },
  {
    name: 'Jump Rope',
    primaryMuscle: 'CARDIO',
    secondaryMuscles: 'CALVES,FOREARMS,SHOULDERS',
    equipment: 'BODYWEIGHT',
    difficulty: 'BEGINNER',
    mediaUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400',
    steps: [
      'Hold handles at hip height with elbows tucked close to torso.',
      'Rotate rope using quick wrist flicks rather than large arm circles.',
      'Bound softly on balls of feet 1-2 inches off floor with slight knee bend.',
      'Maintain rhythm with relaxed breathing for set duration.'
    ],
    mistakes: [
      'Jumping too high and landing heavily on flat feet or heels.',
      'Swinging arms from elbows or shoulders rather than wrists.'
    ],
    defaultSets: 4,
    defaultReps: '60s'
  },
  // MOBILITY
  {
    name: 'World\'s Greatest Stretch',
    primaryMuscle: 'HAMSTRINGS',
    secondaryMuscles: 'GLUTES,BACK,SHOULDERS,QUADRICEPS',
    equipment: 'BODYWEIGHT',
    difficulty: 'BEGINNER',
    mediaUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    steps: [
      'Step into a deep forward lunge with right foot forward and left leg extended back.',
      'Place left hand on floor inside right foot. Drop right elbow down toward right instep to open hip.',
      'Rotate torso toward front knee and reach right arm straight up toward ceiling.',
      'Follow hand with eyes and hold for 2-3 breaths. Switch sides.'
    ],
    mistakes: [
      'Rushing through positions without relaxing into the stretch.',
      'Letting front foot roll onto edge rather than staying grounded.'
    ],
    defaultSets: 3,
    defaultReps: '5 per side'
  },
  {
    name: 'Cat-Cow Mobility Flow',
    primaryMuscle: 'BACK',
    secondaryMuscles: 'ABS,SHOULDERS',
    equipment: 'BODYWEIGHT',
    difficulty: 'BEGINNER',
    mediaUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    steps: [
      'Start on hands and knees with wrists under shoulders and knees under hips.',
      'Inhale: Drop belly toward floor, lift chest, arch back, and look up (Cow Pose).',
      'Exhale: Tuck chin to chest, round spine toward ceiling, and pull navel to spine (Cat Pose).',
      'Move fluidly with breath for 10-15 cycles.'
    ],
    mistakes: [
      'Forcing end-range cervical hyperextension.',
      'Locking out elbows instead of maintaining a soft flex.'
    ],
    defaultSets: 2,
    defaultReps: '10 cycles'
  },
  {
    name: '90/90 Hip Mobility',
    primaryMuscle: 'GLUTES',
    secondaryMuscles: 'QUADRICEPS,HAMSTRINGS',
    equipment: 'BODYWEIGHT',
    difficulty: 'BEGINNER',
    mediaUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=600',
    thumbnailUrl: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?w=400',
    steps: [
      'Sit on floor with front leg bent at 90-degree angle and back leg bent at 90-degree angle.',
      'Keep torso tall with proud chest, squaring shoulders toward front shin.',
      'Hinge forward from hips over front leg to stretch lead hip, hold 30s.',
      'Transition smoothly across center to opposite side without using hands if possible.'
    ],
    mistakes: [
      'Slumping and rounding lumbar spine rather than hinging at hips.'
    ],
    defaultSets: 2,
    defaultReps: '45s per side'
  }
];

function deriveDefaults(exercise) {
  const diff = exercise.difficulty;
  const eq = exercise.equipment;
  if (eq === 'BARBELL' && (exercise.name.toLowerCase().includes('deadlift') || exercise.name.toLowerCase().includes('squat') || exercise.name.toLowerCase().includes('bench'))) {
    return { defaultSets: 4, defaultReps: '5-8' };
  }
  if (diff === 'ADVANCED') {
    return { defaultSets: 4, defaultReps: '6-10' };
  }
  if (diff === 'BEGINNER') {
    return { defaultSets: 3, defaultReps: '10-12' };
  }
  return { defaultSets: 3, defaultReps: '8-12' };
}

async function run() {
  console.log('Fetching open exercise database from:', DATASET_URL);
  const resp = await fetch(DATASET_URL);
  if (!resp.ok) {
    throw new Error(`Failed to fetch dataset: ${resp.status} ${resp.statusText}`);
  }
  const rawData = await resp.json();
  console.log(`Fetched ${rawData.length} raw exercises.`);

  // Process & Deduplicate
  const seenNames = new Set();
  const processed = [];

  // Seed checklist items first
  for (const item of CHECKLIST_EXERCISES) {
    const lowerKey = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
    seenNames.add(lowerKey);
    const secList = item.secondaryMuscles ? item.secondaryMuscles.split(',') : [];
    processed.push({
      id: item.name.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, ''),
      name: item.name,
      primaryMuscle: item.primaryMuscle,
      primaryMuscles: [item.primaryMuscle],
      secondaryMuscles: item.secondaryMuscles || '',
      secondaryMusclesList: secList,
      equipment: item.equipment,
      difficulty: item.difficulty,
      mediaUrl: item.mediaUrl,
      mediaUrl2: item.mediaUrl,
      thumbnailUrl: item.thumbnailUrl,
      steps: item.steps,
      mistakes: item.mistakes,
      defaultSets: item.defaultSets,
      defaultReps: item.defaultReps,
      formTips: item.steps[0] || 'Maintain proper form and controlled tempo.',
      isCustom: false,
      attribution: 'FitTrack Curated Core Exercise Library & Anatomy Form Standard'
    });
  }

  for (const item of rawData) {
    const cleanName = item.name.trim();
    const lowerKey = cleanName.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (seenNames.has(lowerKey)) continue;
    seenNames.add(lowerKey);

    const primaryGroup = normalizeMuscle(item.primaryMuscles?.[0] || 'CHEST');
    const secondaryList = (item.secondaryMuscles || []).map(normalizeMuscle).filter(m => m !== primaryGroup);
    const uniqueSecondary = [...new Set(secondaryList)];

    const equipment = normalizeEquipment(item.equipment);
    const difficulty = normalizeDifficulty(item.level);

    const images = item.images || [];
    const mediaUrl = images.length > 0 ? `${RAW_MEDIA_BASE}${images[0]}` : null;
    const mediaUrl2 = images.length > 1 ? `${RAW_MEDIA_BASE}${images[1]}` : mediaUrl;
    const thumbnailUrl = images.length > 0 ? `${CDN_MEDIA_BASE}${images[0]}` : null;

    const steps = (item.instructions && item.instructions.length > 0)
      ? item.instructions
      : [
          `Assume the correct setup position with appropriate resistance using ${equipment.toLowerCase().replace('_', ' ')}.`,
          `Brace your core and initiate the movement with controlled technique focusing on the ${primaryGroup.toLowerCase()}.`,
          `Reach peak contraction, pause for a brief moment, and return through the eccentric phase in a smooth 2-3 second count.`
        ];

    const mistakes = deriveMistakes({ name: cleanName, primaryMuscles: [primaryGroup], equipment, difficulty });
    const { defaultSets, defaultReps } = deriveDefaults({ name: cleanName, equipment, difficulty });

    processed.push({
      id: item.id || cleanName.toLowerCase().replace(/\s+/g, '_'),
      name: cleanName,
      primaryMuscle: primaryGroup,
      primaryMuscles: [primaryGroup],
      secondaryMuscles: uniqueSecondary.join(','),
      secondaryMusclesList: uniqueSecondary,
      equipment,
      difficulty,
      mediaUrl,
      mediaUrl2,
      thumbnailUrl,
      steps,
      mistakes,
      defaultSets,
      defaultReps,
      formTips: steps[0] || 'Maintain proper form and controlled tempo.',
      isCustom: false,
      attribution: 'Open dataset by free-exercise-db (Public Domain / The Unlicense). Creative Commons / Public Domain exercise media.'
    });
  }

  console.log(`Total deduplicated exercises: ${processed.length}`);

  // Group count check
  const groupCounts = {};
  for (const ex of processed) {
    groupCounts[ex.primaryMuscle] = (groupCounts[ex.primaryMuscle] || 0) + 1;
  }
  console.log('Group counts:', groupCounts);

  // Write out cleaned JSON
  const outDir = path.resolve('backend/src/main/resources/data');
  if (!fs.existsSync(outDir)) {
    fs.mkdirSync(outDir, { recursive: true });
  }

  const jsonOutPath = path.join(outDir, 'exercises_seed.json');
  fs.writeFileSync(jsonOutPath, JSON.stringify(processed, null, 2), 'utf-8');
  console.log(`Saved ${processed.length} exercises to ${jsonOutPath}`);

  // Also write SQL seed migration for Flyway
  const migrationDir = path.resolve('backend/src/main/resources/db/migration');
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }

  // We will pick a curated core 120 exercises across all muscle groups for the SQL migration
  // to ensure instant database bootstrap
  const sqlOutPath = path.join(migrationDir, 'V3__seed_exercise_library.sql');
  const sqlLines = [
    '-- V3__seed_exercise_library.sql',
    '-- Seed 100+ normalized exercises across all 11 muscle groups + Traps + Cardio',
    '-- Open dataset attribution: free-exercise-db (Public Domain / CC0)',
    ''
  ];

  // Group by muscle to select top 10-15 per muscle group
  const byGroup = {};
  for (const ex of processed) {
    if (!byGroup[ex.primaryMuscle]) byGroup[ex.primaryMuscle] = [];
    byGroup[ex.primaryMuscle].push(ex);
  }

  const selectedForSql = [];
  for (const grp of Object.keys(byGroup)) {
    const list = byGroup[grp];
    // take up to 14 of each group
    selectedForSql.push(...list.slice(0, 14));
  }

  console.log(`Selected ${selectedForSql.length} exercises for SQL seed migration.`);

  for (const ex of selectedForSql) {
    const nameEsc = ex.name.replace(/'/g, "''");
    const secEsc = ex.secondaryMuscles.replace(/'/g, "''");
    const mediaEsc = ex.mediaUrl ? `'${ex.mediaUrl.replace(/'/g, "''")}'` : 'NULL';
    const thumbEsc = ex.thumbnailUrl ? `'${ex.thumbnailUrl.replace(/'/g, "''")}'` : 'NULL';
    const tipsEsc = (ex.formTips || '').replace(/'/g, "''");
    const attrEsc = ex.attribution.replace(/'/g, "''");
    const stepsJson = JSON.stringify(ex.steps).replace(/'/g, "''");
    const mistakesJson = JSON.stringify(ex.mistakes).replace(/'/g, "''");

    sqlLines.push(
      `MERGE INTO exercises (name, primary_muscle, secondary_muscles, equipment, difficulty, media_url, thumbnail_url, form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution)` +
      ` KEY(name) VALUES ('${nameEsc}', '${ex.primaryMuscle}', '${secEsc}', '${ex.equipment}', '${ex.difficulty}', ${mediaEsc}, ${thumbEsc}, '${tipsEsc}', '${stepsJson}', '${mistakesJson}', ${ex.defaultSets}, '${ex.defaultReps}', FALSE, '${attrEsc}');`
    );
  }

  fs.writeFileSync(sqlOutPath, sqlLines.join('\n'), 'utf-8');
  console.log(`Generated SQL migration file with ${selectedForSql.length} seed statements at: ${sqlOutPath}`);
}

run().catch(err => {
  console.error('Error running exercise import:', err);
  process.exit(1);
});
