package com.fittrack.service;

import com.fittrack.dto.ProgressDTOs;
import com.fittrack.model.*;
import com.fittrack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
public class ProgressService {

    private final UserRepository userRepository;
    private final WorkoutSetRepository workoutSetRepository;
    private final BodyMetricRepository bodyMetricRepository;
    private final ProgressPhotoRepository progressPhotoRepository;
    private final PersonalRecordRepository personalRecordRepository;
    private final WorkoutSessionRepository workoutSessionRepository;
    private final RoutineService routineService;

    public ProgressService(UserRepository userRepository,
                           WorkoutSetRepository workoutSetRepository,
                           BodyMetricRepository bodyMetricRepository,
                           ProgressPhotoRepository progressPhotoRepository,
                           PersonalRecordRepository personalRecordRepository,
                           WorkoutSessionRepository workoutSessionRepository,
                           RoutineService routineService) {
        this.userRepository = userRepository;
        this.workoutSetRepository = workoutSetRepository;
        this.bodyMetricRepository = bodyMetricRepository;
        this.progressPhotoRepository = progressPhotoRepository;
        this.personalRecordRepository = personalRecordRepository;
        this.workoutSessionRepository = workoutSessionRepository;
        this.routineService = routineService;
    }

    public ProgressDTOs.ExerciseProgressDto getExerciseProgress(String userEmail, Long exerciseId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<WorkoutSet> history = workoutSetRepository.findExerciseHistoryForUser(user.getId(), exerciseId);

        ProgressDTOs.ExerciseProgressDto dto = new ProgressDTOs.ExerciseProgressDto();
        dto.setExerciseId(exerciseId);
        if (!history.isEmpty()) {
            dto.setExerciseName(history.get(0).getExercise().getName());
        }

        DateTimeFormatter fmt = DateTimeFormatter.ofPattern("MMM dd");
        List<ProgressDTOs.ChartDataPoint> weightHistory = new ArrayList<>();
        List<ProgressDTOs.ChartDataPoint> e1rmHistory = new ArrayList<>();
        List<ProgressDTOs.ChartDataPoint> volumeHistory = new ArrayList<>();

        for (WorkoutSet set : history) {
            if (set.getIsWarmup()) continue;
            String dateStr = set.getLoggedAt().format(fmt);
            weightHistory.add(new ProgressDTOs.ChartDataPoint(dateStr, set.getWeightKg()));
            e1rmHistory.add(new ProgressDTOs.ChartDataPoint(dateStr, set.getEstimated1rm()));
            volumeHistory.add(new ProgressDTOs.ChartDataPoint(dateStr, set.getWeightKg() * set.getReps()));
        }

        dto.setWeightHistory(weightHistory);
        dto.setEstimated1rmHistory(e1rmHistory);
        dto.setVolumeHistory(volumeHistory);
        return dto;
    }

    @Transactional
    public ProgressDTOs.BodyMetricDto logBodyMetric(String userEmail, ProgressDTOs.BodyMetricDto dto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        BodyMetric metric = new BodyMetric(
                user,
                dto.getRecordedDate() != null ? dto.getRecordedDate() : LocalDate.now(),
                dto.getWeightKg(),
                dto.getBodyFatPercentage(),
                dto.getChestCm(),
                dto.getWaistCm(),
                dto.getArmsCm(),
                dto.getThighsCm(),
                dto.getNotes()
        );

        metric = bodyMetricRepository.save(metric);
        return mapToMetricDto(metric);
    }

    public List<ProgressDTOs.BodyMetricDto> getBodyMetricsHistory(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return bodyMetricRepository.findByUserIdOrderByRecordedDateAsc(user.getId())
                .stream().map(this::mapToMetricDto).collect(Collectors.toList());
    }

    @Transactional
    public ProgressDTOs.ProgressPhotoDto logProgressPhoto(String userEmail, ProgressDTOs.ProgressPhotoDto dto) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        ProgressPhoto photo = new ProgressPhoto(
                user,
                dto.getRecordedDate() != null ? dto.getRecordedDate() : LocalDate.now(),
                dto.getPhotoUrl(),
                dto.getTag() != null ? dto.getTag() : "FRONT"
        );

