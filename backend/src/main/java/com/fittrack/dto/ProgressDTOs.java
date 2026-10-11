package com.fittrack.dto;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class ProgressDTOs {

    public static class ChartDataPoint {
        private String date;
        private Double value;
        private Double secondaryValue;
        private String label;

        public ChartDataPoint(String date, Double value) {
            this.date = date;
            this.value = value;
        }

        public ChartDataPoint(String date, Double value, Double secondaryValue, String label) {
            this.date = date;
            this.value = value;
            this.secondaryValue = secondaryValue;
            this.label = label;
        }

        public String getDate() { return date; }
        public void setDate(String date) { this.date = date; }
        public Double getValue() { return value; }
        public void setValue(Double value) { this.value = value; }
        public Double getSecondaryValue() { return secondaryValue; }
        public void setSecondaryValue(Double secondaryValue) { this.secondaryValue = secondaryValue; }
        public String getLabel() { return label; }
        public void setLabel(String label) { this.label = label; }
    }

    public static class ExerciseProgressDto {
        private Long exerciseId;
        private String exerciseName;
        private List<ChartDataPoint> weightHistory;
        private List<ChartDataPoint> estimated1rmHistory;
        private List<ChartDataPoint> volumeHistory;

        public Long getExerciseId() { return exerciseId; }
        public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
        public String getExerciseName() { return exerciseName; }
        public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }
        public List<ChartDataPoint> getWeightHistory() { return weightHistory; }
        public void setWeightHistory(List<ChartDataPoint> weightHistory) { this.weightHistory = weightHistory; }
        public List<ChartDataPoint> getEstimated1rmHistory() { return estimated1rmHistory; }
        public void setEstimated1rmHistory(List<ChartDataPoint> estimated1rmHistory) { this.estimated1rmHistory = estimated1rmHistory; }
        public List<ChartDataPoint> getVolumeHistory() { return volumeHistory; }
        public void setVolumeHistory(List<ChartDataPoint> volumeHistory) { this.volumeHistory = volumeHistory; }
    }

    public static class BodyMetricDto {
        private Long id;
        private LocalDate recordedDate;
        private Double weightKg;
        private Double bodyFatPercentage;
        private Double chestCm;
        private Double waistCm;
        private Double armsCm;
        private Double thighsCm;
        private String notes;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public LocalDate getRecordedDate() { return recordedDate; }
        public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }
        public Double getWeightKg() { return weightKg; }
        public void setWeightKg(Double weightKg) { this.weightKg = weightKg; }
        public Double getBodyFatPercentage() { return bodyFatPercentage; }
        public void setBodyFatPercentage(Double bodyFatPercentage) { this.bodyFatPercentage = bodyFatPercentage; }
        public Double getChestCm() { return chestCm; }
        public void setChestCm(Double chestCm) { this.chestCm = chestCm; }
        public Double getWaistCm() { return waistCm; }
        public void setWaistCm(Double waistCm) { this.waistCm = waistCm; }
        public Double getArmsCm() { return armsCm; }
        public void setArmsCm(Double armsCm) { this.armsCm = armsCm; }
        public Double getThighsCm() { return thighsCm; }
        public void setThighsCm(Double thighsCm) { this.thighsCm = thighsCm; }
        public String getNotes() { return notes; }
        public void setNotes(String notes) { this.notes = notes; }
    }

    public static class ProgressPhotoDto {
        private Long id;
        private LocalDate recordedDate;
        private String photoUrl;
        private String tag;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public LocalDate getRecordedDate() { return recordedDate; }
        public void setRecordedDate(LocalDate recordedDate) { this.recordedDate = recordedDate; }
        public String getPhotoUrl() { return photoUrl; }
        public void setPhotoUrl(String photoUrl) { this.photoUrl = photoUrl; }
        public String getTag() { return tag; }
        public void setTag(String tag) { this.tag = tag; }
    }

    public static class PRDto {
        private Long id;
        private Long exerciseId;
        private String exerciseName;
        private String recordType;
        private Double recordValue;
        private Integer reps;
        private LocalDateTime achievedAt;

        public Long getId() { return id; }
        public void setId(Long id) { this.id = id; }
        public Long getExerciseId() { return exerciseId; }
        public void setExerciseId(Long exerciseId) { this.exerciseId = exerciseId; }
        public String getExerciseName() { return exerciseName; }
        public void setExerciseName(String exerciseName) { this.exerciseName = exerciseName; }
        public String getRecordType() { return recordType; }
        public void setRecordType(String recordType) { this.recordType = recordType; }
        public Double getRecordValue() { return recordValue; }
        public void setRecordValue(Double recordValue) { this.recordValue = recordValue; }
        public Integer getReps() { return reps; }
        public void setReps(Integer reps) { this.reps = reps; }
        public LocalDateTime getAchievedAt() { return achievedAt; }
        public void setAchievedAt(LocalDateTime achievedAt) { this.achievedAt = achievedAt; }
    }

    public static class DashboardSummaryDto {
        private Integer totalWorkoutsCompleted;
        private Double totalVolumeThisWeekKg;
        private Integer activeStreakDays;
        private List<PRDto> recentPRs;
        private List<ChartDataPoint> weeklyVolumeChart;
        private List<ChartDataPoint> bodyWeightChart;
        private List<RoutineDTOs.RoutineDto> recommendedRoutines;

        public Integer getTotalWorkoutsCompleted() { return totalWorkoutsCompleted; }
        public void setTotalWorkoutsCompleted(Integer totalWorkoutsCompleted) { this.totalWorkoutsCompleted = totalWorkoutsCompleted; }
        public Double getTotalVolumeThisWeekKg() { return totalVolumeThisWeekKg; }
        public void setTotalVolumeThisWeekKg(Double totalVolumeThisWeekKg) { this.totalVolumeThisWeekKg = totalVolumeThisWeekKg; }
        public Integer getActiveStreakDays() { return activeStreakDays; }
        public void setActiveStreakDays(Integer activeStreakDays) { this.activeStreakDays = activeStreakDays; }
        public List<PRDto> getRecentPRs() { return recentPRs; }
        public void setRecentPRs(List<PRDto> recentPRs) { this.recentPRs = recentPRs; }
        public List<ChartDataPoint> getWeeklyVolumeChart() { return weeklyVolumeChart; }
        public void setWeeklyVolumeChart(List<ChartDataPoint> weeklyVolumeChart) { this.weeklyVolumeChart = weeklyVolumeChart; }
        public List<ChartDataPoint> getBodyWeightChart() { return bodyWeightChart; }
        public void setBodyWeightChart(List<ChartDataPoint> bodyWeightChart) { this.bodyWeightChart = bodyWeightChart; }
        public List<RoutineDTOs.RoutineDto> getRecommendedRoutines() { return recommendedRoutines; }
        public void setRecommendedRoutines(List<RoutineDTOs.RoutineDto> recommendedRoutines) { this.recommendedRoutines = recommendedRoutines; }
    }
}
