const BASE_URL = '/api';

export const getAuthToken = (): string | null => {
  return localStorage.getItem('fittrack_jwt_token');
};

export const setAuthToken = (token: string): void => {
  localStorage.setItem('fittrack_jwt_token', token);
};

export const removeAuthToken = (): void => {
  localStorage.removeItem('fittrack_jwt_token');
};

export const apiFetch = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const token = getAuthToken();
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      // Token expired or invalid
      // removeAuthToken();
    }
    const errorData = await response.json().catch(() => ({ message: 'Server error' }));
    throw new Error(errorData.message || `Request failed with status ${response.status}`);
  }

  // If response is empty (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
};
