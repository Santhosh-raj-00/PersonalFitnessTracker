package com.fittrack.service;

import com.fittrack.model.*;
import com.fittrack.model.enums.*;
import com.fittrack.repository.PersonalRecordRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
public class WorkoutServiceTest {

    @Mock
    private PersonalRecordRepository personalRecordRepository;

    @InjectMocks
    private WorkoutService workoutService;

    private User testUser;
    private Exercise benchPress;

    @BeforeEach
    void setUp() {
        testUser = new User("user@fittrack.com", "pass", "Test User", Role.ROLE_USER);
        testUser.setId(1L);

        benchPress = new Exercise("Barbell Bench Press", MuscleGroup.CHEST, "TRICEPS", Equipment.BARBELL, Difficulty.INTERMEDIATE, "Tips", "url");
        benchPress.setId(10L);
    }

    @Test
    @DisplayName("Estimated 1RM calculation formula test")
    void test1RMCalculation() {
        WorkoutSession session = new WorkoutSession(testUser, "Push Day", "PPL", 1L);
        WorkoutSet set = new WorkoutSet(session, benchPress, 1, 100.0, 5, 8.5, false);

        // 1RM = 100 * (1 + 5/30) = 100 * 1.1667 = 116.7
        assertEquals(116.7, set.getEstimated1rm(), 0.1);
    }

    @Test
    @DisplayName("Automatic PR Detection - New Max Weight PR")
    void testPRDetectionNewMaxWeight() {
        WorkoutSession session = new WorkoutSession(testUser, "Push Day", "PPL", 1L);
        WorkoutSet set = new WorkoutSet(session, benchPress, 1, 100.0, 5, 8.5, false);

        when(personalRecordRepository.findFirstByUserIdAndExerciseIdAndRecordTypeOrderByRecordValueDesc(
                1L, 10L, RecordType.MAX_WEIGHT)).thenReturn(Optional.empty());

        when(personalRecordRepository.findFirstByUserIdAndExerciseIdAndRecordTypeOrderByRecordValueDesc(
                1L, 10L, RecordType.MAX_1RM)).thenReturn(Optional.empty());

        boolean isPR = workoutService.checkForPersonalRecords(testUser, benchPress, set);

        assertTrue(isPR);
        verify(personalRecordRepository, times(2)).save(any(PersonalRecord.class));
    }

    @Test
    @DisplayName("Automatic PR Detection - Warmup set should not trigger PR")
    void testPRDetectionWarmupSetIgnored() {
        WorkoutSession session = new WorkoutSession(testUser, "Push Day", "PPL", 1L);
        WorkoutSet warmupSet = new WorkoutSet(session, benchPress, 1, 120.0, 5, 5.0, true);

        boolean isPR = workoutService.checkForPersonalRecords(testUser, benchPress, warmupSet);

        assertFalse(isPR);
        verify(personalRecordRepository, never()).save(any(PersonalRecord.class));
    }
}
