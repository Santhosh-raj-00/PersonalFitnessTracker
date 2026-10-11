package com.fittrack.repository;

import com.fittrack.model.WorkoutSet;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutSetRepository extends JpaRepository<WorkoutSet, Long> {
    
    @Query("SELECT ws FROM WorkoutSet ws WHERE ws.workoutSession.user.id = :userId AND ws.exercise.id = :exerciseId ORDER BY ws.loggedAt DESC")
    List<WorkoutSet> findLastSetsForExercise(@Param("userId") Long userId, @Param("exerciseId") Long exerciseId);

    @Query("SELECT MAX(ws.weightKg) FROM WorkoutSet ws WHERE ws.workoutSession.user.id = :userId AND ws.exercise.id = :exerciseId AND ws.isWarmup = false")
    Optional<Double> findMaxWeightForUserAndExercise(@Param("userId") Long userId, @Param("exerciseId") Long exerciseId);

    @Query("SELECT MAX(ws.estimated1rm) FROM WorkoutSet ws WHERE ws.workoutSession.user.id = :userId AND ws.exercise.id = :exerciseId AND ws.isWarmup = false")
    Optional<Double> findMax1RMForUserAndExercise(@Param("userId") Long userId, @Param("exerciseId") Long exerciseId);

    @Query("SELECT ws FROM WorkoutSet ws WHERE ws.workoutSession.user.id = :userId AND ws.exercise.id = :exerciseId ORDER BY ws.loggedAt ASC")
    List<WorkoutSet> findExerciseHistoryForUser(@Param("userId") Long userId, @Param("exerciseId") Long exerciseId);
}
