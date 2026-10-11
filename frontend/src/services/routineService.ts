import { apiFetch } from './api';
import type { Routine } from '../types';

export const routineService = {
  getRoutines: async (): Promise<Routine[]> => {
    return apiFetch<Routine[]>('/routines');
  },

  getRoutineById: async (id: number): Promise<Routine> => {
    return apiFetch<Routine>(`/routines/${id}`);
  },

  createRoutine: async (routine: any): Promise<Routine> => {
    return apiFetch<Routine>('/routines', {
      method: 'POST',
      body: JSON.stringify(routine),
    });
  },
};
