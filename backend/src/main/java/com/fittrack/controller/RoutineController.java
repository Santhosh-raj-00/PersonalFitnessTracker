package com.fittrack.controller;

import com.fittrack.dto.RoutineDTOs;
import com.fittrack.service.RoutineService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/routines")
@Tag(name = "Routines & Splits", description = "Manage custom routines and split templates")
public class RoutineController {

    private final RoutineService routineService;

    public RoutineController(RoutineService routineService) {
        this.routineService = routineService;
    }

    @GetMapping
    @Operation(summary = "Get available routines (user routines and system templates)")
    public ResponseEntity<List<RoutineDTOs.RoutineDto>> getAvailableRoutines(Authentication authentication) {
        return ResponseEntity.ok(routineService.getAvailableRoutinesForUser(authentication.getName()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get routine details by ID")
    public ResponseEntity<RoutineDTOs.RoutineDto> getRoutineById(@PathVariable Long id) {
        return ResponseEntity.ok(routineService.getRoutineById(id));
    }

    @PostMapping
    @Operation(summary = "Create custom routine split")
    public ResponseEntity<RoutineDTOs.RoutineDto> createCustomRoutine(
            Authentication authentication,
            @Valid @RequestBody RoutineDTOs.CreateRoutineRequest request
    ) {
        return ResponseEntity.ok(routineService.createCustomRoutine(authentication.getName(), request));
    }
}
