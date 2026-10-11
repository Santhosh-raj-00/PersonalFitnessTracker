-- V4__fix_quadriceps_mapping.sql
-- Ensure any legacy or imported 'QUADS' rows are standardized to 'QUADRICEPS'

UPDATE exercises SET primary_muscle = 'QUADRICEPS' WHERE primary_muscle = 'QUADS';

-- Seed core leg and quad exercises if not already present
MERGE INTO exercises (name, primary_muscle, secondary_muscles, equipment, difficulty, media_url, thumbnail_url, form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution) KEY(name) VALUES (
    'Barbell Back Squat',
    'QUADRICEPS',
    'GLUTES,HAMSTRINGS,CALVES,ABS',
    'BARBELL',
    'ADVANCED',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
    'Rest barbell across upper trapezius, descend hips below parallel keeping chest proud and knees tracking toes.',
    '["Rest barbell securely across upper trapezius shelf with feet shoulder-width apart.","Inhale deeply into belly, brace core 360 degrees, and hinge hips backward while opening knees.","Descend under control until hip crease is below top of knees.","Drive straight upward pushing floor away through mid-foot and heel.","Lock out hips and knees with strong glute squeeze."]',
    '["Allowing knees to collapse inward (valgus collapse).","Lifting heels off floor and shifting weight to toes.","Rounding lower back at bottom of squat."]',
    4,
    '6-8',
    FALSE,
    'FitTrack Anatomy & Biomechanics Standard'
);

MERGE INTO exercises (name, primary_muscle, secondary_muscles, equipment, difficulty, media_url, thumbnail_url, form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution) KEY(name) VALUES (
    'Leg Press Machine',
    'QUADRICEPS',
    'GLUTES,HAMSTRINGS',
    'MACHINE',
    'BEGINNER',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600',
    'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400',
    'Plant feet shoulder-width on carriage platform, lower sled until knees reach 90 degrees without rounding lower back.',
    '["Sit back firmly into seat with lower back pinned flush against pad.","Place feet in middle of sled shoulder-width apart.","Release safety handles, lower sled slowly until knees reach 90-degree flexion.","Drive weight back up pushing through whole foot without locking knees violently."]',
    '["Allowing pelvis to tuck or lift off back support pad.","Hyper-extending knees aggressively into lockout."]',
    3,
    '10-12',
    FALSE,
    'FitTrack Anatomy & Biomechanics Standard'
);

MERGE INTO exercises (name, primary_muscle, secondary_muscles, equipment, difficulty, media_url, thumbnail_url, form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution) KEY(name) VALUES (
    'Leg Extension Machine',
    'QUADRICEPS',
    '',
    'MACHINE',
    'BEGINNER',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=600',
    'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400',
    'Sit with knees aligned with machine pivot axis, extend legs to full knee lockout and squeeze rectus femoris.',
    '["Adjust back pad so back of knees aligns with pivot point.","Hook shins under roller pad just above ankles.","Extend legs upward until legs are straight, pausing 1 second at peak contraction.","Lower weight stack slowly in 2-3 seconds without letting plates touch between reps."]',
    '["Kicking legs up using aggressive momentum rather than quadriceps tension."]',
    3,
    '12-15',
    FALSE,
    'FitTrack Anatomy & Biomechanics Standard'
);

MERGE INTO exercises (name, primary_muscle, secondary_muscles, equipment, difficulty, media_url, thumbnail_url, form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution) KEY(name) VALUES (
    'Bulgarian Split Squat',
    'QUADRICEPS',
    'GLUTES,HAMSTRINGS',
    'DUMBBELL',
    'INTERMEDIATE',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=600',
    'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400',
    'Elevate rear foot on bench, descend front leg until lead thigh is parallel with ground.',
    '["Place rear foot on bench laces down with front foot stepped out 2-3 feet.","Hold dumbbells at sides with chest tall.","Lower rear knee toward floor until front thigh reaches parallel.","Drive through front heel to return to top position."]',
    '["Leaning excessively sideways or letting lead knee track way inward."]',
    3,
    '10 per leg',
    FALSE,
    'FitTrack Anatomy & Biomechanics Standard'
);

MERGE INTO exercises (name, primary_muscle, secondary_muscles, equipment, difficulty, media_url, thumbnail_url, form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution) KEY(name) VALUES (
    'Goblet Squat',
    'QUADRICEPS',
    'GLUTES,ABS',
    'DUMBBELL',
    'BEGINNER',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
    'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400',
    'Hold dumbbell vertical against sternum, squat deep between knees keeping elbows inside thighs.',
    '["Hold dumbbell cup-grip under palms directly at sternum level.","Stance slightly wider than shoulders with toes flared 15-30 degrees.","Squat down keeping torso upright, elbows tracking inside knees at bottom.","Drive back up through mid-foot."]',
    '["Letting dumbbell drift away from chest causing forward torso lean."]',
    3,
    '12',
    FALSE,
    'FitTrack Anatomy & Biomechanics Standard'
);

MERGE INTO exercises (name, primary_muscle, secondary_muscles, equipment, difficulty, media_url, thumbnail_url, form_tips, steps_json, mistakes_json, default_sets, default_reps, is_custom, attribution) KEY(name) VALUES (
    'Barbell Front Squat',
    'QUADRICEPS',
    'GLUTES,ABS,UPPER_BACK',
    'BARBELL',
    'ADVANCED',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=600',
    'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400',
    'Bar in clean front rack on anterior deltoids, elbows high, upright torso descent.',
    '["Rack bar across front deltoid shelf, fingers fingertips under bar with elbows high and parallel to floor.","Squat down with vertical spine, knees traveling forward over toes.","Drive out of hole keeping elbows elevated high throughout."]',
    '["Dropping elbows forward causing bar to slip down arms."]',
    4,
    '6-8',
    FALSE,
    'FitTrack Anatomy & Biomechanics Standard'
);
