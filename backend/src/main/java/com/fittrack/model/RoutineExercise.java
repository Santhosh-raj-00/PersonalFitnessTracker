package com.fittrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "routine_exercises")
public class RoutineExercise {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_day_id", nullable = false)
    @JsonIgnore
    private RoutineDay routineDay;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "exercise_id", nullable = false)
    private Exercise exercise;

    private Integer exerciseOrder;
    private Integer targetSets = 3;
    private String targetRepRange = "8-12";
    private Integer restSeconds = 90;
    private String notes;

    public RoutineExercise() {}

    public RoutineExercise(Exercise exercise, Integer exerciseOrder, Integer targetSets, String targetRepRange, Integer restSeconds) {
        this.exercise = exercise;
        this.exerciseOrder = exerciseOrder;
        this.targetSets = targetSets;
        this.targetRepRange = targetRepRange;
        this.restSeconds = restSeconds;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public RoutineDay getRoutineDay() { return routineDay; }
    public void setRoutineDay(RoutineDay routineDay) { this.routineDay = routineDay; }

    public Exercise getExercise() { return exercise; }
    public void setExercise(Exercise exercise) { this.exercise = exercise; }

    public Integer getExerciseOrder() { return exerciseOrder; }
    public void setExerciseOrder(Integer exerciseOrder) { this.exerciseOrder = exerciseOrder; }

    public Integer getTargetSets() { return targetSets; }
    public void setTargetSets(Integer targetSets) { this.targetSets = targetSets; }

    public String getTargetRepRange() { return targetRepRange; }
    public void setTargetRepRange(String targetRepRange) { this.targetRepRange = targetRepRange; }

    public Integer getRestSeconds() { return restSeconds; }
    public void setRestSeconds(Integer restSeconds) { this.restSeconds = restSeconds; }

    public String getNotes() { return notes; }
    public void setNotes(String notes) { this.notes = notes; }
}
