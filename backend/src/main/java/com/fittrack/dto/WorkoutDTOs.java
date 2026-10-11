package com.fittrack.dto;

import com.fittrack.model.enums.SessionStatus;
import jakarta.validation.constraints.NotNull;
import java.time.LocalDateTime;
import java.util.List;

public class WorkoutDTOs {

    public static class StartWorkoutRequest {
        private Long routineDayId;
        private String sessionName;

        public Long getRoutineDayId() { return routineDayId; }
        public void setRoutineDayId(Long routineDayId) { this.routineDayId = routineDayId; }
        public String getSessionName() { return sessionName; }
        public void setSessionName(String sessionName) { this.sessionName = sessionName; }
    }

    public static class LogSetRequest {
        @NotNull(message = "Exercise ID is required")
        private Long exerciseId;
        private Integer setOrder;
        
        @NotNull(message = "Weight is required")
        private Double weightKg;
        
        @NotNull(message = "Reps are required")
        private Integer reps;
        
        private Double rpe;
        private Boolean isWarmup = false;

        public Long getExerciseId() { return exerciseId; }
        public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
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
    }

    public static class WorkoutSessionDto {
        private Long id;
        private Long routineDayId;
        private String routineName;
        private String sessionName;
        private LocalDateTime startTime;
        private LocalDateTime endTime;
        private String notes;
        private Double totalVolumeKg;
        private SessionStatus status;
        private List<WorkoutSetDto> sets;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getRoutineDayId() { return routineDayId; }
        public void setRoutineDayId(Long routineDayId) { this.routineDayId = routineDayId; }
        public String getRoutineName() { return routineName; }
        public void setRoutineName(String routineName) { this.routineName = routineName; }
        public String getSessionName() { return sessionName; }
        public void setSessionName(String sessionName) { this.sessionName = sessionName; }
        public LocalDateTime getStartTime() { return startTime; }
        public void setStartTime(LocalDateTime startTime) { this.startTime = startTime; }
        public LocalDateTime getEndTime() { return endTime; }
        public void setEndTime(LocalDateTime endTime) { this.endTime = endTime; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
        public Double getTotalVolumeKg() { return totalVolumeKg; }
        public void setTotalVolumeKg(Double totalVolumeKg) { this.totalVolumeKg = totalVolumeKg; }
        public SessionStatus getStatus() { return status; }
        public void setStatus(SessionStatus status) { this.status = status; }
        public List<WorkoutSetDto> getSets() { return sets; }
        public void setSets(List<WorkoutSetDto> sets) { this.sets = sets; }
    }

    public static class WorkoutSetDto {
        private Long id;
        private Long exerciseId;
        private String exerciseName;
        private String primaryMuscle;
        private Integer setOrder;
        private Double weightKg;
        private Integer reps;
        private Double rpe;
        private Boolean isWarmup;
        private Double estimated1rm;
        private Boolean isPr;
        private LocalDateTime loggedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getExerciseId() { return exerciseId; }
        public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
        public String getExerciseName() { return exerciseName; }
        public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }
        public String getPrimaryMuscle() { return primaryMuscle; }
        public void setPrimaryMuscle(String primaryMuscle) { this.primaryMuscle = primaryMuscle; }
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

    public static class LastExerciseStatsDto {
        private Long exerciseId;
        private Double lastWeightKg;
        private Integer lastReps;
        private Double maxWeightKg;
        private Double maxEstimated1rm;
        private LocalDateTime lastLoggedAt;

        public Long getExerciseId() { return exerciseId; }
        public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
        public Double getLastWeightKg() { return lastWeightKg; }
        public void setLastWeightKg(Double lastWeightKg) { this.lastWeightKg = lastWeightKg; }
        public Integer getLastReps() { return lastReps; }
        public void setLastReps(Integer lastReps) { this.lastReps = lastReps; }
        public Double getMaxWeightKg() { return maxWeightKg; }
        public void setMaxWeightKg(Double maxWeightKg) { this.maxWeightKg = maxWeightKg; }
        public Double getMaxEstimated1rm() { return maxEstimated1rm; }
        public void setMaxEstimated1rm(Double maxEstimated1rm) { this.maxEstimated1rm = maxEstimated1rm; }
        public LocalDateTime getLastLoggedAt() { return lastLoggedAt; }
        public void setLastLoggedAt(LocalDateTime lastLoggedAt) { this.lastLoggedAt = lastLoggedAt; }
    }
}
