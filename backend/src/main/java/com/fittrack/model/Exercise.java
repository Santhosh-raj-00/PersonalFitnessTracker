package com.fittrack.model;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fittrack.model.enums.Difficulty;
import com.fittrack.model.enums.Equipment;
import com.fittrack.model.enums.MuscleGroup;
import jakarta.persistence.*;

import java.util.Arrays;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

@Entity
@Table(name = "exercises")
public class Exercise {

    private static final ObjectMapper MAPPER = new ObjectMapper();

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, unique = true)
    private String name;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MuscleGroup primaryMuscle;

    // Comma-separated secondary muscles
    @Column(length = 255)
    private String secondaryMuscles;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Equipment equipment;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private Difficulty difficulty;

    @Column(length = 2000)
    private String formTips;

    private String demoImageUrl;

    @Column(length = 1000)
    private String mediaUrl;

    @Column(length = 1000)
    private String thumbnailUrl;

    @Column(columnDefinition = "TEXT")
    private String stepsJson;

    @Column(columnDefinition = "TEXT")
    private String mistakesJson;

    private Integer defaultSets = 3;

    @Column(length = 50)
    private String defaultReps = "8-12";

    @Column(length = 500)
    private String attribution;

    private Boolean isCustom = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_id")
    private User createdBy;

    public Exercise() {}

    public Exercise(String name, MuscleGroup primaryMuscle, String secondaryMuscles, Equipment equipment, Difficulty difficulty, String formTips, String demoImageUrl) {
        this.name = name;
        this.primaryMuscle = primaryMuscle;
        this.secondaryMuscles = secondaryMuscles;
        this.equipment = equipment;
        this.difficulty = difficulty;
        this.formTips = formTips;
        this.demoImageUrl = demoImageUrl;
        this.thumbnailUrl = demoImageUrl;
        this.mediaUrl = demoImageUrl;
        this.isCustom = false;
        this.defaultSets = 3;
        this.defaultReps = "8-12";
    }

    public Exercise(String name, MuscleGroup primaryMuscle, String secondaryMuscles, Equipment equipment,
                    Difficulty difficulty, String mediaUrl, String thumbnailUrl, List<String> steps,
                    List<String> mistakes, Integer defaultSets, String defaultReps, String attribution) {
        this.name = name;
        this.primaryMuscle = primaryMuscle;
        this.secondaryMuscles = secondaryMuscles;
        this.equipment = equipment;
        this.difficulty = difficulty;
        this.mediaUrl = mediaUrl;
        this.thumbnailUrl = thumbnailUrl;
        this.demoImageUrl = thumbnailUrl != null ? thumbnailUrl : mediaUrl;
        this.setSteps(steps);
        this.setMistakes(mistakes);
        this.defaultSets = defaultSets != null ? defaultSets : 3;
        this.defaultReps = defaultReps != null ? defaultReps : "8-12";
        this.attribution = attribution;
        this.formTips = (steps != null && !steps.isEmpty()) ? steps.get(0) : "Perform with controlled tempo and braced core.";
        this.isCustom = false;
    }

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public MuscleGroup getPrimaryMuscle() { return primaryMuscle; }
    public void setPrimaryMuscle(MuscleGroup primaryMuscle) { this.primaryMuscle = primaryMuscle; }

    public String getSecondaryMuscles() { return secondaryMuscles; }
    public void setSecondaryMuscles(String secondaryMuscles) { this.secondaryMuscles = secondaryMuscles; }

    public Equipment getEquipment() { return equipment; }
    public void setEquipment(Equipment equipment) { this.equipment = equipment; }

    public Difficulty getDifficulty() { return difficulty; }
    public void setDifficulty(Difficulty difficulty) { this.difficulty = difficulty; }

    public String getFormTips() { return formTips; }
    public void setFormTips(String formTips) { this.formTips = formTips; }

    public String getDemoImageUrl() { return demoImageUrl; }
    public void setDemoImageUrl(String demoImageUrl) { this.demoImageUrl = demoImageUrl; }

    public String getMediaUrl() { return mediaUrl; }
    public void setMediaUrl(String mediaUrl) { this.mediaUrl = mediaUrl; }

    public String getThumbnailUrl() { return thumbnailUrl; }
    public void setThumbnailUrl(String thumbnailUrl) { this.thumbnailUrl = thumbnailUrl; }

    public String getStepsJson() { return stepsJson; }
    public void setStepsJson(String stepsJson) { this.stepsJson = stepsJson; }

    public String getMistakesJson() { return mistakesJson; }
    public void setMistakesJson(String mistakesJson) { this.mistakesJson = mistakesJson; }

    public Integer getDefaultSets() { return defaultSets != null ? defaultSets : 3; }
    public void setDefaultSets(Integer defaultSets) { this.defaultSets = defaultSets; }

    public String getDefaultReps() { return defaultReps != null ? defaultReps : "8-12"; }
    public void setDefaultReps(String defaultReps) { this.defaultReps = defaultReps; }

    public String getAttribution() { return attribution; }
    public void setAttribution(String attribution) { this.attribution = attribution; }

    public Boolean getIsCustom() { return isCustom; }
    public void setIsCustom(Boolean isCustom) { this.isCustom = isCustom; }

    public User getCreatedBy() { return createdBy; }
    public void setCreatedBy(User createdBy) { this.createdBy = createdBy; }

    // Helper Methods for primaryMuscles and secondaryMuscles lists
    public List<String> getPrimaryMuscles() {
        if (primaryMuscle == null) return Collections.emptyList();
        return Collections.singletonList(primaryMuscle.name());
    }

    public List<String> getSecondaryMusclesList() {
        if (secondaryMuscles == null || secondaryMuscles.trim().isEmpty()) {
            return Collections.emptyList();
        }
        return Arrays.stream(secondaryMuscles.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .collect(Collectors.toList());
    }

    public List<String> getSteps() {
        if (stepsJson == null || stepsJson.trim().isEmpty()) {
            if (formTips != null && !formTips.trim().isEmpty()) {
                return Collections.singletonList(formTips);
            }
            return Collections.emptyList();
        }
        try {
            return MAPPER.readValue(stepsJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.singletonList(stepsJson);
        }
    }

    public void setSteps(List<String> steps) {
        if (steps == null || steps.isEmpty()) {
            this.stepsJson = "[]";
            return;
        }
        try {
            this.stepsJson = MAPPER.writeValueAsString(steps);
        } catch (Exception e) {
            this.stepsJson = "[]";
        }
    }

    public List<String> getMistakes() {
        if (mistakesJson == null || mistakesJson.trim().isEmpty()) {
            return Collections.emptyList();
        }
        try {
            return MAPPER.readValue(mistakesJson, new TypeReference<List<String>>() {});
        } catch (Exception e) {
            return Collections.emptyList();
        }
    }

    public void setMistakes(List<String> mistakes) {
        if (mistakes == null || mistakes.isEmpty()) {
            this.mistakesJson = "[]";
            return;
        }
        try {
            this.mistakesJson = MAPPER.writeValueAsString(mistakes);
        } catch (Exception e) {
            this.mistakesJson = "[]";
        }
    }
}
