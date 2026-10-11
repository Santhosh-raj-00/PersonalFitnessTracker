import { apiFetch } from './api';
import type { Exercise, MuscleGroupSummary, CreateCustomExerciseRequest, PageResponse } from '../types';

export const exerciseService = {
  searchExercises: async (
    query?: string,
    muscle?: string,
    equipment?: string,
    difficulty?: string
  ): Promise<Exercise[]> => {
    const params = new URLSearchParams();
    if (query && query.trim()) params.append('q', query.trim());
    if (muscle && muscle !== 'ALL') params.append('muscle', muscle);
    if (equipment && equipment !== 'ALL') params.append('equipment', equipment);
    if (difficulty && difficulty !== 'ALL') params.append('difficulty', difficulty);

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<Exercise[]>(`/exercises${queryString}`);
  },

  searchExercisesPaginated: async (options: {
    q?: string;
    muscle?: string;
    equipment?: string;
    difficulty?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Exercise>> => {
    const params = new URLSearchParams();
    if (options.q && options.q.trim()) params.append('q', options.q.trim());
    if (options.muscle && options.muscle !== 'ALL') params.append('muscle', options.muscle);
    if (options.equipment && options.equipment !== 'ALL') params.append('equipment', options.equipment);
    if (options.difficulty && options.difficulty !== 'ALL') params.append('difficulty', options.difficulty);
    params.append('page', String(options.page ?? 0));
    params.append('size', String(options.size ?? 20));

    return apiFetch<PageResponse<Exercise>>(`/exercises?${params.toString()}`);
  },


  getExerciseById: async (id: number): Promise<Exercise> => {
    return apiFetch<Exercise>(`/exercises/${id}`);
  },

  getMuscleGroups: async (): Promise<MuscleGroupSummary[]> => {
    return apiFetch<MuscleGroupSummary[]>('/exercises/muscles');
  },

  createCustomExercise: async (data: CreateCustomExerciseRequest): Promise<Exercise> => {
    return apiFetch<Exercise>('/exercises/custom', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
