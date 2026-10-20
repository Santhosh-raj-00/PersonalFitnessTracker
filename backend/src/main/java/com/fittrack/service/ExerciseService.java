package com.fittrack.service;

import com.fittrack.dto.ExerciseDTOs.*;
import com.fittrack.model.Exercise;
import com.fittrack.model.User;
import com.fittrack.model.enums.Difficulty;
import com.fittrack.model.enums.Equipment;
import com.fittrack.model.enums.MuscleGroup;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.repository.UserRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class ExerciseService {

    private final ExerciseRepository exerciseRepository;
    private final UserRepository userRepository;

    public ExerciseService(ExerciseRepository exerciseRepository, UserRepository userRepository) {
        this.exerciseRepository = exerciseRepository;
        this.userRepository = userRepository;
    }

    public static MuscleGroup normalizeMuscleGroup(String raw) {
        if (raw == null || raw.trim().isEmpty()) return null;
        String s = raw.trim().toLowerCase().replaceAll("[_-]", " ");
        if (s.equals("all")) return null;
        if (s.contains("chest") || s.contains("pec")) return MuscleGroup.CHEST;
        if (s.contains("trap")) return MuscleGroup.TRAPS;
        if (s.contains("lat") || s.contains("back")) return MuscleGroup.BACK;
        if (s.contains("delt") || s.contains("shoulder")) return MuscleGroup.SHOULDERS;
        if (s.contains("bicep")) return MuscleGroup.BICEPS;
        if (s.contains("tricep")) return MuscleGroup.TRICEPS;
        if (s.contains("forearm") || s.contains("wrist")) return MuscleGroup.FOREARMS;
        if (s.contains("ab") || s.contains("core") || s.contains("oblique")) return MuscleGroup.ABS;
        if (s.contains("glute")) return MuscleGroup.GLUTES;
        if (s.contains("quad")) return MuscleGroup.QUADS;
        if (s.contains("hamstring")) return MuscleGroup.HAMSTRINGS;
        if (s.contains("calv") || s.contains("calf") || s.contains("soleus")) return MuscleGroup.CALVES;
        if (s.contains("cardio")) return MuscleGroup.CARDIO;
        if (s.contains("full body") || s.contains("compound")) return MuscleGroup.FULL_BODY;
        try {
            return MuscleGroup.valueOf(raw.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            return null;
        }
    }

    public List<ExerciseResponse> searchExercises(String query, String muscle, String equipment, String difficulty) {
        return searchExercises(query, muscle, equipment, difficulty, false);
    }

    public List<ExerciseResponse> searchExercises(String query, String muscle, String equipment, String difficulty, boolean includeSecondary) {
        MuscleGroup muscleGroup = normalizeMuscleGroup(muscle);
        String muscleStr = muscleGroup != null ? muscleGroup.name() : (muscle != null ? muscle.trim() : "");

        Equipment eq = null;
        if (equipment != null && !equipment.trim().isEmpty() && !equipment.equalsIgnoreCase("ALL")) {
            try {
                eq = Equipment.valueOf(equipment.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Difficulty diff = null;
        if (difficulty != null && !difficulty.trim().isEmpty() && !difficulty.equalsIgnoreCase("ALL")) {
            try {
                diff = Difficulty.valueOf(difficulty.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;

        List<Exercise> exercises = exerciseRepository.searchExercisesWithFilters(q, muscleGroup, muscleStr, includeSecondary, eq, diff);
        return exercises.stream().map(ExerciseResponse::fromEntity).collect(Collectors.toList());
    }

    public PageResponse<ExerciseResponse> searchExercisesPaginated(
            String query, String muscle, String equipment, String difficulty, int page, int size
    ) {
        return searchExercisesPaginated(query, muscle, equipment, difficulty, false, page, size);
    }

    public PageResponse<ExerciseResponse> searchExercisesPaginated(
            String query, String muscle, String equipment, String difficulty, boolean includeSecondary, int page, int size
    ) {
        MuscleGroup muscleGroup = normalizeMuscleGroup(muscle);
        String muscleStr = muscleGroup != null ? muscleGroup.name() : (muscle != null ? muscle.trim() : "");

        Equipment eq = null;
        if (equipment != null && !equipment.trim().isEmpty() && !equipment.equalsIgnoreCase("ALL")) {
            try {
                eq = Equipment.valueOf(equipment.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        Difficulty diff = null;
        if (difficulty != null && !difficulty.trim().isEmpty() && !difficulty.equalsIgnoreCase("ALL")) {
            try {
                diff = Difficulty.valueOf(difficulty.trim().toUpperCase());
            } catch (IllegalArgumentException ignored) {}
        }

        String q = (query != null && !query.trim().isEmpty()) ? query.trim() : null;
        Pageable pageable = PageRequest.of(Math.max(0, page), Math.max(1, size));

        Page<Exercise> exercisePage = exerciseRepository.searchExercisesWithFilters(q, muscleGroup, muscleStr, includeSecondary, eq, diff, pageable);
        List<ExerciseResponse> content = exercisePage.getContent().stream()
                .map(ExerciseResponse::fromEntity)
                .collect(Collectors.toList());

        return new PageResponse<>(
                content,
                exercisePage.getNumber(),
                exercisePage.getSize(),
                exercisePage.getTotalElements(),
                exercisePage.getTotalPages(),
                exercisePage.isLast()
        );
    }


    public ExerciseResponse getExerciseById(Long id) {
        Exercise exercise = exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found with ID: " + id));
        return ExerciseResponse.fromEntity(exercise);
    }

    public Exercise getExerciseEntityById(Long id) {
        return exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found with ID: " + id));
    }

    @Transactional
    public ExerciseResponse createCustomExercise(Long userId, CreateCustomExerciseRequest req) {
        if (exerciseRepository.existsByNameIgnoreCase(req.getName())) {
            throw new IllegalArgumentException("An exercise with name '" + req.getName() + "' already exists.");
        }

        User user = null;
        if (userId != null) {
            user = userRepository.findById(userId).orElse(null);
        }

        Exercise exercise = new Exercise();
        exercise.setName(req.getName().trim());
        exercise.setPrimaryMuscle(req.getPrimaryMuscle());
        if (req.getSecondaryMuscles() != null && !req.getSecondaryMuscles().isEmpty()) {
            exercise.setSecondaryMuscles(String.join(",", req.getSecondaryMuscles()));
        }
        exercise.setEquipment(req.getEquipment());
        exercise.setDifficulty(req.getDifficulty());
        exercise.setMediaUrl(req.getMediaUrl());
        exercise.setThumbnailUrl(req.getThumbnailUrl());
        exercise.setDemoImageUrl(req.getThumbnailUrl() != null ? req.getThumbnailUrl() : req.getMediaUrl());
        exercise.setSteps(req.getSteps() != null ? req.getSteps() : Collections.emptyList());
        exercise.setMistakes(req.getMistakes() != null ? req.getMistakes() : Collections.emptyList());
        exercise.setDefaultSets(req.getDefaultSets() != null ? req.getDefaultSets() : 3);
        exercise.setDefaultReps(req.getDefaultReps() != null ? req.getDefaultReps() : "8-12");
        exercise.setMovementType(req.getMovementType() != null ? req.getMovementType() : "COMPOUND");
        exercise.setChestRegion(req.getChestRegion());
        exercise.setAnimationPattern(req.getAnimationPattern());
        exercise.setAnimationParams(req.getAnimationParams());
        exercise.setCameraView(req.getCameraView());
        exercise.setMediaProvider(req.getMediaProvider() != null ? req.getMediaProvider() : "builtin");
        exercise.setMediaType(req.getMediaType() != null ? req.getMediaType() : "animation");
        exercise.setPosterUrl(req.getPosterUrl());
        exercise.setIsCustom(true);
        exercise.setCreatedBy(user);
        exercise.setAttribution("User Custom Exercise");

        Exercise saved = exerciseRepository.save(exercise);
        return ExerciseResponse.fromEntity(saved);
    }

    public List<MuscleGroupSummary> getMuscleGroupSummaries() {
        Map<String, String[]> metadata = new LinkedHashMap<>();
        metadata.put("CHEST", new String[]{"Chest", "Pectoralis major, minor & sternal head"});
        metadata.put("BACK", new String[]{"Back", "Latissimus dorsi, rhomboids & erectors"});
        metadata.put("SHOULDERS", new String[]{"Shoulders", "Anterior, lateral & posterior deltoids"});
        metadata.put("TRAPS", new String[]{"Traps", "Upper, middle & lower trapezius"});
        metadata.put("BICEPS", new String[]{"Biceps", "Biceps brachii & brachialis"});
        metadata.put("TRICEPS", new String[]{"Triceps", "Lateral, long & medial heads"});
        metadata.put("FOREARMS", new String[]{"Forearms", "Wrist flexors, extensors & brachioradialis"});
        metadata.put("ABS", new String[]{"Abs", "Rectus abdominis & obliques"});
        metadata.put("GLUTES", new String[]{"Glutes", "Gluteus maximus, medius & minimus"});
        metadata.put("QUADS", new String[]{"Quads", "Rectus femoris & vastus lateralis"});
        metadata.put("HAMSTRINGS", new String[]{"Hamstrings", "Biceps femoris, semitendinosus"});
        metadata.put("CALVES", new String[]{"Calves", "Gastrocnemius & soleus"});
        metadata.put("CARDIO", new String[]{"Cardio", "Cardiovascular stamina & conditioning"});
        metadata.put("FULL_BODY", new String[]{"Full Body", "Compound functional kinetic chain movements"});

        List<MuscleGroupSummary> summaries = new ArrayList<>();
        for (Map.Entry<String, String[]> entry : metadata.entrySet()) {
            String mgKey = entry.getKey();
            String[] info = entry.getValue();
            long count;
            if ("QUADS".equals(mgKey)) {
                count = exerciseRepository.countByPrimaryMuscle(MuscleGroup.QUADS)
                      + exerciseRepository.countByPrimaryMuscle(MuscleGroup.QUADRICEPS);
            } else {
                try {
                    MuscleGroup mg = MuscleGroup.valueOf(mgKey);
                    count = exerciseRepository.countByPrimaryMuscle(mg);
                } catch (Exception e) {
                    count = 0;
                }
            }
            summaries.add(new MuscleGroupSummary(mgKey, info[0], info[1], count));
        }
        return summaries;
    }

    @Transactional
    public ExerciseResponse updateExerciseReview(Long id, String status, String mediaUrl, String posterUrl) {
        Exercise ex = exerciseRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found with ID: " + id));
        if (status != null) {
            ex.setReviewStatus(status);
            if ("verified".equalsIgnoreCase(status)) {
                ex.setMediaProvider("licensed");
            } else if ("no-media".equalsIgnoreCase(status)) {
                ex.setMediaProvider("builtin");
                ex.setMediaUrl(null);
                ex.setPosterUrl(null);
            }
        }
        if (mediaUrl != null) {
            ex.setMediaUrl(mediaUrl);
            ex.setMatchMethod("manual");
        }
        if (posterUrl != null) {
            ex.setPosterUrl(posterUrl);
        }
        ex = exerciseRepository.save(ex);
        return ExerciseResponse.fromEntity(ex);
    }
}
