package com.fittrack.controller;

import com.fittrack.dto.WorkoutDTOs;
import com.fittrack.service.WorkoutService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/workouts")
@Tag(name = "Workout Logger", description = "Start sessions, log sets, auto PR detection, and workout history")
public class WorkoutController {

    private final WorkoutService workoutService;

    public WorkoutController(WorkoutService workoutService) {
        this.workoutService = workoutService;
    }

    @PostMapping("/start")
    @Operation(summary = "Start a new workout session or resume active session")
    public ResponseEntity<WorkoutDTOs.WorkoutSessionDto> startWorkout(
            Authentication authentication,
            @RequestBody(required = false) WorkoutDTOs.StartWorkoutRequest request
    ) {
        WorkoutDTOs.StartWorkoutRequest req = request != null ? request : new WorkoutDTOs.StartWorkoutRequest();
        return ResponseEntity.ok(workoutService.startWorkout(authentication.getName(), req));
    }

    @GetMapping("/active")
    @Operation(summary = "Get currently active workout session")
    public ResponseEntity<WorkoutDTOs.WorkoutSessionDto> getActiveSession(Authentication authentication) {
        return ResponseEntity.ok(workoutService.getActiveSession(authentication.getName()));
    }

    @PostMapping("/{sessionId}/sets")
    @Operation(summary = "Log a set for an exercise with automatic PR detection")
    public ResponseEntity<WorkoutDTOs.WorkoutSetDto> logSet(
            Authentication authentication,
            @PathVariable Long sessionId,
            @Valid @RequestBody WorkoutDTOs.LogSetRequest request
    ) {
        return ResponseEntity.ok(workoutService.logSet(authentication.getName(), sessionId, request));
    }

    @PostMapping("/{sessionId}/finish")
    @Operation(summary = "Finish active workout session")
    public ResponseEntity<WorkoutDTOs.WorkoutSessionDto> finishWorkout(
            Authentication authentication,
            @PathVariable Long sessionId,
            @RequestParam(required = false) String notes
    ) {
        return ResponseEntity.ok(workoutService.finishWorkout(authentication.getName(), sessionId, notes));
    }

    @GetMapping("/history")
    @Operation(summary = "Get past workout history")
    public ResponseEntity<List<WorkoutDTOs.WorkoutSessionDto>> getWorkoutHistory(Authentication authentication) {
        return ResponseEntity.ok(workoutService.getWorkoutHistory(authentication.getName()));
    }

    @GetMapping("/last-stats/{exerciseId}")
    @Operation(summary = "Get last session stats and max PRs for an exercise")
    public ResponseEntity<WorkoutDTOs.LastExerciseStatsDto> getLastExerciseStats(
            Authentication authentication,
            @PathVariable Long exerciseId
    ) {
        return ResponseEntity.ok(workoutService.getLastExerciseStats(authentication.getName(), exerciseId));
    }
}
