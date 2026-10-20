import type { Exercise } from '../types';

export type MediaProviderType = 'builtin' | 'licensed' | 'none';

export interface ResolvedMedia {
  provider: MediaProviderType;
  mediaUrl?: string;
  posterUrl?: string;
  mediaType: 'video' | 'image' | 'animation' | 'none';
  attribution?: string;
  license?: string;
  fallbackToBuiltin: boolean;
}

// Media base URLs - never hotlinks external untrusted sites
export const LICENSED_MEDIA_BASE_URL = 
  (import.meta.env.VITE_LICENSED_MEDIA_BASE_URL as string) || '/media/exercises';

export const LICENSED_POSTER_BASE_URL = 
  (import.meta.env.VITE_LICENSED_POSTER_BASE_URL as string) || '/media/posters';

// Key for local storage override (allows developer/user to toggle in settings or test mode)
const STORAGE_KEY_PROVIDER_OVERRIDE = 'fittrack_media_provider_override';

export function getGlobalMediaProvider(): MediaProviderType {
  const stored = typeof window !== 'undefined' ? localStorage.getItem(STORAGE_KEY_PROVIDER_OVERRIDE) : null;
  if (stored === 'builtin' || stored === 'licensed' || stored === 'none') {
    return stored;
  }
  const envDefault = import.meta.env.VITE_DEFAULT_MEDIA_PROVIDER as MediaProviderType;
  if (envDefault === 'licensed' || envDefault === 'none' || envDefault === 'builtin') {
    return envDefault;
  }
  // Default to licensed (RapidAPI real demonstration videos)
  return 'licensed';
}

export function setGlobalMediaProvider(provider: MediaProviderType | null) {
  if (typeof window === 'undefined') return;
  if (!provider) {
    localStorage.removeItem(STORAGE_KEY_PROVIDER_OVERRIDE);
  } else {
    localStorage.setItem(STORAGE_KEY_PROVIDER_OVERRIDE, provider);
  }
}

// Configurable license status flag (e.g. 'licensed', 'preview', 'free')
export const LICENSE_TIER = 
  (import.meta.env.VITE_LICENSE_STATUS as string) || 'preview';

export function getSourceBadgeLabel(): string {
  if (LICENSE_TIER === 'licensed') {
    return 'Licensed Media';
  }
  return 'ExerciseDB Preview';
}

/**
 * Resolves media sources for an exercise safely without guessing or hotlinking external domains.
 * Rule 5: Only show media for exercises with reviewStatus "verified". Show the built-in fallback for the rest.
 */
export function resolveExerciseMedia(exercise: Exercise): ResolvedMedia {
  const globalPref = getGlobalMediaProvider();

  // If global is explicitly forced to 'none', return none
  if (globalPref === 'none') {
    return {
      provider: 'none',
      mediaType: 'none',
      fallbackToBuiltin: false
    };
  }

  // Strict Rule 1 & Rule 5: Only verified dataset records or local installed media may display video
  const isVerified = exercise.reviewStatus === 'verified' || (!!exercise.mediaUrl && exercise.mediaUrl.startsWith('/media/'));
  if (!isVerified || !exercise.mediaUrl || exercise.mediaProvider === 'builtin') {
    return {
      provider: 'builtin',
      mediaType: 'animation',
      fallbackToBuiltin: false
    };
  }

  // Resolve relative or local URL
  let fullMediaUrl = exercise.mediaUrl;
  if (!fullMediaUrl.startsWith('http://') && !fullMediaUrl.startsWith('https://') && !fullMediaUrl.startsWith('/')) {
    fullMediaUrl = `${LICENSED_MEDIA_BASE_URL.replace(/\/$/, '')}/${fullMediaUrl}`;
  }

  let fullPosterUrl = exercise.posterUrl;
  if (fullPosterUrl && !fullPosterUrl.startsWith('http://') && !fullPosterUrl.startsWith('https://') && !fullPosterUrl.startsWith('/')) {
    fullPosterUrl = `${LICENSED_POSTER_BASE_URL.replace(/\/$/, '')}/${fullPosterUrl}`;
  }

  const mediaType = exercise.mediaType || 
    (fullMediaUrl.endsWith('.mp4') || fullMediaUrl.endsWith('.webm') ? 'video' : 'image');

  return {
    provider: 'licensed',
    mediaUrl: fullMediaUrl,
    posterUrl: fullPosterUrl,
    mediaType,
    attribution: exercise.attribution || 'ExerciseDB via AscendAPI',
    fallbackToBuiltin: true
  };
}
