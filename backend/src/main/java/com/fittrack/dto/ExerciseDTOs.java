package com.fittrack.dto;

import com.fittrack.model.Exercise;
import com.fittrack.model.enums.Difficulty;
import com.fittrack.model.enums.Equipment;
import com.fittrack.model.enums.MuscleGroup;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.List;

public class ExerciseDTOs {

    public static class ExerciseResponse {
        private Long id;
        private String name;
        private MuscleGroup primaryMuscle;
        private List<String> primaryMuscles;
        private String secondaryMuscles;
        private List<String> secondaryMusclesList;
        private Equipment equipment;
        private Difficulty difficulty;
        private String formTips;
        private String mediaUrl;
        private String thumbnailUrl;
        private String demoImageUrl;
        private List<String> steps;
        private List<String> mistakes;
        private Integer defaultSets;
        private String defaultReps;
        private Boolean isCustom;
        private String attribution;

        public ExerciseResponse() {}

        public static ExerciseResponse fromEntity(Exercise e) {
            ExerciseResponse res = new ExerciseResponse();
            res.setId(e.getId());
            res.setName(e.getName());
            res.setPrimaryMuscle(e.getPrimaryMuscle());
            res.setPrimaryMuscles(e.getPrimaryMuscles());
            res.setSecondaryMuscles(e.getSecondaryMuscles());
            res.setSecondaryMusclesList(e.getSecondaryMusclesList());
            res.setEquipment(e.getEquipment());
            res.setDifficulty(e.getDifficulty());
            res.setFormTips(e.getFormTips());
            res.setMediaUrl(e.getMediaUrl() != null ? e.getMediaUrl() : e.getDemoImageUrl());
            res.setThumbnailUrl(e.getThumbnailUrl() != null ? e.getThumbnailUrl() : e.getDemoImageUrl());
            res.setDemoImageUrl(e.getDemoImageUrl() != null ? e.getDemoImageUrl() : e.getThumbnailUrl());
            res.setSteps(e.getSteps());
            res.setMistakes(e.getMistakes());
            res.setDefaultSets(e.getDefaultSets());
            res.setDefaultReps(e.getDefaultReps());
            res.setIsCustom(e.getIsCustom());
            res.setAttribution(e.getAttribution());
            return res;
        }

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public MuscleGroup getPrimaryMuscle() { return primaryMuscle; }
        public void setPrimaryMuscle(MuscleGroup primaryMuscle) { this.primaryMuscle = primaryMuscle; }

        public List<String> getPrimaryMuscles() { return primaryMuscles; }
        public void setPrimaryMuscles(List<String> primaryMuscles) { this.primaryMuscles = primaryMuscles; }

        public String getSecondaryMuscles() { return secondaryMuscles; }
        public void setSecondaryMuscles(String secondaryMuscles) { this.secondaryMuscles = secondaryMuscles; }

        public List<String> getSecondaryMusclesList() { return secondaryMusclesList; }
        public void setSecondaryMusclesList(List<String> secondaryMusclesList) { this.secondaryMusclesList = secondaryMusclesList; }

        public Equipment getEquipment() { return equipment; }
        public void setEquipment(Equipment equipment) { this.equipment = equipment; }

        public Difficulty getDifficulty() { return difficulty; }
        public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

        public String getFormTips() { return formTips; }
        public void setFormTips(String formTips) { this.formTips = formTips; }

        public String getMediaUrl() { return mediaUrl; }
        public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public String getDemoImageUrl() { return demoImageUrl; }
        public void setDemoImageUrl(String demoImageUrl) { this.demoImageUrl = demoImageUrl; }

        public List<String> getSteps() { return steps; }
        public void setSteps(List<String> steps) { this.steps = steps; }

        public List<String> getMistakes() { return mistakes; }
        public void setMistakes(List<String> mistakes) { this.mistakes = mistakes; }

        public Integer getDefaultSets() { return defaultSets; }
        public void setDefaultSets(Integer defaultSets) { this.defaultSets = defaultSets; }

