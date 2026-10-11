package com.fittrack.service;

import com.fittrack.dto.WorkoutDTOs;
import com.fittrack.model.*;
import com.fittrack.model.enums.RecordType;
import com.fittrack.model.enums.SessionStatus;
import com.fittrack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
public class WorkoutService {

    private final WorkoutSessionRepository workoutSessionRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;
    private final PersonalRecordRepository personalRecordRepository;

    public WorkoutService(WorkoutSessionRepository workoutSessionRepository,
                          WorkoutSetRepository workoutSetRepository,
                          UserRepository userRepository,
                          ExerciseRepository exerciseRepository,
                          PersonalRecordRepository personalRecordRepository) {
        this.workoutSessionRepository = workoutSessionRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
        this.personalRecordRepository = personalRecordRepository;
    }

    @Transactional
    public WorkoutDTOs.WorkoutSessionDto startWorkout(String userEmail, WorkoutDTOs.StartWorkoutRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        // Check for any active in-progress workout
        Optional<WorkoutSession> active = workoutSessionRepository.findFirstByUserIdAndStatus(user.getId(), SessionStatus.IN_PROGRESS);
        if (active.isPresent()) {
            return mapToSessionDto(active.get());
        }

        WorkoutSession session = new WorkoutSession();
        session.setUser(user);
        session.setRoutineDayId(request.getRoutineDayId());
        session.setSessionName(request.getSessionName() != null ? request.getSessionName() : "Workout");
        session.setStartTime(LocalDateTime.now());
        session.setStatus(SessionStatus.IN_PROGRESS);

        session = workoutSessionRepository.save(session);
        return mapToSessionDto(session);
    }

    public WorkoutDTOs.WorkoutSessionDto getActiveSession(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return workoutSessionRepository.findFirstByUserIdAndStatus(user.getId(), SessionStatus.IN_PROGRESS)
                .map(this::mapToSessionDto)
                .orElse(null);
    }

    @Transactional
    public WorkoutDTOs.WorkoutSetDto logSet(String userEmail, Long sessionId, WorkoutDTOs.LogSetRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Workout session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Unauthorized access to workout session");
        }

        Exercise exercise = exerciseRepository.findById(request.getExerciseId())
                .orElseThrow(() -> new IllegalArgumentException("Exercise not found"));

        int setOrder = request.getSetOrder() != null ? request.getSetOrder() : session.getSets().size() + 1;

        WorkoutSet set = new WorkoutSet(
                session, exercise, setOrder, request.getWeightKg(), request.getReps(), request.getRpe(), request.getIsWarmup()
        );

        // Save the set first so it is persisted and has an ID for PersonalRecord references
        set = workoutSetRepository.save(set);

        // Auto PR detection logic
        boolean isPr = checkForPersonalRecords(user, exercise, set);
        if (isPr) {
            set.setIsPr(true);
            set = workoutSetRepository.save(set);
        }

        session.getSets().add(set);

        // Update total volume
        double totalVolume = session.getSets().stream()
                .filter(s -> s.getIsWarmup() != null && !s.getIsWarmup())
                .mapToDouble(s -> (s.getWeightKg() != null ? s.getWeightKg() : 0.0) * (s.getReps() != null ? s.getReps() : 0))
                .sum();
        session.setTotalVolumeKg(totalVolume);
        workoutSessionRepository.save(session);

