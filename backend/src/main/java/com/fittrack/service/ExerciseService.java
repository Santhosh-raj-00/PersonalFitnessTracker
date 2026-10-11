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

    public List<ExerciseResponse> searchExercises(String query, String muscle, String equipment, String difficulty) {
        MuscleGroup muscleGroup = null;
        String muscleStr = "";
        if (muscle != null && !muscle.trim().isEmpty() && !muscle.equalsIgnoreCase("ALL")
                && !muscle.equalsIgnoreCase("FULL_BODY") && !muscle.equalsIgnoreCase("FULL BODY")) {
            try {
                String mUpper = muscle.trim().toUpperCase();
                if (mUpper.equals("QUADS")) mUpper = "QUADRICEPS";
                muscleGroup = MuscleGroup.valueOf(mUpper);
                muscleStr = muscleGroup.name();
            } catch (IllegalArgumentException ignored) {
                muscleStr = muscle.trim();
            }
        }

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

        List<Exercise> exercises = exerciseRepository.searchExercisesWithFilters(q, muscleGroup, muscleStr, eq, diff);
        return exercises.stream().map(ExerciseResponse::fromEntity).collect(Collectors.toList());
    }

    public PageResponse<ExerciseResponse> searchExercisesPaginated(
            String query, String muscle, String equipment, String difficulty, int page, int size
    ) {
        MuscleGroup muscleGroup = null;
        String muscleStr = "";
        if (muscle != null && !muscle.trim().isEmpty() && !muscle.equalsIgnoreCase("ALL")
                && !muscle.equalsIgnoreCase("FULL_BODY") && !muscle.equalsIgnoreCase("FULL BODY")) {
            try {
                String mUpper = muscle.trim().toUpperCase();
                if (mUpper.equals("QUADS")) mUpper = "QUADRICEPS";
                muscleGroup = MuscleGroup.valueOf(mUpper);
                muscleStr = muscleGroup.name();
            } catch (IllegalArgumentException ignored) {
                muscleStr = muscle.trim();
            }
        }

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

        Page<Exercise> exercisePage = exerciseRepository.searchExercisesWithFilters(q, muscleGroup, muscleStr, eq, diff, pageable);
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
        exercise.setIsCustom(true);
        exercise.setCreatedBy(user);
        exercise.setAttribution("User Custom Exercise");

        Exercise saved = exerciseRepository.save(exercise);
        return ExerciseResponse.fromEntity(saved);
    }

    public List<MuscleGroupSummary> getMuscleGroupSummaries() {
        // Defined 11 Core Groups + Traps + Cardio
        Map<MuscleGroup, String[]> metadata = new LinkedHashMap<>();
        metadata.put(MuscleGroup.CHEST, new String[]{"Chest", "Pectoralis major, minor & sternal head"});
        metadata.put(MuscleGroup.BACK, new String[]{"Back", "Latissimus dorsi, rhomboids & erectors"});
        metadata.put(MuscleGroup.SHOULDERS, new String[]{"Shoulders", "Anterior, lateral & posterior deltoids"});
        metadata.put(MuscleGroup.BICEPS, new String[]{"Biceps", "Biceps brachii & brachialis"});
        metadata.put(MuscleGroup.TRICEPS, new String[]{"Triceps", "Lateral, long & medial heads"});
        metadata.put(MuscleGroup.FOREARMS, new String[]{"Forearms", "Wrist flexors, extensors & brachioradialis"});
        metadata.put(MuscleGroup.ABS, new String[]{"Abs", "Rectus abdominis & obliques"});
        metadata.put(MuscleGroup.GLUTES, new String[]{"Glutes", "Gluteus maximus, medius & minimus"});
        metadata.put(MuscleGroup.QUADRICEPS, new String[]{"Quads", "Rectus femoris & vastus lateralis"});
        metadata.put(MuscleGroup.HAMSTRINGS, new String[]{"Hamstrings", "Biceps femoris, semitendinosus"});
        metadata.put(MuscleGroup.CALVES, new String[]{"Calves", "Gastrocnemius & soleus"});
        metadata.put(MuscleGroup.TRAPS, new String[]{"Traps", "Upper, middle & lower trapezius"});
        metadata.put(MuscleGroup.CARDIO, new String[]{"Cardio", "Cardiovascular stamina & conditioning"});

        List<MuscleGroupSummary> summaries = new ArrayList<>();
        for (Map.Entry<MuscleGroup, String[]> entry : metadata.entrySet()) {
            MuscleGroup mg = entry.getKey();
            String[] info = entry.getValue();
            long count = exerciseRepository.countByPrimaryMuscle(mg);
            summaries.add(new MuscleGroupSummary(mg.name(), info[0], info[1], count));
        }
        return summaries;
    }
}
