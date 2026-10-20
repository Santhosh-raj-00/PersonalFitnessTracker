import fs from 'fs';
import path from 'path';

const catalog = JSON.parse(fs.readFileSync('tools/rapidapi_full_catalog.json', 'utf-8'));
console.log('Catalog count:', catalog.length);

const seedPath = 'backend/src/main/resources/data/exercises_seed.json';
const dbExercises = JSON.parse(fs.readFileSync(seedPath, 'utf-8'));
console.log('Seed exercises count:', dbExercises.length);

// Build catalog lookup maps
const exactMap = new Map();
for (const item of catalog) {
  const norm = item.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  exactMap.set(norm, item);
}

// Build muscle map for fallback
const muscleVideoMap = {
  CHEST: '/media/exercises/wide_hand_push_up.mp4',
  BACK: '/media/exercises/pull_up.mp4',
  SHOULDERS: '/media/exercises/seated_shoulder_press.mp4',
  BICEPS: '/media/exercises/hammer_curl.mp4',
  TRICEPS: '/media/exercises/triceps_dip.mp4',
  FOREARMS: '/media/exercises/one_arm_wrist_curl.mp4',
  QUADS: '/media/exercises/squat.mp4',
  HAMSTRINGS: '/media/exercises/romanian_deadlift.mp4',
  GLUTES: '/media/exercises/hip_thrusts.mp4',
  CALVES: '/media/exercises/standing_calf_raise.mp4',
  ABS: '/media/exercises/front_plank.mp4',
  CARDIO: '/media/exercises/run_on_treadmill.mp4',
  NECK: '/media/exercises/neck_circle_stretch.mp4'
};

const musclePosterMap = {
  CHEST: '/media/posters/wide_hand_push_up.jpg',
  BACK: '/media/posters/pull_up.jpg',
  SHOULDERS: '/media/posters/seated_shoulder_press.jpg',
  BICEPS: '/media/posters/hammer_curl.jpg',
  TRICEPS: '/media/posters/triceps_dip.jpg',
  FOREARMS: '/media/posters/one_arm_wrist_curl.jpg',
  QUADS: '/media/posters/squat.jpg',
  HAMSTRINGS: '/media/posters/romanian_deadlift.jpg',
  GLUTES: '/media/posters/hip_thrusts.jpg',
  CALVES: '/media/posters/standing_calf_raise.jpg',
  ABS: '/media/posters/front_plank.jpg',
  CARDIO: '/media/posters/run_on_treadmill.jpg',
  NECK: '/media/posters/neck_circle_stretch.jpg'
};

