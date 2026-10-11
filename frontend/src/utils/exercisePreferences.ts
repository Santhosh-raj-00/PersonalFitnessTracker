const RECENT_KEY = 'fittrack_recent_exercises';
const FAVORITES_KEY = 'fittrack_favorite_exercises';

export const getRecentExerciseIds = (): number[] => {
  try {
    const raw = localStorage.getItem(RECENT_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const addRecentExerciseId = (id: number): void => {
  try {
    const current = getRecentExerciseIds().filter((existing) => existing !== id);
    const updated = [id, ...current].slice(0, 25);
    localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  } catch {
    // ignore
  }
};

export const getFavoriteExerciseIds = (): number[] => {
  try {
    const raw = localStorage.getItem(FAVORITES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
};

export const isFavoriteExerciseId = (id: number): boolean => {
  return getFavoriteExerciseIds().includes(id);
};

export const toggleFavoriteExerciseId = (id: number): boolean => {
  try {
    const current = getFavoriteExerciseIds();
    let updated: number[];
    let isNowFavorite = false;
    if (current.includes(id)) {
      updated = current.filter((x) => x !== id);
      isNowFavorite = false;
    } else {
      updated = [id, ...current];
      isNowFavorite = true;
    }
    localStorage.setItem(FAVORITES_KEY, JSON.stringify(updated));
    return isNowFavorite;
  } catch {
    return false;
  }
};
