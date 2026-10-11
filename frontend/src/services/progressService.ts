import { apiFetch } from './api';
import type { DashboardSummary, ExerciseProgress, BodyMetric, ProgressPhoto, PersonalRecord } from '../types';

export const progressService = {
  getDashboardSummary: async (): Promise<DashboardSummary> => {
    return apiFetch<DashboardSummary>('/progress/dashboard');
  },

  getExerciseProgress: async (exerciseId: number): Promise<ExerciseProgress> => {
    return apiFetch<ExerciseProgress>(`/progress/exercise/${exerciseId}`);
  },

  logBodyMetric: async (metric: Partial<BodyMetric>): Promise<BodyMetric> => {
    return apiFetch<BodyMetric>('/progress/body-metrics', {
      method: 'POST',
      body: JSON.stringify(metric),
    });
  },

  getBodyMetricsHistory: async (): Promise<BodyMetric[]> => {
    return apiFetch<BodyMetric[]>('/progress/body-metrics');
  },

  logProgressPhoto: async (photo: Partial<ProgressPhoto>): Promise<ProgressPhoto> => {
    return apiFetch<ProgressPhoto>('/progress/photos', {
      method: 'POST',
      body: JSON.stringify(photo),
    });
  },

  getProgressPhotos: async (): Promise<ProgressPhoto[]> => {
    return apiFetch<ProgressPhoto[]>('/progress/photos');
  },

  getPersonalRecords: async (): Promise<PersonalRecord[]> => {
    return apiFetch<PersonalRecord[]>('/progress/prs');
  },
};
