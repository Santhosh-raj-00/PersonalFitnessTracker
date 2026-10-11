package com.fittrack.model;

import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "routine_days")
public class RoutineDay {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "routine_id", nullable = false)
    @JsonIgnore
    private Routine routine;

    @Column(nullable = false)
    private String dayName;

    private Integer dayOrder;

    @OneToMany(mappedBy = "routineDay", cascade = CascadeType.ALL, orphanRemoval = true)
    @OrderBy("exerciseOrder ASC")
    private List<RoutineExercise> exercises = new ArrayList<>();

    public RoutineDay() {}

    public RoutineDay(String dayName, Integer dayOrder) {
        this.dayName = dayName;
        this.dayOrder = dayOrder;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public Routine getRoutine() { return routine; }
    public void setRoutine(Routine routine) { this.routine = routine; }

    public String getDayName() { return dayName; }
    public void setDayName(String dayName) { this.dayName = dayName; }

    public Integer getDayOrder() { return dayOrder; }
    public void setDayOrder(Integer dayOrder) { this.dayOrder = dayOrder; }

    public List<RoutineExercise> getExercises() { return exercises; }
    public void setExercises(List<RoutineExercise> exercises) { this.exercises = exercises; }
}