// Keyword specific mappings
const keywordRules = [
  { test: /bench press/i, video: '/media/exercises/bench_press.mp4', poster: '/media/posters/bench_press.jpg' },
  { test: /incline.*press/i, video: '/media/exercises/dumbbell_incline_one_arm_hammer_press.mp4', poster: '/media/posters/dumbbell_incline_one_arm_hammer_press.jpg' },
  { test: /decline.*press/i, video: '/media/exercises/dumbbell_decline_one_arm_hammer_press.mp4', poster: '/media/posters/dumbbell_decline_one_arm_hammer_press.jpg' },
  { test: /incline push/i, video: '/media/exercises/incline_push_up.mp4', poster: '/media/posters/incline_push_up.jpg' },
  { test: /decline push/i, video: '/media/exercises/decline_push_up.mp4', poster: '/media/posters/decline_push_up.jpg' },
  { test: /push[- ]?up/i, video: '/media/exercises/push_up.mp4', poster: '/media/posters/push_up.jpg' },
  { test: /fly|flyes/i, video: '/media/exercises/wide_hand_push_up.mp4', poster: '/media/posters/wide_hand_push_up.jpg' },
  { test: /rear delt/i, video: '/media/exercises/dumbbell_rear_delt_fly.mp4', poster: '/media/posters/dumbbell_rear_delt_fly.jpg' },
  { test: /pull[- ]?up/i, video: '/media/exercises/pull_up.mp4', poster: '/media/posters/pull_up.jpg' },
  { test: /chin[- ]?up/i, video: '/media/exercises/chin_ups.mp4', poster: '/media/posters/chin_ups.jpg' },
  { test: /hammer curl/i, video: '/media/exercises/hammer_curl.mp4', poster: '/media/posters/hammer_curl.jpg' },
  { test: /concentration curl/i, video: '/media/exercises/biceps_leg_concentration_curl.mp4', poster: '/media/posters/biceps_leg_concentration_curl.jpg' },
  { test: /curl/i, video: '/media/exercises/hammer_curl.mp4', poster: '/media/posters/hammer_curl.jpg' },
  { test: /dip/i, video: '/media/exercises/triceps_dip.mp4', poster: '/media/posters/triceps_dip.jpg' },
  { test: /skull crusher|triceps extension/i, video: '/media/exercises/dumbbell_lying_floor_skull_crusher.mp4', poster: '/media/posters/dumbbell_lying_floor_skull_crusher.jpg' },
  { test: /bulgarian/i, video: '/media/exercises/bulgarian_split_squat.mp4', poster: '/media/posters/bulgarian_split_squat.jpg' },
  { test: /jump squat/i, video: '/media/exercises/jump_squat.mp4', poster: '/media/posters/jump_squat.jpg' },
  { test: /goblet/i, video: '/media/exercises/goblet_squat.mp4', poster: '/media/posters/goblet_squat.jpg' },
  { test: /sumo/i, video: '/media/exercises/sumo_squat.mp4', poster: '/media/posters/sumo_squat.jpg' },
  { test: /squat/i, video: '/media/exercises/squat.mp4', poster: '/media/posters/squat.jpg' },
  { test: /lunge/i, video: '/media/exercises/walking_lunge.mp4', poster: '/media/posters/walking_lunge.jpg' },
  { test: /deadlift|rdl/i, video: '/media/exercises/romanian_deadlift.mp4', poster: '/media/posters/romanian_deadlift.jpg' },
  { test: /hip thrust/i, video: '/media/exercises/hip_thrusts.mp4', poster: '/media/posters/hip_thrusts.jpg' },
  { test: /calf raise/i, video: '/media/exercises/standing_calf_raise.mp4', poster: '/media/posters/standing_calf_raise.jpg' },
  { test: /lateral raise/i, video: '/media/exercises/lateral_raise.mp4', poster: '/media/posters/lateral_raise.jpg' },
  { test: /front raise/i, video: '/media/exercises/front_raise.mp4', poster: '/media/posters/front_raise.jpg' },
  { test: /shoulder press|arnold/i, video: '/media/exercises/arnold_press.mp4', poster: '/media/posters/arnold_press.jpg' },
  { test: /plank/i, video: '/media/exercises/front_plank.mp4', poster: '/media/posters/front_plank.jpg' },
  { test: /crunch/i, video: '/media/exercises/crunch_floor.mp4', poster: '/media/posters/crunch_floor.jpg' },
  { test: /russian twist/i, video: '/media/exercises/russian_twist.mp4', poster: '/media/posters/russian_twist.jpg' },
  { test: /v[- ]?up/i, video: '/media/exercises/v_up.mp4', poster: '/media/posters/v_up.jpg' },
  { test: /burpee/i, video: '/media/exercises/burpee.mp4', poster: '/media/posters/burpee.jpg' }
];

const sqlUpdates = [];

let exactHits = 0;
let ruleHits = 0;
let muscleHits = 0;

for (const ex of dbExercises) {
  const norm = ex.name.toLowerCase().replace(/[^a-z0-9]/g, '');
  let chosenVideo = null;
  let chosenPoster = null;

  if (exactMap.has(norm)) {
    const item = exactMap.get(norm);
    chosenVideo = item.localVideo;
    chosenPoster = item.localPoster;
    exactHits++;
  } else {
    for (const rule of keywordRules) {
      if (rule.test.test(ex.name)) {
        chosenVideo = rule.video;
        chosenPoster = rule.poster;
        ruleHits++;
        break;
      }
    }
  }

  if (!chosenVideo) {
    const pMus = (ex.primaryMuscle || 'CHEST').toUpperCase();
    chosenVideo = muscleVideoMap[pMus] || '/media/exercises/wide_hand_push_up.mp4';
    chosenPoster = musclePosterMap[pMus] || '/media/posters/wide_hand_push_up.jpg';
    muscleHits++;
  }

  ex.mediaProvider = 'licensed';
  ex.mediaType = 'video';
  ex.mediaUrl = chosenVideo;
  ex.posterUrl = chosenPoster;
  ex.attribution = 'ExerciseDB via AscendAPI (Licensed)';

  const escName = ex.name.replace(/'/g, "''");
  sqlUpdates.push(
    `UPDATE exercises SET media_provider = 'licensed', media_type = 'video', media_url = '${chosenVideo}', poster_url = '${chosenPoster}', attribution = 'ExerciseDB via AscendAPI (Licensed)' WHERE LOWER(name) = LOWER('${escName}');`
  );
}

fs.writeFileSync(seedPath, JSON.stringify(dbExercises, null, 2), 'utf-8');
console.log('Seed updated! exactHits:', exactHits, 'ruleHits:', ruleHits, 'muscleHits:', muscleHits);

const migrationPath = 'backend/src/main/resources/db/migration/V12__apply_rapidapi_all_exercises.sql';
fs.writeFileSync(migrationPath, sqlUpdates.join('\n'), 'utf-8');
console.log('Migration written to', migrationPath, 'with', sqlUpdates.length, 'updates.');
