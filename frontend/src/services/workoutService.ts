import { apiFetch } from './api';
import type { WorkoutSession, WorkoutSet, LastExerciseStats } from '../types';
import { saveSetOffline } from './offlineSync';

export const workoutService = {
  startWorkout: async (routineDayId?: number, sessionName?: string): Promise<WorkoutSession> => {
    return apiFetch<WorkoutSession>('/workouts/start', {
      method: 'POST',
      body: JSON.stringify({ routineDayId, sessionName }),
    });
  },

  getActiveSession: async (): Promise<WorkoutSession | null> => {
    return apiFetch<WorkoutSession | null>('/workouts/active');
  },

  logSet: async (sessionId: number, set: Partial<WorkoutSet>): Promise<WorkoutSet> => {
    if (!navigator.onLine) {
      // Offline fallback: save set locally
      saveSetOffline(sessionId, set);
      return {
        ...set,
        id: Date.now(),
        loggedAt: new Date().toISOString(),
        isPr: false,
      } as WorkoutSet;
    }

    return apiFetch<WorkoutSet>(`/workouts/${sessionId}/sets`, {
      method: 'POST',
      body: JSON.stringify(set),
    });
  },

  finishWorkout: async (sessionId: number, notes?: string): Promise<WorkoutSession> => {
    const query = notes ? `?notes=${encodeURIComponent(notes)}` : '';
    return apiFetch<WorkoutSession>(`/workouts/${sessionId}/finish${query}`, {
      method: 'POST',
    });
  },

  getWorkoutHistory: async (): Promise<WorkoutSession[]> => {
    return apiFetch<WorkoutSession[]>('/workouts/history');
  },

  getLastExerciseStats: async (exerciseId: number): Promise<LastExerciseStats> => {
    return apiFetch<LastExerciseStats>(`/workouts/last-stats/${exerciseId}`);
  },
};