        public String getDefaultReps() { return defaultReps; }
        public void setDefaultReps(String defaultReps) { this.defaultReps = defaultReps; }

        public Boolean getIsCustom() { return isCustom; }
        public void setIsCustom(Boolean custom) { isCustom = custom; }

        public String getAttribution() { return attribution; }
        public void setAttribution(String attribution) { this.attribution = attribution; }
    }

    public static class CreateCustomExerciseRequest {
        @NotBlank(message = "Exercise name is required")
        private String name;

        @NotNull(message = "Primary muscle is required")
        private MuscleGroup primaryMuscle;

        private List<String> secondaryMuscles;

        @NotNull(message = "Equipment is required")
        private Equipment equipment;

        @NotNull(message = "Difficulty is required")
        private Difficulty difficulty;

        private String mediaUrl;
        private String thumbnailUrl;
        private List<String> steps;
        private List<String> mistakes;
        private Integer defaultSets;
        private String defaultReps;

        public String getName() { return name; }
        public void setName(String name) { this.name = name; }

        public MuscleGroup getPrimaryMuscle() { return primaryMuscle; }
        public void setPrimaryMuscle(MuscleGroup primaryMuscle) { this.primaryMuscle = primaryMuscle; }

        public List<String> getSecondaryMuscles() { return secondaryMuscles; }
        public void setSecondaryMuscles(List<String> secondaryMuscles) { this.secondaryMuscles = secondaryMuscles; }

        public Equipment getEquipment() { return equipment; }
        public void setEquipment(Equipment equipment) { this.equipment = equipment; }

        public Difficulty getDifficulty() { return difficulty; }
        public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

        public String getMediaUrl() { return mediaUrl; }
        public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

        public String getThumbnailUrl() { return thumbnailUrl; }
        public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

        public List<String> getSteps() { return steps; }
        public void setSteps(List<String> steps) { this.steps = steps; }

        public List<String> getMistakes() { return mistakes; }
        public void setMistakes(List<String> mistakes) { this.mistakes = mistakes; }

        public Integer getDefaultSets() { return defaultSets; }
        public void setDefaultSets(Integer defaultSets) { this.defaultSets = defaultSets; }

        public String getDefaultReps() { return defaultReps; }
        public void setDefaultReps(String defaultReps) { this.defaultReps = defaultReps; }
    }

    public static class MuscleGroupSummary {
        private String id;
        private String displayName;
        private String description;
        private long exerciseCount;

        public MuscleGroupSummary(String id, String displayName, String description, long exerciseCount) {
            this.id = id;
            this.displayName = displayName;
            this.description = description;
            this.exerciseCount = exerciseCount;
        }

        public String getId() { return id; }
        public String getDisplayName() { return displayName; }
        public String getDescription() { return description; }
        public long getExerciseCount() { return exerciseCount; }
    }

    public static class PageResponse<T> {
        private List<T> content;
        private int page;
        private int size;
        private long totalElements;
        private int totalPages;
        private boolean last;

        public PageResponse() {}

        public PageResponse(List<T> content, int page, int size, long totalElements, int totalPages, boolean last) {
            this.content = content;
            this.page = page;
            this.size = size;
            this.totalElements = totalElements;
            this.totalPages = totalPages;
            this.last = last;
        }

        public List<T> getContent() { return content; }
        public void setContent(List<T> content) { this.content = content; }
        public int getPage() { return page; }
        public void setPage(int page) { this.page = page; }
        public int getSize() { return size; }
        public void setSize(int size) { this.size = size; }
        public long getTotalElements() { return totalElements; }
        public void setTotalElements(long totalElements) { this.totalElements = totalElements; }
        public int getTotalPages() { return totalPages; }
        public void setTotalPages(int totalPages) { this.totalPages = totalPages; }
        public boolean isLast() { return last; }
        public void setLast(boolean last) { this.last = last; }
    }
}

