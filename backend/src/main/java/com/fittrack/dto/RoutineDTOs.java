package com.fittrack.dto;

import jakarta.validation.constraints.NotBlank;
import java.util.List;

public class RoutineDTOs {

    public static class RoutineDto {
        private Long id;
        private String name;
        private String description;
        private Boolean isTemplate;
        private String splitType;
        private List<RoutineDayDto> days;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public Boolean getIsTemplate() { return isTemplate; }
        public void setIsTemplate(Boolean isTemplate) { this.isTemplate = isTemplate; }
        public String getSplitType() { return splitType; }
        public void setSplitType(String splitType) { this.splitType = splitType; }
        public List<RoutineDayDto> getDays() { return days; }
        public void setDays(List<RoutineDayDto> days) { this.days = days; }
    }

    public static class RoutineDayDto {
        private Long id;
        private String dayName;
        private Integer dayOrder;
        private List<RoutineExerciseDto> exercises;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public String getDayName() { return dayName; }
        public void setDayName(String dayName) { this.dayName = dayName; }
        public Integer getDayOrder() { return dayOrder; }
        public void setDayOrder(Integer dayOrder) { this.dayOrder = dayOrder; }
        public List<RoutineExerciseDto> getExercises() { return exercises; }
        public void setExercises(List<RoutineExerciseDto> exercises) { this.exercises = exercises; }
    }

    public static class RoutineExerciseDto {
        private Long id;
        private Long exerciseId;
        private String exerciseName;
        private String primaryMuscle;
        private String equipment;
        private String demoImageUrl;
        private Integer exerciseOrder;
        private Integer targetSets;
        private String targetRepRange;
        private Integer restSeconds;
        private String notes;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getExerciseId() { return exerciseId; }
        public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
        public String getExerciseName() { return exerciseName; }
        public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }
        public String getPrimaryMuscle() { return primaryMuscle; }
        public void setPrimaryMuscle(String primaryMuscle) { this.primaryMuscle = primaryMuscle; }
        public String getEquipment() { return equipment; }
        public void setEquipment(String equipment) { this.equipment = equipment; }
        public String getDemoImageUrl() { return demoImageUrl; }
        public void setDemoImageUrl(String demoImageUrl) { this.demoImageUrl = demoImageUrl; }
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

    public static class CreateRoutineRequest {
        @NotBlank(message = "Routine name is required")
        private String name;
        private String description;
        private String splitType = "CUSTOM";
        private List<CreateRoutineDayRequest> days;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }
        public String getDescription() { return description; }
        public void setDescription(String description) { this.description = description; }
        public String getSplitType() { return splitType; }
        public void setSplitType(String splitType) { this.splitType = splitType; }
        public List<CreateRoutineDayRequest> getDays() { return days; }
        public void setDays(List<CreateRoutineDayRequest> days) { this.days = days; }
    }

    public static class CreateRoutineDayRequest {
        @NotBlank(message = "Day name is required")
        private String dayName;
        private Integer dayOrder;
        private List<CreateRoutineExerciseRequest> exercises;

        public String getDayName() { return dayName; }
        public void setDayName(String dayName) { this.dayName = dayName; }
        public Integer getDayOrder() { return dayOrder; }
        public void setDayOrder(Integer dayOrder) { this.dayOrder = dayOrder; }
        public List<CreateRoutineExerciseRequest> getExercises() { return exercises; }
        public void setExercises(List<CreateRoutineExerciseRequest> exercises) { this.exercises = exercises; }
    }

    public static class CreateRoutineExerciseRequest {
        private Long exerciseId;
        private Integer exerciseOrder;
        private Integer targetSets = 3;
        private String targetRepRange = "8-12";
        private Integer restSeconds = 90;
        private String notes;

        public Long getExerciseId() { return exerciseId; }
        public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
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
}
