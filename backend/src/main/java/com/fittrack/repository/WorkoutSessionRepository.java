package com.fittrack.repository;

import com.fittrack.model.WorkoutSession;
import com.fittrack.model.enums.SessionStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface WorkoutSessionRepository extends JpaRepository<WorkoutSession, Long> {
    List<WorkoutSession> findByUserIdOrderByStartTimeDesc(Long userId);
    
    Optional<WorkoutSession> findFirstByUserIdAndStatus(Long userId, SessionStatus status);
    
    List<WorkoutSession> findByUserIdAndStartTimeBetweenOrderByStartTimeAsc(
            Long userId, LocalDateTime start, LocalDateTime end
    );

    @Query("SELECT COUNT(DISTINCT DATE(ws.startTime)) FROM WorkoutSession ws WHERE ws.user.id = :userId AND ws.status = 'COMPLETED'")
    Long countCompletedWorkoutDays(@Param("userId") Long userId);
}
