import { apiFetch } from './api';
import type { Exercise, MuscleGroupSummary, CreateCustomExerciseRequest, PageResponse } from '../types';

export const exerciseService = {
  searchExercises: async (
    query?: string,
    muscle?: string,
    equipment?: string,
    difficulty?: string,
    movementTypeOrSecondary?: string | boolean,
    chestRegion?: string,
    includeSecondaryParam?: boolean
  ): Promise<Exercise[]> => {
    let movementType: string | undefined;
    let includeSecondary: boolean | undefined;

    if (typeof movementTypeOrSecondary === 'boolean') {
      includeSecondary = movementTypeOrSecondary;
    } else {
      movementType = movementTypeOrSecondary;
      includeSecondary = includeSecondaryParam;
    }

    const params = new URLSearchParams();
    if (query && query.trim()) params.append('q', query.trim());
    if (muscle && muscle !== 'ALL') params.append('muscle', muscle);
    if (equipment && equipment !== 'ALL') params.append('equipment', equipment);
    if (difficulty && difficulty !== 'ALL') params.append('difficulty', difficulty);
    if (movementType && movementType !== 'ALL') params.append('movementType', movementType);
    if (chestRegion && chestRegion !== 'ALL') params.append('chestRegion', chestRegion);
    if (includeSecondary) params.append('includeSecondary', 'true');

    const queryString = params.toString() ? `?${params.toString()}` : '';
    return apiFetch<Exercise[]>(`/exercises${queryString}`);
  },

  searchExercisesPaginated: async (options: {
    q?: string;
    muscle?: string;
    equipment?: string;
    difficulty?: string;
    movementType?: string;
    chestRegion?: string;
    page?: number;
    size?: number;
  }): Promise<PageResponse<Exercise>> => {
    const params = new URLSearchParams();
    if (options.q && options.q.trim()) params.append('q', options.q.trim());
    if (options.muscle && options.muscle !== 'ALL') params.append('muscle', options.muscle);
    if (options.equipment && options.equipment !== 'ALL') params.append('equipment', options.equipment);
    if (options.difficulty && options.difficulty !== 'ALL') params.append('difficulty', options.difficulty);
    if (options.movementType && options.movementType !== 'ALL') params.append('movementType', options.movementType);
    if (options.chestRegion && options.chestRegion !== 'ALL') params.append('chestRegion', options.chestRegion);
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
