import { apiFetch, setAuthToken, removeAuthToken } from './api';
import type { User, UserProfile } from '../types';

export const authService = {
  login: async (email: string, password: string): Promise<User> => {
    const data = await apiFetch<User>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  register: async (payload: any): Promise<User> => {
    const data = await apiFetch<User>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    if (data.token) {
      setAuthToken(data.token);
    }
    return data;
  },

  getProfile: async (): Promise<UserProfile> => {
    return apiFetch<UserProfile>('/auth/profile');
  },

  updateProfile: async (profile: Partial<UserProfile>): Promise<UserProfile> => {
    return apiFetch<UserProfile>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profile),
    });
  },

  logout: (): void => {
    removeAuthToken();
  },
};
