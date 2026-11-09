import { apiFetch } from './api';
import type { Routine, RoutineDay } from '../types';

export const routineService = {
  getRoutines: async (): Promise<Routine[]> => {
    return apiFetch<Routine[]>('/routines');
  },

  getRoutineById: async (id: number): Promise<Routine> => {
    return apiFetch<Routine>(`/routines/${id}`);
  },

  getRoutineDay: async (dayId: number): Promise<RoutineDay> => {
    return apiFetch<RoutineDay>(`/routines/days/${dayId}`);
  },

  createRoutine: async (routine: any): Promise<Routine> => {
    return apiFetch<Routine>('/routines', {
      method: 'POST',
      body: JSON.stringify(routine),
    });
  },

  updateRoutine: async (id: number, routine: any): Promise<Routine> => {
    return apiFetch<Routine>(`/routines/${id}`, {
      method: 'PUT',
      body: JSON.stringify(routine),
    });
  },

  deleteRoutine: async (id: number): Promise<void> => {
    return apiFetch<void>(`/routines/${id}`, {
      method: 'DELETE',
    });
  },
};
