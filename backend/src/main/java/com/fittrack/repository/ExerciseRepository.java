package com.fittrack.repository;

import com.fittrack.model.Exercise;
import com.fittrack.model.enums.Difficulty;
import com.fittrack.model.enums.Equipment;
import com.fittrack.model.enums.MuscleGroup;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ExerciseRepository extends JpaRepository<Exercise, Long> {

    @Query(value = "SELECT e FROM Exercise e WHERE " +
           "(:query IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:muscle IS NULL OR e.primaryMuscle = :muscle OR LOWER(e.secondaryMuscles) LIKE LOWER(CONCAT('%', :muscleStr, '%'))) AND " +
           "(:equipment IS NULL OR e.equipment = :equipment) AND " +
           "(:difficulty IS NULL OR e.difficulty = :difficulty) " +
           "ORDER BY e.isCustom DESC, e.name ASC",
           countQuery = "SELECT count(e) FROM Exercise e WHERE " +
           "(:query IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:muscle IS NULL OR e.primaryMuscle = :muscle OR LOWER(e.secondaryMuscles) LIKE LOWER(CONCAT('%', :muscleStr, '%'))) AND " +
           "(:equipment IS NULL OR e.equipment = :equipment) AND " +
           "(:difficulty IS NULL OR e.difficulty = :difficulty)")
    Page<Exercise> searchExercisesWithFilters(
            @Param("query") String query,
            @Param("muscle") MuscleGroup muscle,
            @Param("muscleStr") String muscleStr,
            @Param("equipment") Equipment equipment,
            @Param("difficulty") Difficulty difficulty,
            Pageable pageable
    );

    @Query("SELECT e FROM Exercise e WHERE " +
           "(:query IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:muscle IS NULL OR e.primaryMuscle = :muscle OR LOWER(e.secondaryMuscles) LIKE LOWER(CONCAT('%', :muscleStr, '%'))) AND " +
           "(:equipment IS NULL OR e.equipment = :equipment) AND " +
           "(:difficulty IS NULL OR e.difficulty = :difficulty) " +
           "ORDER BY e.isCustom DESC, e.name ASC")
    List<Exercise> searchExercisesWithFilters(
            @Param("query") String query,
            @Param("muscle") MuscleGroup muscle,
            @Param("muscleStr") String muscleStr,
            @Param("equipment") Equipment equipment,
            @Param("difficulty") Difficulty difficulty
    );


    @Query("SELECT e FROM Exercise e WHERE " +
           "(:query IS NULL OR LOWER(e.name) LIKE LOWER(CONCAT('%', :query, '%'))) AND " +
           "(:muscle IS NULL OR e.primaryMuscle = :muscle OR LOWER(e.secondaryMuscles) LIKE LOWER(CONCAT('%', :muscleStr, '%'))) AND " +
           "(:equipment IS NULL OR e.equipment = :equipment)")
    List<Exercise> searchExercises(
            @Param("query") String query,
            @Param("muscle") MuscleGroup muscle,
            @Param("muscleStr") String muscleStr,
            @Param("equipment") Equipment equipment
    );

    List<Exercise> findByPrimaryMuscle(MuscleGroup primaryMuscle);

    long countByPrimaryMuscle(MuscleGroup primaryMuscle);

    Optional<Exercise> findByNameIgnoreCase(String name);

    boolean existsByNameIgnoreCase(String name);
}
