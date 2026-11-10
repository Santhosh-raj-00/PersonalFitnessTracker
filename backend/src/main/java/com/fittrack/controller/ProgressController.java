package com.fittrack.controller;

import com.fittrack.dto.ProgressDTOs;
import com.fittrack.service.ProgressService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/progress")
@Tag(name = "Progress & Analytics", description = "Dashboard analytics, strength charts, 1RM, body metrics, and PR tracking")
public class ProgressController {

    private final ProgressService progressService;

    public ProgressController(ProgressService progressService) {
        this.progressService = progressService;
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard analytics summary")
    public ResponseEntity<ProgressDTOs.DashboardSummaryDto> getDashboardSummary(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(progressService.getDashboardSummary(authentication.getName()));
    }

    @GetMapping("/exercise/{exerciseId}")
    @Operation(summary = "Get progress chart history for a specific exercise")
    public ResponseEntity<ProgressDTOs.ExerciseProgressDto> getExerciseProgress(
            Authentication authentication,
            @PathVariable Long exerciseId
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(progressService.getExerciseProgress(authentication.getName(), exerciseId));
    }

    @PostMapping("/body-metrics")
    @Operation(summary = "Log body metrics (weight, body fat %, measurements)")
    public ResponseEntity<ProgressDTOs.BodyMetricDto> logBodyMetric(
            Authentication authentication,
            @Valid @RequestBody ProgressDTOs.BodyMetricDto dto
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(progressService.logBodyMetric(authentication.getName(), dto));
    }

    @GetMapping("/body-metrics")
    @Operation(summary = "Get body metrics history over time")
    public ResponseEntity<List<ProgressDTOs.BodyMetricDto>> getBodyMetricsHistory(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(progressService.getBodyMetricsHistory(authentication.getName()));
    }

    @PostMapping("/photos")
    @Operation(summary = "Log progress photo link")
    public ResponseEntity<ProgressDTOs.ProgressPhotoDto> logProgressPhoto(
            Authentication authentication,
            @Valid @RequestBody ProgressDTOs.ProgressPhotoDto dto
    ) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(progressService.logProgressPhoto(authentication.getName(), dto));
    }

    @GetMapping("/photos")
    @Operation(summary = "Get progress photos history")
    public ResponseEntity<List<ProgressDTOs.ProgressPhotoDto>> getProgressPhotos(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(progressService.getProgressPhotos(authentication.getName()));
    }

    @GetMapping("/prs")
    @Operation(summary = "Get user personal records history")
    public ResponseEntity<List<ProgressDTOs.PRDto>> getPersonalRecords(Authentication authentication) {
        if (authentication == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }
        return ResponseEntity.ok(progressService.getPersonalRecords(authentication.getName()));
    }
}
