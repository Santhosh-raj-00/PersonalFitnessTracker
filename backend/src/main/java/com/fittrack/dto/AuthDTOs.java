package com.fittrack.dto;

import com.fittrack.model.enums.ExperienceLevel;
import com.fittrack.model.enums.FitnessGoal;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class AuthDTOs {

    public static class LoginRequest {
        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address format")
        private String email;

        @NotBlank(message = "Password is required")
        private String password;

        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class RegisterRequest {
        @NotBlank(message = "Full name is required")
        private String fullName;

        @NotBlank(message = "Email is required")
        @Email(message = "Invalid email address format")
        private String email;

        @NotBlank(message = "Password is required")
        @Size(min = 6, message = "Password must be at least 6 characters")
        private String password;

        private Integer age;
        private Double heightCm;
        private Double weightKg;
        private FitnessGoal fitnessGoal = FitnessGoal.MAINTAIN;
        private ExperienceLevel experienceLevel = ExperienceLevel.BEGINNER;
        private String availableEquipment = "BARBELL,DUMBBELL,CABLE,MACHINE,BODYWEIGHT";

        public String getFullName() { return fullName; }
        public void setFullName(String fullName) { this.fullName = fullName; }
        public String getEmail() { return email; }
        public void setEmail(String email) { this.email = email; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
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
    }

    public static class AuthResponse {
        private String token;
        private Long userId;
        private String email;
        private String fullName;
        private String role;
        private UserProfileDto profile;

        public AuthResponse(String token, Long userId, String email, String fullName, String role, UserProfileDto profile) {
            this.token = token;
            this.userId = userId;
            this.email = email;
            this.fullName = fullName;
            this.role = role;
            this.profile = profile;
        }

        public String getToken() { return token; }
        public Long getUserId() { return userId; }
        public String getEmail() { return email; }
        public String getFullName() { return fullName; }
        public String getRole() { return role; }
        public UserProfileDto getProfile() { return profile; }
    }

    public static class UserProfileDto {
        private Long id;
        private Integer age;
        private Double heightCm;
        private Double weightKg;
        private FitnessGoal fitnessGoal;
        private ExperienceLevel experienceLevel;
        private String availableEquipment;
        private Integer dailyCalorieTarget;
        private Integer dailyProteinTargetGrams;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
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
}
