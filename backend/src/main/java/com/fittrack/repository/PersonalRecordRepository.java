package com.fittrack.repository;

import com.fittrack.model.PersonalRecord;
import com.fittrack.model.enums.RecordType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PersonalRecordRepository extends JpaRepository<PersonalRecord, Long> {
    List<PersonalRecord> findByUserIdOrderByAchievedAtDesc(Long userId);
    
    Optional<PersonalRecord> findFirstByUserIdAndExerciseIdAndRecordTypeOrderByRecordValueDesc(
            Long userId, Long exerciseId, RecordType recordType
    );

    List<PersonalRecord> findByUserIdAndExerciseIdOrderByAchievedAtDesc(Long userId, Long exerciseId);
}
