package com.fittrack.repository;

import com.fittrack.model.RoutineDay;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface RoutineDayRepository extends JpaRepository<RoutineDay, Long> {
}

