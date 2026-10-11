package com.fittrack.repository;

import com.fittrack.model.BodyMetric;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BodyMetricRepository extends JpaRepository<BodyMetric, Long> {
    List<BodyMetric> findByUserIdOrderByRecordedDateAsc(Long userId);
}
