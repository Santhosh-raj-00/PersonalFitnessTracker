package com.fittrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "workout_sets")
public class WorkoutSet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "session_id", nullable = false)
    @JsonIgnore
    private WorkoutSession workoutSession;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    private Integer setOrder;
    private Double weightKg;
    private Integer reps;
    private Double rpe; // Optional RPE (1-10)
    private Boolean isWarmup = false;
    private Double estimated1rm;
    private Boolean isPr = false;

    private LocalDateTime loggedAt = LocalDateTime.now();

    public WorkoutSet() {}

    public WorkoutSet(WorkoutSession workoutSession, Exercise exercise, Integer setOrder, Double weightKg, Integer reps, Double rpe, Boolean isWarmup) {
        this.workoutSession = workoutSession;
        this.exercise = exercise;
        this.setOrder = setOrder;
        this.weightKg = weightKg;
        this.reps = reps;
        this.rpe = rpe;
        this.isWarmup = isWarmup != null ? isWarmup : false;
        this.loggedAt = LocalDateTime.now();
        this.calculateEstimated1RM();
    }

    public void calculateEstimated1RM() {
        if (weightKg != null && reps != null && reps > 0) {
            if (reps == 1) {
                this.estimated1rm = weightKg;
            } else {
                this.estimated1rm = Math.round(weightKg * (1.0 + reps / 30.0) * 10.0) / 10.0;
            }
        } else {
            this.estimated1rm = 0.0;
        }
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public WorkoutSession getWorkoutSession() { return workoutSession; }
    public void setWorkoutSession(WorkoutSession workoutSession) { this.workoutSession = workoutSession; }

    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }

    public Integer getSetOrder() { return setOrder; }
    public void setSetOrder(Integer setOrder) { this.setOrder = setOrder; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public Integer getReps() { return reps; }
    public void setReps(Integer reps) { this.reps = reps; }

    public Double getRpe() { return rpe; }
    public void setRpe(Double rpe) { this.rpe = rpe; }

    public Boolean getIsWarmup() { return isWarmup; }
    public void setIsWarmup(Boolean isWarmup) { this.isWarmup = isWarmup; }

    public Double getEstimated1rm() { return estimated1rm; }
    public void setEstimated1rm(Double estimated1rm) { this.estimated1rm = estimated1rm; }

    public Boolean getIsPr() { return isPr; }
    public void setIsPr(Boolean isPr) { this.isPr = isPr; }

    public LocalDateTime getLoggedAt() { return loggedAt; }
    public void setLoggedAt(LocalDateTime loggedAt) { this.loggedAt = loggedAt; }
}
