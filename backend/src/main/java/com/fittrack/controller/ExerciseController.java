package com.fittrack.controller;

import com.fittrack.dto.ExerciseDTOs.*;
import com.fittrack.model.User;
import com.fittrack.repository.UserRepository;
import com.fittrack.service.ExerciseService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/exercises")
@Tag(name = "Exercise Library", description = "Muscle-first exercise library, filters, muscle groups, and custom exercises")
public class ExerciseController {

    private final ExerciseService exerciseService;
    private final UserRepository userRepository;

    public ExerciseController(ExerciseService exerciseService, UserRepository userRepository) {
        this.exerciseService = exerciseService;
        this.userRepository = userRepository;
    }

    @GetMapping
    @Operation(summary = "Search and filter exercises across 11+ muscle groups, equipment and difficulty with optional pagination")
    public ResponseEntity<?> searchExercises(
            @RequestParam(name = "q", required = false) String q,
            @RequestParam(name = "query", required = false) String query,
            @RequestParam(required = false) String muscle,
            @RequestParam(required = false) String equipment,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) Integer page,
            @RequestParam(required = false) Integer size
    ) {
        String effectiveQuery = (q != null && !q.trim().isEmpty()) ? q : query;
        if (page != null) {
            int p = Math.max(0, page);
            int s = size != null ? Math.max(1, size) : 20;
            return ResponseEntity.ok(exerciseService.searchExercisesPaginated(effectiveQuery, muscle, equipment, difficulty, p, s));
        }
        return ResponseEntity.ok(exerciseService.searchExercises(effectiveQuery, muscle, equipment, difficulty));
    }


    @GetMapping("/muscles")
    @Operation(summary = "Get muscle groups and real-time exercise counts for Level 1 grid")
    public ResponseEntity<List<MuscleGroupSummary>> getMuscleGroups() {
        return ResponseEntity.ok(exerciseService.getMuscleGroupSummaries());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get full exercise details including media, activation steps and mistakes")
    public ResponseEntity<ExerciseResponse> getExerciseById(@PathVariable Long id) {
        return ResponseEntity.ok(exerciseService.getExerciseById(id));
    }

    @PostMapping("/custom")
    @Operation(summary = "Create custom exercise linked to current authenticated user")
    public ResponseEntity<ExerciseResponse> createCustomExercise(
            Authentication authentication,
            @Valid @RequestBody CreateCustomExerciseRequest request
    ) {
        Long userId = null;
        if (authentication != null && authentication.getName() != null) {
            User user = userRepository.findByEmail(authentication.getName()).orElse(null);
            if (user != null) {
                userId = user.getId();
            }
        }
        return ResponseEntity.ok(exerciseService.createCustomExercise(userId, request));
    }
}
