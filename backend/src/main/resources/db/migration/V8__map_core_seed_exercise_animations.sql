-- V8__map_core_seed_exercise_animations.sql
-- Ensure 100% of all exercises, including early core seed routines, have explicit animation patterns and parameters.

-- Push-Up Variations
UPDATE exercises SET animation_pattern = 'push_up', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":2.4,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Archer Push-Up'),
  LOWER('Clap Push-Up'),
  LOWER('Diamond Push-Up'),
  LOWER('Standard Push-Up'),
  LOWER('Weighted Push-Up'),
  LOWER('Wide-Grip Push-Up')
);

-- Squat Variations
UPDATE exercises SET animation_pattern = 'back_squat', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":3.0,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Barbell Back Squat')
);

UPDATE exercises SET animation_pattern = 'front_goblet_squat', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":3.0,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Barbell Front Squat')
);

UPDATE exercises SET animation_pattern = 'split_squat', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":2.8,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Bulgarian Split Squat')
);

-- Press Variations
UPDATE exercises SET animation_pattern = 'flat_press', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":2.8,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Barbell Floor Press'),
  LOWER('Flat Dumbbell Press'),
  LOWER('Resistance Band Chest Press'),
  LOWER('TRX Chest Press')
);

UPDATE exercises SET animation_pattern = 'incline_press', animation_params = '{"gripWidth":"normal","inclineAngle":30,"rom":1,"tempo":2.8,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Incline Barbell Bench Press')
);

UPDATE exercises SET animation_pattern = 'decline_press', animation_params = '{"gripWidth":"normal","inclineAngle":-20,"rom":1,"tempo":2.8,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Decline Dumbbell Press')
);

-- Flyes & Crossovers
UPDATE exercises SET animation_pattern = 'chest_fly', animation_params = '{"gripWidth":"wide","inclineAngle":0,"rom":1,"tempo":2.8,"singleArm":false}', camera_view = 'front' WHERE LOWER(name) IN (
  LOWER('Cable Crossover (High to Low)'),
  LOWER('Incline Cable Flyes'),
  LOWER('Low Cable Crossover (Low to High)'),
  LOWER('Middle Cable Crossover (Standing Cable Flyes)'),
  LOWER('Resistance Band Chest Flye'),
  LOWER('TRX Chest Flye'),
  LOWER('Flat Dumbbell Flyes')
);

-- Overhead & Power
UPDATE exercises SET animation_pattern = 'overhead_press', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":2.6,"singleArm":false}', camera_view = 'front' WHERE LOWER(name) IN (
  LOWER('Barbell Power Clean'),
  LOWER('Barbell Thruster')
);

-- Pullovers
UPDATE exercises SET animation_pattern = 'pullover', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":2.8,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Barbell Pullover'),
  LOWER('Dumbbell Pullover')
);

-- Pulls & Dips
UPDATE exercises SET animation_pattern = 'pull_up', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":3.0,"singleArm":false}', camera_view = 'front' WHERE LOWER(name) IN (
  LOWER('Dead Hang')
);

UPDATE exercises SET animation_pattern = 'dip', animation_params = '{"gripWidth":"normal","inclineAngle":15,"rom":1,"tempo":2.6,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Chest Dips')
);

UPDATE exercises SET animation_pattern = 'lat_pulldown', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":2.8,"singleArm":false}', camera_view = 'front' WHERE LOWER(name) IN (
  LOWER('Lat Pulldown')
);

UPDATE exercises SET animation_pattern = 'horizontal_row', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":2.4,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Rowing Machine Intervals')
);

-- Deadlifts & Hinges
UPDATE exercises SET animation_pattern = 'deadlift_hinge', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":3.2,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Conventional Barbell Deadlift')
);

UPDATE exercises SET animation_pattern = 'kettlebell_swing', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":2.2,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Kettlebell Swing')
);

-- Machines & Isolation
UPDATE exercises SET animation_pattern = 'leg_press', animation_params = '{"gripWidth":"normal","inclineAngle":45,"rom":1,"tempo":3.0,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Leg Press Machine')
);

UPDATE exercises SET animation_pattern = 'glute_kickback', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":2.6,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Seated Hip Abductor Machine'),
  LOWER('Seated Hip Adductor Machine')
);

UPDATE exercises SET animation_pattern = 'wrist_curl', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":2.2,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Barbell Wrist Curl')
);

UPDATE exercises SET animation_pattern = 'good_morning', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":3.0,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('90/90 Hip Mobility'),
  LOWER('Cat-Cow Mobility Flow')
);

UPDATE exercises SET animation_pattern = 'running', animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":1.4,"singleArm":false}', camera_view = 'side' WHERE LOWER(name) IN (
  LOWER('Jump Rope')
);

-- Ultimate safety fallback: any remaining unmapped exercise gets neutral athletic back_squat
UPDATE exercises
SET animation_pattern = 'back_squat',
    animation_params = '{"gripWidth":"normal","inclineAngle":0,"rom":1,"tempo":3.0,"singleArm":false}',
    camera_view = 'side'
WHERE animation_pattern IS NULL;
