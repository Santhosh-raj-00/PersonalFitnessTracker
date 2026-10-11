package com.fittrack.model;

import com.fittrack.model.enums.ExperienceLevel;
import com.fittrack.model.enums.FitnessGoal;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

@Entity
@Table(name = "user_profiles")
public class UserProfile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    @JsonIgnore
    private User user;

    private Integer age;
    private Double heightCm;
    private Double weightKg;

    @Enumerated(EnumType.STRING)
    private FitnessGoal fitnessGoal = FitnessGoal.MAINTAIN;

    @Enumerated(EnumType.STRING)
    private ExperienceLevel experienceLevel = ExperienceLevel.BEGINNER;

    // Comma-separated list of available equipment (e.g. BARBELL,DUMBBELL,CABLE,BODYWEIGHT)
    @Column(length = 500)
    private String availableEquipment = "BARBELL,DUMBBELL,CABLE,MACHINE,BODYWEIGHT";

    private Integer dailyCalorieTarget = 2200;
    private Integer dailyProteinTargetGrams = 150;

    public UserProfile() {}

    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }

    public User getUser() { return user; }
    public void setUser(User user) { this.user = user; }

    public Integer getAge() { return age; }
    public void setAge(Integer age) { this.age = age; }

    public Double getHeightCm() { return heightCm; }
    public void setHeightCm(Double heightCm) { this.heightCm = heightCm; }

    public Double getWeightKg() { return weightKg; }
    public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }

    public FitnessGoal getFitnessGoal() { return fitnessGoal; }
    public void setFitnessGoal(FitnessGoal fitnessGoal) { this.fitnessGoal = fitnessGoal; }

    public ExperienceLevel getExperienceLevel() { return experienceLevel; }
    public void setExperienceLevel(ExperienceLevel experienceLevel) { this.experienceLevel = experienceLevel; }

    public String getAvailableEquipment() { return availableEquipment; }
    public void setAvailableEquipment(String availableEquipment) { this.availableEquipment = availableEquipment; }

    public Integer getDailyCalorieTarget() { return dailyCalorieTarget; }
    public void setDailyCalorieTarget(Integer dailyCalorieTarget) { this.dailyCalorieTarget = dailyCalorieTarget; }

    public Integer getDailyProteinTargetGrams() { return dailyProteinTargetGrams; }
    public void setDailyProteinTargetGrams(Integer dailyProteinTargetGrams) { this.dailyProteinTargetGrams = dailyProteinTargetGrams; }
}
