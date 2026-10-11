package com.fittrack.service;

import com.fittrack.dto.RoutineDTOs;
import com.fittrack.model.*;
import com.fittrack.repository.ExerciseRepository;
import com.fittrack.repository.RoutineRepository;
import com.fittrack.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class RoutineService {

    private final RoutineRepository routineRepository;
    private final UserRepository userRepository;
    private final ExerciseRepository exerciseRepository;

    public RoutineService(RoutineRepository routineRepository, UserRepository userRepository, ExerciseRepository exerciseRepository) {
        this.routineRepository = routineRepository;
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

        if (request.getDays() != null) {
            for (RoutineDTOs.CreateRoutineDayRequest dayReq : request.getDays()) {
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

        routine = routineRepository.save(routine);
        return mapToDto(routine);
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
                RoutineDTOs.RoutineDayDto dayDto = new RoutineDTOs.RoutineDayDto();
                dayDto.setId(day.getId());
                dayDto.setDayName(day.getDayName());
                dayDto.setDayOrder(day.getDayOrder());

                List<RoutineDTOs.RoutineExerciseDto> exDtos = new ArrayList<>();
                if (day.getExercises() != null) {
                    for (RoutineExercise re : day.getExercises()) {
                        RoutineDTOs.RoutineExerciseDto exDto = new RoutineDTOs.RoutineExerciseDto();
                        exDto.setId(re.getId());
                        exDto.setExerciseId(re.getExercise().getId());
                        exDto.setExerciseName(re.getExercise().getName());
                        exDto.setPrimaryMuscle(re.getExercise().getPrimaryMuscle().name());
                        exDto.setEquipment(re.getExercise().getEquipment().name());
                        exDto.setDemoImageUrl(re.getExercise().getDemoImageUrl());
                        exDto.setExerciseOrder(re.getExerciseOrder());
                        exDto.setTargetSets(re.getTargetSets());
                        exDto.setTargetRepRange(re.getTargetRepRange());
                        exDto.setRestSeconds(re.getRestSeconds());
                        exDto.setNotes(re.getNotes());
                        exDtos.add(exDto);
                    }
                }
                dayDto.setExercises(exDtos);
                dayDtos.add(dayDto);
            }
        }
        dto.setDays(dayDtos);
        return dto;
    }
}