        return mapToSetDto(set);
    }

    @Transactional
    public WorkoutDTOs.WorkoutSessionDto finishWorkout(String userEmail, Long sessionId, String notes) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        WorkoutSession session = workoutSessionRepository.findById(sessionId)
                .orElseThrow(() -> new IllegalArgumentException("Workout session not found"));

        if (!session.getUser().getId().equals(user.getId())) {
            throw new IllegalStateException("Unauthorized access to workout session");
        }

        session.setEndTime(LocalDateTime.now());
        session.setStatus(SessionStatus.COMPLETED);
        if (notes != null) {
            session.setNotes(notes);
        }

        double totalVolume = session.getSets().stream()
                .filter(s -> s.getIsWarmup() != null && !s.getIsWarmup())
                .mapToDouble(s -> (s.getWeightKg() != null ? s.getWeightKg() : 0.0) * (s.getReps() != null ? s.getReps() : 0))
                .sum();
        session.setTotalVolumeKg(totalVolume);

        session = workoutSessionRepository.save(session);
        return mapToSessionDto(session);
    }

    public List<WorkoutDTOs.WorkoutSessionDto> getWorkoutHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));
        return workoutSessionRepository.findByUserIdOrderByStartTimeDesc(user.getId())
                .stream().map(this::mapToSessionDto).collect(Collectors.toList());
    }

    public WorkoutDTOs.LastExerciseStatsDto getLastExerciseStats(String userEmail, Long exerciseId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<WorkoutSet> sets = workoutSetRepository.findLastSetsForExercise(user.getId(), exerciseId);
        WorkoutDTOs.LastExerciseStatsDto dto = new WorkoutDTOs.LastExerciseStatsDto();
        dto.setExerciseId(exerciseId);

        if (!sets.isEmpty()) {
            WorkoutSet lastSet = sets.get(0);
            dto.setLastWeightKg(lastSet.getWeightKg());
            dto.setLastReps(lastSet.getReps());
            dto.setLastLoggedAt(lastSet.getLoggedAt());
        }

        dto.setMaxWeightKg(workoutSetRepository.findMaxWeightForUserAndExercise(user.getId(), exerciseId).orElse(0.0));
        dto.setMaxEstimated1rm(workoutSetRepository.findMax1RMForUserAndExercise(user.getId(), exerciseId).orElse(0.0));

        return dto;
    }

    /**
     * Checks if a logged set beats existing Personal Records for weight or 1RM.
     */
    public boolean checkForPersonalRecords(User user, Exercise exercise, WorkoutSet set) {
        if (set.getIsWarmup()) return false;

        boolean isNewPR = false;

        // 1. Max Weight PR
        Optional<PersonalRecord> existingMaxWeight = personalRecordRepository
                .findFirstByUserIdAndExerciseIdAndRecordTypeOrderByRecordValueDesc(user.getId(), exercise.getId(), RecordType.MAX_WEIGHT);

        if (existingMaxWeight.isEmpty() || set.getWeightKg() > existingMaxWeight.get().getRecordValue()) {
            PersonalRecord pr = new PersonalRecord(user, exercise, RecordType.MAX_WEIGHT, set.getWeightKg(), set.getReps(), set);
            personalRecordRepository.save(pr);
            isNewPR = true;
        }

        // 2. Max 1RM PR
        Optional<PersonalRecord> existing1RM = personalRecordRepository
                .findFirstByUserIdAndExerciseIdAndRecordTypeOrderByRecordValueDesc(user.getId(), exercise.getId(), RecordType.MAX_1RM);

        if (existing1RM.isEmpty() || set.getEstimated1rm() > existing1RM.get().getRecordValue()) {
            PersonalRecord pr = new PersonalRecord(user, exercise, RecordType.MAX_1RM, set.getEstimated1rm(), set.getReps(), set);
            personalRecordRepository.save(pr);
            isNewPR = true;
        }

        return isNewPR;
    }

    public WorkoutDTOs.WorkoutSessionDto mapToSessionDto(WorkoutSession session) {
        WorkoutDTOs.WorkoutSessionDto dto = new WorkoutDTOs.WorkoutSessionDto();
        dto.setId(session.getId());
        dto.setRoutineDayId(session.getRoutineDayId());
        dto.setRoutineName(session.getRoutineName());
        dto.setSessionName(session.getSessionName());
        dto.setStartTime(session.getStartTime());
        dto.setEndTime(session.getEndTime());
        dto.setNotes(session.getNotes());
        dto.setTotalVolumeKg(session.getTotalVolumeKg());
        dto.setStatus(session.getStatus());

        List<WorkoutDTOs.WorkoutSetDto> setDtos = new ArrayList<>();
        if (session.getSets() != null) {
            for (WorkoutSet set : session.getSets()) {
                setDtos.add(mapToSetDto(set));
            }
        }
        dto.setSets(setDtos);
        return dto;
    }

    public WorkoutDTOs.WorkoutSetDto mapToSetDto(WorkoutSet set) {
        WorkoutDTOs.WorkoutSetDto dto = new WorkoutDTOs.WorkoutSetDto();
        dto.setId(set.getId());
        dto.setExerciseId(set.getExercise().getId());
        dto.setExerciseName(set.getExercise().getName());
        dto.setPrimaryMuscle(set.getExercise().getPrimaryMuscle().name());
        dto.setSetOrder(set.getSetOrder());
        dto.setWeightKg(set.getWeightKg());
        dto.setReps(set.getReps());
        dto.setRpe(set.getRpe());
        dto.setIsWarmup(set.getIsWarmup());
        dto.setEstimated1rm(set.getEstimated1rm());
        dto.setIsPr(set.getIsPr());
        dto.setLoggedAt(set.getLoggedAt());
        return dto;
    }
}
