package com.fittrack.repository;

import com.fittrack.model.Routine;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RoutineRepository extends JpaRepository<Routine, Long> {
    List<Routine> findByUserId(Long userId);
    List<Routine> findByIsTemplateTrue();
    
    @Query("SELECT r FROM Routine r WHERE r.isTemplate = true OR r.user.id = :userId")
    List<Routine> findAvailableRoutinesForUser(@Param("userId") Long userId);
}
