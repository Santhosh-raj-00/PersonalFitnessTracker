package com.fittrack.model;

import com.fittrack.model.enums.RecordType;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "personal_records")
public class PersonalRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnoreProperties({"hibernateLazyInitializer", "handler", "password"})
    private User user;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private RecordType recordType;

    @Column(nullable = false)
    private Double recordValue;

    private Integer reps;

    private LocalDateTime achievedAt = LocalDateTime.now();

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "workout_set_id")
    private WorkoutSet workoutSet;

    public PersonalRecord() {}

    public PersonalRecord(User user, Exercise exercise, RecordType recordType, Double recordValue, Integer reps, WorkoutSet workoutSet) {
        this.user = user;
        this.exercise = exercise;
        this.recordType = recordType;
        this.recordValue = recordValue;
        this.reps = reps;
        this.workoutSet = workoutSet;
        this.achievedAt = LocalDateTime.now();
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }

    public RecordType getRecordType() { return recordType; }
    public void setRecordType(RecordType recordType) { this.recordType = recordType; }

    public Double getRecordValue() { return recordValue; }
    public void setRecordValue(Double recordValue) { this.recordValue = recordValue; }

    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }

    public LocalDateTime getAchievedAt() { return achievedAt; }
    public void setAchievedAt(LocalDateTime achievedAt) { this.achievedAt = achievedAt; }

    public WorkoutSet getWorkoutSet() { return workoutSet; }
    public void setWorkoutSet(WorkoutSet workoutSet) { this.workoutSet = workoutSet; }
}
