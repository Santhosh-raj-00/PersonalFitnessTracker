package com.fittrack.service;

import com.fittrack.model.*;
import com.fittrack.model.enums.*;
import com.fittrack.repository.*;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.io.InputStream;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataSeederService implements CommandLineRunner {

    private final ExerciseRepository exerciseRepository;
    private final RoutineRepository routineRepository;
    private final UserRepository userRepository;
    private final UserProfileRepository userProfileRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final PersonalRecordRepository personalRecordRepository;
    private final BodyMetricRepository bodyMetricRepository;
    private final PasswordEncoder passwordEncoder;

    public DataSeederService(ExerciseRepository exerciseRepository,
                             RoutineRepository routineRepository,
                             UserRepository userRepository,
                             UserProfileRepository userProfileRepository,
                             WorkoutSessionRepository workoutSessionRepository,
                             WorkoutSetRepository workoutSetRepository,
                             PersonalRecordRepository personalRecordRepository,
                             BodyMetricRepository bodyMetricRepository,
                             PasswordEncoder passwordEncoder) {
        this.exerciseRepository = exerciseRepository;
        this.routineRepository = routineRepository;
        this.userRepository = userRepository;
        this.userProfileRepository = userProfileRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.personalRecordRepository = personalRecordRepository;
        this.bodyMetricRepository = bodyMetricRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (exerciseRepository.count() == 0) {
            seedExercises();
        }
        if (routineRepository.count() == 0) {
            seedRoutineTemplates();
        }
        if (userRepository.count() == 0) {
            seedDemoUserAndHistory();
        }
    }

    private void seedExercises() {
        // Load the 900+ dataset from data/exercises_seed.json
        try (InputStream is = getClass().getResourceAsStream("/data/exercises_seed.json")) {
            if (is != null) {
                ObjectMapper mapper = new ObjectMapper();
                List<Map<String, Object>> rawList = mapper.readValue(is, new TypeReference<List<Map<String, Object>>>() {});
                List<Exercise> exercises = new ArrayList<>();
                for (Map<String, Object> map : rawList) {
                    String name = (String) map.get("name");
                    String pMuscleStr = (String) map.get("primaryMuscle");
                    MuscleGroup pMuscle;
                    try {
                        pMuscle = MuscleGroup.valueOf(pMuscleStr);
                    } catch (Exception e) {
                        pMuscle = MuscleGroup.CHEST;
                    }
                    String secMuscles = (String) map.get("secondaryMuscles");
                    Equipment eq;
                    try {
                        eq = Equipment.valueOf((String) map.get("equipment"));
                    } catch (Exception e) {
                        eq = Equipment.OTHER;
                    }
                    Difficulty diff;
                    try {
                        diff = Difficulty.valueOf((String) map.get("difficulty"));
                    } catch (Exception e) {
                        diff = Difficulty.INTERMEDIATE;
                    }
                    String mediaUrl = (String) map.get("mediaUrl");
                    String thumbUrl = (String) map.get("thumbnailUrl");
                    @SuppressWarnings("unchecked")
                    List<String> steps = (List<String>) map.get("steps");
                    @SuppressWarnings("unchecked")
                    List<String> mistakes = (List<String>) map.get("mistakes");
                    Integer defaultSets = (Integer) map.get("defaultSets");
                    String defaultReps = (String) map.get("defaultReps");
                    String attr = (String) map.get("attribution");

                    Exercise ex = exerciseRepository.findByNameIgnoreCase(name).orElse(null);
                    if (ex == null) {
                        ex = new Exercise(name, pMuscle, secMuscles, eq, diff, mediaUrl, thumbUrl, steps, mistakes, defaultSets, defaultReps, attr);
                    } else {
                        ex.setPrimaryMuscle(pMuscle);
                        ex.setSecondaryMuscles(secMuscles);
                        ex.setEquipment(eq);
                        ex.setDifficulty(diff);
                        if (mediaUrl != null && !mediaUrl.isBlank()) ex.setMediaUrl(mediaUrl);
                        if (thumbUrl != null && !thumbUrl.isBlank()) ex.setThumbnailUrl(thumbUrl);
                        if (steps != null && !steps.isEmpty()) ex.setSteps(steps);
                        if (mistakes != null && !mistakes.isEmpty()) ex.setMistakes(mistakes);
                        if (defaultSets != null) ex.setDefaultSets(defaultSets);
                        if (defaultReps != null) ex.setDefaultReps(defaultReps);
                        if (attr != null) ex.setAttribution(attr);
                    }

                    String mvType = (String) map.get("movementType");
                    if (mvType != null) ex.setMovementType(mvType);
                    String chReg = (String) map.get("chestRegion");
                    if (chReg != null) ex.setChestRegion(chReg);
                    String animPattern = (String) map.get("animationPattern");
                    if (animPattern != null) ex.setAnimationPattern(animPattern);
                    String animParams = (String) map.get("animationParams");
                    if (animParams != null) ex.setAnimationParams(animParams);
                    String camView = (String) map.get("cameraView");
                    if (camView != null) ex.setCameraView(camView);

                    String mediaProv = (String) map.get("mediaProvider");
                    if (mediaProv != null) ex.setMediaProvider(mediaProv);
                    String mType = (String) map.get("mediaType");
                    if (mType != null) ex.setMediaType(mType);
                    String revStatus = (String) map.get("reviewStatus");
                    if (revStatus != null) ex.setReviewStatus(revStatus);
                    String postUrl = (String) map.get("posterUrl");
                    if (postUrl != null) ex.setPosterUrl(postUrl);
                    String src = (String) map.get("source");
                    if (src != null) ex.setSource(src);
                    String extId = (String) map.get("externalId");
                    if (extId != null) ex.setExternalId(extId);

                    exercises.add(ex);

                }
                if (!exercises.isEmpty()) {
                    exerciseRepository.saveAll(exercises);
                }
                return;
            }
        } catch (Exception ex) {
            System.err.println("Could not load exercises_seed.json, falling back to manual seed: " + ex.getMessage());
        }

        List<Exercise> exercises = new ArrayList<>();

        // CHEST (8)
        exercises.add(new Exercise("Barbell Bench Press", MuscleGroup.CHEST, "TRICEPS,SHOULDERS", Equipment.BARBELL, Difficulty.INTERMEDIATE, "Keep shoulder blades retracted, touch lower chest, drive upwards.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"));
        exercises.add(new Exercise("Incline Dumbbell Press", MuscleGroup.CHEST, "SHOULDERS,TRICEPS", Equipment.DUMBBELL, Difficulty.INTERMEDIATE, "Set bench at 30 degrees, press dumbbells vertically with controlled eccentric.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Cable Chest Fly", MuscleGroup.CHEST, "SHOULDERS", Equipment.CABLE, Difficulty.BEGINNER, "Set cables at shoulder level, hug a big tree motion, squeeze chest at center.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"));
        exercises.add(new Exercise("Chest Dip", MuscleGroup.CHEST, "TRICEPS,SHOULDERS", Equipment.BODYWEIGHT, Difficulty.INTERMEDIATE, "Lean forward 30 degrees, lower until elbows reach 90 degrees.", "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400"));
        exercises.add(new Exercise("Pec Deck Machine Fly", MuscleGroup.CHEST, "SHOULDERS", Equipment.MACHINE, Difficulty.BEGINNER, "Keep elbows slightly bent, contract chest inwards slowly.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400"));
        exercises.add(new Exercise("Decline Barbell Press", MuscleGroup.CHEST, "TRICEPS", Equipment.BARBELL, Difficulty.INTERMEDIATE, "Set bench to 15-30 degree decline, focus on lower chest activation.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"));
        exercises.add(new Exercise("Push-Ups", MuscleGroup.CHEST, "TRICEPS,ABS", Equipment.BODYWEIGHT, Difficulty.BEGINNER, "Maintain straight line from head to heels, lower chest to floor.", "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400"));
        exercises.add(new Exercise("Dumbbell Pullover", MuscleGroup.CHEST, "BACK,TRICEPS", Equipment.DUMBBELL, Difficulty.INTERMEDIATE, "Lie perpendicular across bench, lower dumbbell overhead with slight elbow bend.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));

        // BACK (8)
        exercises.add(new Exercise("Conventional Deadlift", MuscleGroup.BACK, "HAMSTRINGS,GLUTES,FOREARMS", Equipment.BARBELL, Difficulty.ADVANCED, "Bar over mid-foot, brace core, pull slack, drive hips forward.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"));
        exercises.add(new Exercise("Barbell Bent-Over Row", MuscleGroup.BACK, "BICEPS,FOREARMS", Equipment.BARBELL, Difficulty.INTERMEDIATE, "Hinge hips to 45 degrees, pull bar to lower abdomen, squeeze lats.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"));
        exercises.add(new Exercise("Lat Pulldown", MuscleGroup.BACK, "BICEPS,SHOULDERS", Equipment.CABLE, Difficulty.BEGINNER, "Slight backward lean, drive elbows down to chest level.", "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400"));
        exercises.add(new Exercise("Pull-Ups", MuscleGroup.BACK, "BICEPS,FOREARMS", Equipment.BODYWEIGHT, Difficulty.INTERMEDIATE, "Overhand grip wider than shoulders, pull chin above bar.", "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400"));
        exercises.add(new Exercise("Seated Cable Row", MuscleGroup.BACK, "BICEPS,TRAPS", Equipment.CABLE, Difficulty.BEGINNER, "Keep torso upright, pull handle to navel, retract scapula.", "https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=400"));
        exercises.add(new Exercise("Single-Arm Dumbbell Row", MuscleGroup.BACK, "BICEPS", Equipment.DUMBBELL, Difficulty.BEGINNER, "Support knee and hand on bench, pull dumbbell to hip pocket.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("T-Bar Row", MuscleGroup.BACK, "BICEPS,TRAPS", Equipment.MACHINE, Difficulty.INTERMEDIATE, "Chest supported or free hinge, pull handle tight into ribcage.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"));
        exercises.add(new Exercise("Face Pull", MuscleGroup.BACK, "SHOULDERS,TRAPS", Equipment.CABLE, Difficulty.BEGINNER, "Attach rope to upper pulley, pull towards forehead with elbows high.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"));

        // SHOULDERS (8)
        exercises.add(new Exercise("Overhead Barbell Press", MuscleGroup.SHOULDERS, "TRICEPS", Equipment.BARBELL, Difficulty.INTERMEDIATE, "Stand tall, press bar straight up, lock out overhead with core tight.", "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400"));
        exercises.add(new Exercise("Seated Dumbbell Shoulder Press", MuscleGroup.SHOULDERS, "TRICEPS", Equipment.DUMBBELL, Difficulty.BEGINNER, "Sit upright, press dumbbells vertically overhead, control lowering.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Dumbbell Lateral Raise", MuscleGroup.SHOULDERS, "TRAPS", Equipment.DUMBBELL, Difficulty.BEGINNER, "Slight forward lean, raise arms to sides until parallel with floor.", "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400"));
        exercises.add(new Exercise("Cable Lateral Raise", MuscleGroup.SHOULDERS, "TRAPS", Equipment.CABLE, Difficulty.BEGINNER, "Set cable low, pull across body laterally for constant tension.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"));
        exercises.add(new Exercise("Rear Delt Reverse Fly", MuscleGroup.SHOULDERS, "BACK", Equipment.DUMBBELL, Difficulty.BEGINNER, "Bend over 45 degrees, raise arms laterally pulling with rear delts.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Arnold Press", MuscleGroup.SHOULDERS, "TRICEPS", Equipment.DUMBBELL, Difficulty.INTERMEDIATE, "Start palms facing you, rotate palms outward as you press overhead.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Barbell Front Raise", MuscleGroup.SHOULDERS, "CHEST", Equipment.BARBELL, Difficulty.BEGINNER, "Raise barbell with straight arms to eye level.", "https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=400"));
        exercises.add(new Exercise("Machine Shoulder Press", MuscleGroup.SHOULDERS, "TRICEPS", Equipment.MACHINE, Difficulty.BEGINNER, "Press handles upward smoothly, focus on shoulder contraction.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400"));

        // BICEPS (6)
        exercises.add(new Exercise("Barbell Curl", MuscleGroup.BICEPS, "FOREARMS", Equipment.BARBELL, Difficulty.BEGINNER, "Keep elbows pinned to sides, curl bar upward without swinging.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Dumbbell Incline Curl", MuscleGroup.BICEPS, "FOREARMS", Equipment.DUMBBELL, Difficulty.INTERMEDIATE, "Lie on 45-degree incline, stretch biceps fully at bottom.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Hammer Curl", MuscleGroup.BICEPS, "FOREARMS", Equipment.DUMBBELL, Difficulty.BEGINNER, "Neutral grip palms facing inward, targets brachialis and forearms.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("EZ-Bar Preacher Curl", MuscleGroup.BICEPS, "FOREARMS", Equipment.EZ_BAR, Difficulty.INTERMEDIATE, "Rest triceps on preacher pad, extend fully and squeeze peak contraction.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Cable Biceps Curl", MuscleGroup.BICEPS, "FOREARMS", Equipment.CABLE, Difficulty.BEGINNER, "Continuous cable tension throughout full elbow flexion.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"));
        exercises.add(new Exercise("Concentration Curl", MuscleGroup.BICEPS, "FOREARMS", Equipment.DUMBBELL, Difficulty.BEGINNER, "Anchor elbow inside thigh, curl dumbbell with focused control.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));

        // TRICEPS (6)
        exercises.add(new Exercise("Skull Crushers (Lying Triceps Extension)", MuscleGroup.TRICEPS, "FOREARMS", Equipment.EZ_BAR, Difficulty.INTERMEDIATE, "Lower EZ bar to forehead, extend elbows vertically overhead.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Triceps Pushdown (Rope)", MuscleGroup.TRICEPS, "FOREARMS", Equipment.CABLE, Difficulty.BEGINNER, "Pin elbows to ribs, extend rope downward and spread ends.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"));
        exercises.add(new Exercise("Overhead Dumbbell Triceps Extension", MuscleGroup.TRICEPS, "SHOULDERS", Equipment.DUMBBELL, Difficulty.BEGINNER, "Hold dumbbell overhead with both hands, lower behind head and press.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Close-Grip Barbell Bench Press", MuscleGroup.TRICEPS, "CHEST,SHOULDERS", Equipment.BARBELL, Difficulty.INTERMEDIATE, "Grip bar shoulder-width apart, keep elbows close to torso.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"));
        exercises.add(new Exercise("Bench Dips", MuscleGroup.TRICEPS, "SHOULDERS", Equipment.BODYWEIGHT, Difficulty.BEGINNER, "Place hands on bench behind back, lower hips toward floor.", "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400"));
        exercises.add(new Exercise("Single-Arm Cable Triceps Kickback", MuscleGroup.TRICEPS, "FOREARMS", Equipment.CABLE, Difficulty.BEGINNER, "Extend arm straight back parallel to torso, hold lockout.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"));

        // QUADRICEPS (6)
        exercises.add(new Exercise("Barbell Back Squat", MuscleGroup.QUADRICEPS, "GLUTES,HAMSTRINGS,ABS", Equipment.BARBELL, Difficulty.ADVANCED, "Bar across upper traps, squat down past parallel, drive through heels.", "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400"));
        exercises.add(new Exercise("Leg Press", MuscleGroup.QUADRICEPS, "GLUTES,HAMSTRINGS", Equipment.MACHINE, Difficulty.BEGINNER, "Feet shoulder-width on sled, lower to 90 degrees without rounding lower back.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400"));
        exercises.add(new Exercise("Leg Extension Machine", MuscleGroup.QUADRICEPS, "NONE", Equipment.MACHINE, Difficulty.BEGINNER, "Extend legs fully, pause at top contraction, lower under control.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400"));
        exercises.add(new Exercise("Barbell Front Squat", MuscleGroup.QUADRICEPS, "ABS,GLUTES", Equipment.BARBELL, Difficulty.ADVANCED, "Bar racked on front deltoids, upright torso, squat past parallel.", "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400"));
        exercises.add(new Exercise("Bulgarian Split Squat", MuscleGroup.QUADRICEPS, "GLUTES,HAMSTRINGS", Equipment.DUMBBELL, Difficulty.INTERMEDIATE, "Rear foot elevated on bench, drop back knee toward floor.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Goblet Squat", MuscleGroup.QUADRICEPS, "GLUTES,ABS", Equipment.KETTLEBELL, Difficulty.BEGINNER, "Hold kettlebell at chest level, squat with deep knee flexion.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"));

        // HAMSTRINGS (5)
        exercises.add(new Exercise("Romanian Deadlift (RDL)", MuscleGroup.HAMSTRINGS, "GLUTES,BACK", Equipment.BARBELL, Difficulty.INTERMEDIATE, "Slight knee bend, hinge at hips until deep stretch in hamstrings.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"));
        exercises.add(new Exercise("Lying Leg Curl Machine", MuscleGroup.HAMSTRINGS, "CALVES", Equipment.MACHINE, Difficulty.BEGINNER, "Lie face down, flex heels toward glutes, control return.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400"));
        exercises.add(new Exercise("Seated Leg Curl Machine", MuscleGroup.HAMSTRINGS, "CALVES", Equipment.MACHINE, Difficulty.BEGINNER, "Sit with pad over thighs, curl legs under seat fully.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400"));
        exercises.add(new Exercise("Dumbbell Single-Leg RDL", MuscleGroup.HAMSTRINGS, "GLUTES", Equipment.DUMBBELL, Difficulty.INTERMEDIATE, "Balance on one leg, hinge forward extending back leg straight.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Nordic Hamstring Curl", MuscleGroup.HAMSTRINGS, "CALVES", Equipment.BODYWEIGHT, Difficulty.ADVANCED, "Ankles anchored, lower body forward slowly using hamstring eccentrics.", "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400"));

        // GLUTES (4)
        exercises.add(new Exercise("Barbell Hip Thrust", MuscleGroup.GLUTES, "HAMSTRINGS", Equipment.BARBELL, Difficulty.INTERMEDIATE, "Upper back against bench, drive hips upward until fully extended.", "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400"));
        exercises.add(new Exercise("Cable Glute Kickback", MuscleGroup.GLUTES, "HAMSTRINGS", Equipment.CABLE, Difficulty.BEGINNER, "Attach ankle strap, kick leg back with squeezed glute.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"));
        exercises.add(new Exercise("Sumo Squat", MuscleGroup.GLUTES, "QUADRICEPS", Equipment.BARBELL, Difficulty.INTERMEDIATE, "Wide stance with toes pointed outward, drop hips deep.", "https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=400"));
        exercises.add(new Exercise("Glute Bridge", MuscleGroup.GLUTES, "HAMSTRINGS", Equipment.BODYWEIGHT, Difficulty.BEGINNER, "Lie on back, lift pelvis high and squeeze glutes at apex.", "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400"));

        // CALVES (3)
        exercises.add(new Exercise("Standing Calf Raise", MuscleGroup.CALVES, "NONE", Equipment.MACHINE, Difficulty.BEGINNER, "Full stretch at bottom, press up on toes, hold peak contraction.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400"));
        exercises.add(new Exercise("Seated Calf Raise", MuscleGroup.CALVES, "NONE", Equipment.MACHINE, Difficulty.BEGINNER, "Targets soleus muscle with knees bent at 90 degrees.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400"));
        exercises.add(new Exercise("Dumbbell Single-Leg Calf Raise", MuscleGroup.CALVES, "NONE", Equipment.DUMBBELL, Difficulty.BEGINNER, "Hold dumbbell in one hand, elevate on step and raise heel.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));

        // ABS (4)
        exercises.add(new Exercise("Hanging Leg Raise", MuscleGroup.ABS, "FOREARMS", Equipment.BODYWEIGHT, Difficulty.INTERMEDIATE, "Hang from pull-up bar, raise legs to 90 degrees without momentum.", "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400"));
        exercises.add(new Exercise("Ab Wheel Rollout", MuscleGroup.ABS, "BACK,SHOULDERS", Equipment.BODYWEIGHT, Difficulty.ADVANCED, "Kneel on floor, roll wheel out fully while maintaining pelvic tilt.", "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400"));
        exercises.add(new Exercise("Cable Crunch", MuscleGroup.ABS, "NONE", Equipment.CABLE, Difficulty.BEGINNER, "Kneel beneath high pulley, flex spine downward bringing elbows to knees.", "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=400"));
        exercises.add(new Exercise("Plank", MuscleGroup.ABS, "SHOULDERS", Equipment.BODYWEIGHT, Difficulty.BEGINNER, "Forearms on ground, hold rigid straight body position.", "https://images.unsplash.com/photo-1598971639058-fab3c3109a00?w=400"));

        // TRAPS & FOREARMS (3)
        exercises.add(new Exercise("Barbell Shrug", MuscleGroup.TRAPS, "FOREARMS", Equipment.BARBELL, Difficulty.BEGINNER, "Elevate shoulders straight up towards ears, squeeze traps at peak.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"));
        exercises.add(new Exercise("Dumbbell Shrug", MuscleGroup.TRAPS, "FOREARMS", Equipment.DUMBBELL, Difficulty.BEGINNER, "Hold heavy dumbbells at sides, shrug shoulders vertically.", "https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=400"));
        exercises.add(new Exercise("Barbell Wrist Curl", MuscleGroup.FOREARMS, "NONE", Equipment.BARBELL, Difficulty.BEGINNER, "Rest forearms on bench, curl bar upwards focusing on wrist flexors.", "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=400"));

        // CARDIO (2)
        exercises.add(new Exercise("Treadmill Running", MuscleGroup.CARDIO, "QUADRICEPS,CALVES", Equipment.MACHINE, Difficulty.BEGINNER, "Steady-state or interval running for cardiovascular health.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400"));
        exercises.add(new Exercise("Rowing Machine Ergometer", MuscleGroup.CARDIO, "BACK,LEGS,ABS", Equipment.MACHINE, Difficulty.BEGINNER, "Full body stroke with legs, hips and arms.", "https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=400"));

        exerciseRepository.saveAll(exercises);
    }

    private void seedRoutineTemplates() {
        // 1. Push / Pull / Legs (PPL)
        Routine ppl = new Routine("Push / Pull / Legs (PPL)", "Classic 3-day split ideal for strength and muscle growth.", true, "PPL");
        
        RoutineDay push = new RoutineDay("Day 1: Push (Chest, Shoulders, Triceps)", 1);
        push.setRoutine(ppl);
        addRoutineEx(push, "Barbell Bench Press", 1, 4, "6-8", 180);
        addRoutineEx(push, "Seated Dumbbell Shoulder Press", 2, 3, "8-10", 120);
        addRoutineEx(push, "Incline Dumbbell Press", 3, 3, "10-12", 90);
        addRoutineEx(push, "Dumbbell Lateral Raise", 4, 3, "12-15", 60);
        addRoutineEx(push, "Triceps Pushdown (Rope)", 5, 3, "10-12", 60);

        RoutineDay pull = new RoutineDay("Day 2: Pull (Back, Biceps, Rear Delts)", 2);
        pull.setRoutine(ppl);
        addRoutineEx(pull, "Barbell Bent-Over Row", 1, 4, "6-8", 120);
        addRoutineEx(pull, "Lat Pulldown", 2, 3, "8-10", 90);
        addRoutineEx(pull, "Single-Arm Dumbbell Row", 3, 3, "10-12", 90);
        addRoutineEx(pull, "Face Pull", 4, 3, "12-15", 60);
        addRoutineEx(pull, "Barbell Curl", 5, 3, "8-10", 60);

        RoutineDay legs = new RoutineDay("Day 3: Legs & Core (Quads, Hamstrings, Calves)", 3);
        legs.setRoutine(ppl);
        addRoutineEx(legs, "Barbell Back Squat", 1, 4, "6-8", 180);
        addRoutineEx(legs, "Romanian Deadlift (RDL)", 2, 3, "8-10", 120);
        addRoutineEx(legs, "Leg Press", 3, 3, "10-12", 90);
        addRoutineEx(legs, "Lying Leg Curl Machine", 4, 3, "10-12", 60);
        addRoutineEx(legs, "Standing Calf Raise", 5, 4, "12-15", 60);

        ppl.setDays(List.of(push, pull, legs));
        routineRepository.save(ppl);

        // 2. Upper / Lower Split
        Routine upperLower = new Routine("Upper / Lower Split", "4-day split balancing upper body and lower body training.", true, "UPPER_LOWER");
        
        RoutineDay upperA = new RoutineDay("Upper Body A", 1);
        upperA.setRoutine(upperLower);
        addRoutineEx(upperA, "Barbell Bench Press", 1, 4, "6-8", 180);
        addRoutineEx(upperA, "Pull-Ups", 2, 3, "8-10", 120);
        addRoutineEx(upperA, "Overhead Barbell Press", 3, 3, "8-10", 120);
        addRoutineEx(upperA, "Seated Cable Row", 4, 3, "10-12", 90);
        addRoutineEx(upperA, "Dumbbell Incline Curl", 5, 3, "10-12", 60);

        RoutineDay lowerA = new RoutineDay("Lower Body A", 2);
        lowerA.setRoutine(upperLower);
        addRoutineEx(lowerA, "Barbell Back Squat", 1, 4, "6-8", 180);
        addRoutineEx(lowerA, "Romanian Deadlift (RDL)", 2, 3, "8-10", 120);
        addRoutineEx(lowerA, "Leg Extension Machine", 3, 3, "12-15", 60);
        addRoutineEx(lowerA, "Standing Calf Raise", 4, 4, "12-15", 60);

        upperLower.setDays(List.of(upperA, lowerA));
        routineRepository.save(upperLower);

        // 3. 6-Day Split
        Routine sixDay = new Routine("6-Day Hypertrophy Split", "Advanced split targeting 2 muscles per day for ultimate volume.", true, "SIX_DAY");
        
        RoutineDay d1 = new RoutineDay("Day 1: Chest & Triceps", 1); d1.setRoutine(sixDay);
        addRoutineEx(d1, "Barbell Bench Press", 1, 4, "8-10", 120);
        addRoutineEx(d1, "Incline Dumbbell Press", 2, 3, "10-12", 90);
        addRoutineEx(d1, "Skull Crushers (Lying Triceps Extension)", 3, 3, "10-12", 60);

        RoutineDay d2 = new RoutineDay("Day 2: Back & Biceps", 2); d2.setRoutine(sixDay);
        addRoutineEx(d2, "Lat Pulldown", 1, 4, "8-10", 90);
        addRoutineEx(d2, "Barbell Bent-Over Row", 2, 3, "8-10", 90);
        addRoutineEx(d2, "Barbell Curl", 3, 3, "10-12", 60);

        RoutineDay d3 = new RoutineDay("Day 3: Legs & Abs", 3); d3.setRoutine(sixDay);
        addRoutineEx(d3, "Barbell Back Squat", 1, 4, "8-10", 150);
        addRoutineEx(d3, "Leg Curl Machine", 2, 3, "10-12", 60);
        addRoutineEx(d3, "Hanging Leg Raise", 3, 3, "12-15", 60);

        sixDay.setDays(List.of(d1, d2, d3));
        routineRepository.save(sixDay);
    }

    private void addRoutineEx(RoutineDay day, String exerciseName, int order, int sets, String reps, int restSec) {
        exerciseRepository.findByNameIgnoreCase(exerciseName).ifPresent(ex -> {
            RoutineExercise re = new RoutineExercise(ex, order, sets, reps, restSec);
            re.setRoutineDay(day);
            day.getExercises().add(re);
        });
    }

    private void seedDemoUserAndHistory() {
        User demoUser = new User(
                "user@fittrack.com",
                passwordEncoder.encode("password123"),
                "Alex Rivera",
                Role.ROLE_USER
        );
        demoUser = userRepository.save(demoUser);

        UserProfile profile = new UserProfile();
        profile.setUser(demoUser);
        profile.setAge(26);
        profile.setHeightCm(178.0);
        profile.setWeightKg(76.5);
        profile.setFitnessGoal(FitnessGoal.BULK);
        profile.setExperienceLevel(ExperienceLevel.INTERMEDIATE);
        profile.setAvailableEquipment("BARBELL,DUMBBELL,CABLE,MACHINE,BODYWEIGHT");
        profile.setDailyCalorieTarget(2650);
        profile.setDailyProteinTargetGrams(170);
        userProfileRepository.save(profile);

        // Seed Body Metrics History over last 4 weeks
        List<BodyMetric> metrics = new ArrayList<>();
        metrics.add(new BodyMetric(demoUser, LocalDate.now().minusDays(21), 74.8, 15.5, 102.0, 81.0, 37.0, 56.0, "Started bulk campaign"));
        metrics.add(new BodyMetric(demoUser, LocalDate.now().minusDays(14), 75.3, 15.6, 102.5, 81.2, 37.2, 56.5, "Feeling energetic on 2600 kcal"));
        metrics.add(new BodyMetric(demoUser, LocalDate.now().minusDays(7), 75.9, 15.7, 103.0, 81.5, 37.5, 57.0, "Bench press feeling strong"));
        metrics.add(new BodyMetric(demoUser, LocalDate.now().minusDays(1), 76.5, 15.8, 103.8, 81.8, 37.8, 57.5, "Current stats"));
        bodyMetricRepository.saveAll(metrics);

        // Seed Past Workout Sessions & PRs
        Exercise bench = exerciseRepository.findByNameIgnoreCase("Barbell Bench Press").orElse(null);
        Exercise squat = exerciseRepository.findByNameIgnoreCase("Barbell Back Squat").orElse(null);
        Exercise latPulldown = exerciseRepository.findByNameIgnoreCase("Lat Pulldown").orElse(null);

        if (bench != null && squat != null && latPulldown != null) {
            // Session 1: 5 days ago
            WorkoutSession s1 = new WorkoutSession(demoUser, "Push Workout A", "Push / Pull / Legs (PPL)", 1L);
            s1.setStartTime(LocalDateTime.now().minusDays(5));
            s1.setEndTime(LocalDateTime.now().minusDays(5).plusMinutes(55));
            s1.setStatus(SessionStatus.COMPLETED);
            s1 = workoutSessionRepository.save(s1);

            WorkoutSet set1 = new WorkoutSet(s1, bench, 1, 60.0, 10, 8.0, false);
            WorkoutSet set2 = new WorkoutSet(s1, bench, 2, 70.0, 8, 8.5, false);
            WorkoutSet set3 = new WorkoutSet(s1, bench, 3, 75.0, 6, 9.0, false);
            workoutSetRepository.saveAll(List.of(set1, set2, set3));
            s1.setTotalVolumeKg(60.0 * 10 + 70.0 * 8 + 75.0 * 6);
            workoutSessionRepository.save(s1);

            // Record initial PR
            personalRecordRepository.save(new PersonalRecord(demoUser, bench, RecordType.MAX_WEIGHT, 75.0, 6, set3));
            personalRecordRepository.save(new PersonalRecord(demoUser, bench, RecordType.MAX_1RM, 90.0, 6, set3));

            // Session 2: 3 days ago
            WorkoutSession s2 = new WorkoutSession(demoUser, "Pull Workout A", "Push / Pull / Legs (PPL)", 2L);
            s2.setStartTime(LocalDateTime.now().minusDays(3));
            s2.setEndTime(LocalDateTime.now().minusDays(3).plusMinutes(50));
            s2.setStatus(SessionStatus.COMPLETED);
            s2 = workoutSessionRepository.save(s2);

            WorkoutSet set4 = new WorkoutSet(s2, latPulldown, 1, 55.0, 10, 7.5, false);
            WorkoutSet set5 = new WorkoutSet(s2, latPulldown, 2, 60.0, 10, 8.5, false);
            workoutSetRepository.saveAll(List.of(set4, set5));
            s2.setTotalVolumeKg(55.0 * 10 + 60.0 * 10);
            workoutSessionRepository.save(s2);
            personalRecordRepository.save(new PersonalRecord(demoUser, latPulldown, RecordType.MAX_WEIGHT, 60.0, 10, set5));

            // Session 3: Yesterday
            WorkoutSession s3 = new WorkoutSession(demoUser, "Leg Workout A", "Push / Pull / Legs (PPL)", 3L);
            s3.setStartTime(LocalDateTime.now().minusDays(1));
            s3.setEndTime(LocalDateTime.now().minusDays(1).plusMinutes(60));
            s3.setStatus(SessionStatus.COMPLETED);
            s3 = workoutSessionRepository.save(s3);

            WorkoutSet set6 = new WorkoutSet(s3, squat, 1, 80.0, 8, 8.0, false);
            WorkoutSet set7 = new WorkoutSet(s3, squat, 2, 90.0, 8, 9.0, false);
            WorkoutSet set8 = new WorkoutSet(s3, squat, 3, 95.0, 6, 9.5, false);
            workoutSetRepository.saveAll(List.of(set6, set7, set8));
            s3.setTotalVolumeKg(80.0 * 8 + 90.0 * 8 + 95.0 * 6);
            workoutSessionRepository.save(s3);
            personalRecordRepository.save(new PersonalRecord(demoUser, squat, RecordType.MAX_WEIGHT, 95.0, 6, set8));
        }
    }
}