        photo = progressPhotoRepository.save(photo);
        return mapToPhotoDto(photo);
    }

    public List<ProgressDTOs.ProgressPhotoDto> getProgressPhotos(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return progressPhotoRepository.findByUserIdOrderByRecordedDateDesc(user.getId())
                .stream().map(this::mapToPhotoDto).collect(Collectors.toList());
    }

    public List<ProgressDTOs.PRDto> getPersonalRecords(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        return personalRecordRepository.findByUserIdOrderByAchievedAtDesc(user.getId())
                .stream().map(this::mapToPRDto).collect(Collectors.toList());
    }

    public ProgressDTOs.DashboardSummaryDto getDashboardSummary(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<WorkoutSession> completed = workoutSessionRepository.findByUserIdOrderByStartTimeDesc(user.getId())
                .stream().filter(s -> s.getStatus().name().equals("COMPLETED")).collect(Collectors.toList());

        ProgressDTOs.DashboardSummaryDto summary = new ProgressDTOs.DashboardSummaryDto();
        summary.setTotalWorkoutsCompleted(completed.size());

        // Calculate this week volume
        LocalDateTime weekAgo = LocalDateTime.now().minusDays(7);
        double volumeThisWeek = completed.stream()
                .filter(s -> s.getStartTime() != null && s.getStartTime().isAfter(weekAgo))
                .mapToDouble(s -> s.getTotalVolumeKg() != null ? s.getTotalVolumeKg() : 0.0)
                .sum();
        summary.setTotalVolumeThisWeekKg(Math.round(volumeThisWeek * 10.0) / 10.0);

        // Calculate active streak
        summary.setActiveStreakDays(calculateStreakDays(completed));

        // Recent PRs
        List<ProgressDTOs.PRDto> prs = personalRecordRepository.findByUserIdOrderByAchievedAtDesc(user.getId())
                .stream().limit(5).map(this::mapToPRDto).collect(Collectors.toList());
        summary.setRecentPRs(prs);

        // Weekly volume chart
        DateTimeFormatter dayFmt = DateTimeFormatter.ofPattern("EEE");
        List<ProgressDTOs.ChartDataPoint> weeklyVolume = new ArrayList<>();
        for (int i = 6; i >= 0; i--) {
            LocalDate date = LocalDate.now().minusDays(i);
            double dayVol = completed.stream()
                    .filter(s -> s.getStartTime() != null && s.getStartTime().toLocalDate().equals(date))
                    .mapToDouble(s -> s.getTotalVolumeKg() != null ? s.getTotalVolumeKg() : 0.0)
                    .sum();
            weeklyVolume.add(new ProgressDTOs.ChartDataPoint(date.format(dayFmt), Math.round(dayVol * 10.0) / 10.0));
        }
        summary.setWeeklyVolumeChart(weeklyVolume);

        // Body weight chart
        List<BodyMetric> metrics = bodyMetricRepository.findByUserIdOrderByRecordedDateAsc(user.getId());
        DateTimeFormatter dateFmt = DateTimeFormatter.ofPattern("MMM dd");
        List<ProgressDTOs.ChartDataPoint> bodyWeightChart = metrics.stream()
                .filter(m -> m.getWeightKg() != null)
                .map(m -> new ProgressDTOs.ChartDataPoint(m.getRecordedDate().format(dateFmt), m.getWeightKg()))
                .collect(Collectors.toList());
        summary.setBodyWeightChart(bodyWeightChart);

        summary.setRecommendedRoutines(routineService.getAvailableRoutinesForUser(userEmail));

        return summary;
    }

    private int calculateStreakDays(List<WorkoutSession> completedSessions) {
        if (completedSessions.isEmpty()) return 0;

        Set<LocalDate> workoutDates = completedSessions.stream()
                .map(s -> s.getStartTime().toLocalDate())
                .collect(Collectors.toSet());

        LocalDate today = LocalDate.now();
        int streak = 0;

        // Check if user worked out today or yesterday to maintain active streak
        LocalDate current = workoutDates.contains(today) ? today : (workoutDates.contains(today.minusDays(1)) ? today.minusDays(1) : null);

        if (current == null) return 0;

        while (workoutDates.contains(current)) {
            streak++;
            current = current.minusDays(1);
        }

        return streak;
    }

    private ProgressDTOs.BodyMetricDto mapToMetricDto(BodyMetric m) {
        ProgressDTOs.BodyMetricDto dto = new ProgressDTOs.BodyMetricDto();
        dto.setId(m.getId());
        dto.setRecordedDate(m.getRecordedDate());
        dto.setWeightKg(m.getWeightKg());
        dto.setBodyFatPercentage(m.getBodyFatPercentage());
        dto.setChestCm(m.getChestCm());
        dto.setWaistCm(m.getWaistCm());
        dto.setArmsCm(m.getArmsCm());
        dto.setThighsCm(m.getThighsCm());
        dto.setNotes(m.getNotes());
        return dto;
    }

    private ProgressDTOs.ProgressPhotoDto mapToPhotoDto(ProgressPhoto p) {
        ProgressDTOs.ProgressPhotoDto dto = new ProgressDTOs.ProgressPhotoDto();
        dto.setId(p.getId());
        dto.setRecordedDate(p.getRecordedDate());
        dto.setPhotoUrl(p.getPhotoUrl());
        dto.setTag(p.getTag());
        return dto;
    }

    private ProgressDTOs.PRDto mapToPRDto(PersonalRecord pr) {
        ProgressDTOs.PRDto dto = new ProgressDTOs.PRDto();
        dto.setId(pr.getId());
        dto.setExerciseId(pr.getExercise().getId());
        dto.setExerciseName(pr.getExercise().getName());
        dto.setRecordType(pr.getRecordType().name());
        dto.setRecordValue(pr.getRecordValue());
        dto.setReps(pr.getReps());
        dto.setAchievedAt(pr.getAchievedAt());
        return dto;
    }
}
