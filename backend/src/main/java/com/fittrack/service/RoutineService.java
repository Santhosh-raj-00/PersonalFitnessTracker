package com.fittrack.service;

import com.fittrack.dto.RoutineDTOs;
import com.fittrack.model.*;
import com.fittrack.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final RoutineDayRepository routineDayRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    public RoutineService(RoutineRepository routineRepository, RoutineDayRepository routineDayRepository, UserRepository userRepository, ExerciseRepository exerciseRepository) {
        this.routineRepository = routineRepository;
        this.routineDayRepository = routineDayRepository;
        this.userRepository = userRepository;
        this.exerciseRepository = exerciseRepository;
    }

    public List<RoutineDTOs.RoutineDto> getAvailableRoutinesForUser(String userEmail) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        List<Routine> routines = routineRepository.findAvailableRoutinesForUser(user.getId());
        return routines.stream().map(this::mapToDto).collect(Collectors.toList());
    }

    public RoutineDTOs.RoutineDto getRoutineById(Long id) {
        Routine routine = routineRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Routine not found with ID: " + id));
        return mapToDto(routine);
    }

    public RoutineDTOs.RoutineDayDto getRoutineDayById(Long dayId) {
        RoutineDay day = routineDayRepository.findById(dayId)
                .orElseThrow(() -> new IllegalArgumentException("Routine day not found with ID: " + dayId));
        return mapToDayDto(day);
    }

    @Transactional
    public RoutineDTOs.RoutineDto createCustomRoutine(String userEmail, RoutineDTOs.CreateRoutineRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Routine routine = new Routine();
        routine.setUser(user);
        routine.setName(request.getName());
        routine.setDescription(request.getDescription());
        routine.setIsTemplate(false);
        routine.setSplitType(request.getSplitType() != null ? request.getSplitType() : "CUSTOM");

        populateDaysAndExercises(routine, request.getDays());

        routine = routineRepository.save(routine);
        return mapToDto(routine);
    }

    @Transactional
    public RoutineDTOs.RoutineDto updateRoutine(String userEmail, Long routineId, RoutineDTOs.CreateRoutineRequest request) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new IllegalArgumentException("Routine not found with ID: " + routineId));

        // If routine is a system template, clone it as a new custom routine for the user instead of breaking the template
        if (Boolean.TRUE.equals(routine.getIsTemplate()) || routine.getUser() == null || !routine.getUser().getId().equals(user.getId())) {
            Routine customRoutine = new Routine();
            customRoutine.setUser(user);
            customRoutine.setName(request.getName());
            customRoutine.setDescription(request.getDescription());
            customRoutine.setIsTemplate(false);
            customRoutine.setSplitType(request.getSplitType() != null ? request.getSplitType() : "CUSTOM");
            populateDaysAndExercises(customRoutine, request.getDays());
            customRoutine = routineRepository.save(customRoutine);
            return mapToDto(customRoutine);
        }

        // Updating user's own routine in-place
        routine.setName(request.getName());
        routine.setDescription(request.getDescription());
        if (request.getSplitType() != null) {
            routine.setSplitType(request.getSplitType());
        }

        routine.getDays().clear();
        routineRepository.flush();

        populateDaysAndExercises(routine, request.getDays());

        routine = routineRepository.save(routine);
        return mapToDto(routine);
    }

    @Transactional
    public void deleteRoutine(String userEmail, Long routineId) {
        User user = userRepository.findByEmail(userEmail)
                .orElseThrow(() -> new IllegalArgumentException("User not found"));

        Routine routine = routineRepository.findById(routineId)
                .orElseThrow(() -> new IllegalArgumentException("Routine not found with ID: " + routineId));

        if (Boolean.TRUE.equals(routine.getIsTemplate()) && !user.getRole().name().equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Cannot delete default system templates");
        }

        if (routine.getUser() != null && !routine.getUser().getId().equals(user.getId()) && !user.getRole().name().equals("ROLE_ADMIN")) {
            throw new IllegalArgumentException("Unauthorized to delete this routine");
        }

        routineRepository.delete(routine);
    }

    private void populateDaysAndExercises(Routine routine, List<RoutineDTOs.CreateRoutineDayRequest> dayRequests) {
        if (dayRequests == null) return;

        for (RoutineDTOs.CreateRoutineDayRequest dayReq : dayRequests) {
            RoutineDay day = new RoutineDay();
            day.setRoutine(routine);
            day.setDayName(dayReq.getDayName());
            day.setDayOrder(dayReq.getDayOrder() != null ? dayReq.getDayOrder() : routine.getDays().size() + 1);

            if (dayReq.getExercises() != null) {
                for (RoutineDTOs.CreateRoutineExerciseRequest exReq : dayReq.getExercises()) {
                    Exercise exercise = exerciseRepository.findById(exReq.getExerciseId())
                            .orElseThrow(() -> new IllegalArgumentException("Exercise not found with ID: " + exReq.getExerciseId()));

                    RoutineExercise re = new RoutineExercise();
                    re.setRoutineDay(day);
                    re.setExercise(exercise);
                    re.setExerciseOrder(exReq.getExerciseOrder() != null ? exReq.getExerciseOrder() : day.getExercises().size() + 1);
                    re.setTargetSets(exReq.getTargetSets() != null ? exReq.getTargetSets() : 3);
                    re.setTargetRepRange(exReq.getTargetRepRange() != null ? exReq.getTargetRepRange() : "8-12");
                    re.setRestSeconds(exReq.getRestSeconds() != null ? exReq.getRestSeconds() : 90);
                    re.setNotes(exReq.getNotes());
                    day.getExercises().add(re);
                }
            }
            routine.getDays().add(day);
        }
    }

    public RoutineDTOs.RoutineDto mapToDto(Routine routine) {
        RoutineDTOs.RoutineDto dto = new RoutineDTOs.RoutineDto();
        dto.setId(routine.getId());
        dto.setName(routine.getName());
        dto.setDescription(routine.getDescription());
        dto.setIsTemplate(routine.getIsTemplate());
        dto.setSplitType(routine.getSplitType());

        List<RoutineDTOs.RoutineDayDto> dayDtos = new ArrayList<>();
        if (routine.getDays() != null) {
            for (RoutineDay day : routine.getDays()) {
                dayDtos.add(mapToDayDto(day));
            }
        }
        dto.setDays(dayDtos);
        return dto;
    }

    public RoutineDTOs.RoutineDayDto mapToDayDto(RoutineDay day) {
        RoutineDTOs.RoutineDayDto dayDto = new RoutineDTOs.RoutineDayDto();
        dayDto.setId(day.getId());
        dayDto.setDayName(day.getDayName());
        dayDto.setDayOrder(day.getDayOrder());

        List<RoutineDTOs.RoutineExerciseDto> exDtos = new ArrayList<>();
        if (day.getExercises() != null) {
            for (RoutineExercise re : day.getExercises()) {
                RoutineDTOs.RoutineExerciseDto exDto = new RoutineDTOs.RoutineExerciseDto();
                exDto.setId(re.getId());
                if (re.getExercise() != null) {
                    exDto.setExerciseId(re.getExercise().getId());
                    exDto.setExerciseName(re.getExercise().getName());
                    exDto.setPrimaryMuscle(re.getExercise().getPrimaryMuscle() != null ? re.getExercise().getPrimaryMuscle().name() : "FULL_BODY");
                    exDto.setEquipment(re.getExercise().getEquipment() != null ? re.getExercise().getEquipment().name() : "BODYWEIGHT");
                    exDto.setDemoImageUrl(re.getExercise().getMediaUrl() != null ? re.getExercise().getMediaUrl() : re.getExercise().getThumbnailUrl());
                }
                exDto.setExerciseOrder(re.getExerciseOrder());
                exDto.setTargetSets(re.getTargetSets() != null ? re.getTargetSets() : 3);
                exDto.setTargetRepRange(re.getTargetRepRange() != null ? re.getTargetRepRange() : "8-12");
                exDto.setRestSeconds(re.getRestSeconds() != null ? re.getRestSeconds() : 90);
                exDto.setNotes(re.getNotes());
                exDtos.add(exDto);
            }
        }
        dayDto.setExercises(exDtos);
        return dayDto;
    }
}
