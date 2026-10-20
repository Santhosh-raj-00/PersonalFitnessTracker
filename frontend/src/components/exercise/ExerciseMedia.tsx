import React, { useState, useRef, useEffect, useCallback, useMemo } from 'react';
import { Play, Pause, AlertCircle, Loader2 } from 'lucide-react';
import type { Exercise } from '../../types';
import { resolveExerciseMedia, type ResolvedMedia, getSourceBadgeLabel } from '../../services/mediaConfig';
import { ExerciseAnimation } from './ExerciseAnimation';

export interface ExerciseMediaProps {
  exercise: Exercise;
  className?: string;
  showControls?: boolean;
  priority?: boolean;
  preferredFormat?: 'video' | 'image';
}

export const ExerciseMedia: React.FC<ExerciseMediaProps> = ({
  exercise,
  className = '',
  showControls = true,
  priority = false,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  const [resolved, setResolved] = useState<ResolvedMedia>(() => resolveExerciseMedia(exercise));
  const [loadError, setLoadError] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [isVisible, setIsVisible] = useState<boolean>(true);

  // Update media resolution whenever exercise changes and reset playback state
  useEffect(() => {
    const res = resolveExerciseMedia(exercise);
    setResolved(res);
    setLoadError(false);
    setIsLoading(exercise.reviewStatus === 'verified' && res.provider === 'licensed' && !!res.mediaUrl);
    setIsPlaying(true);
    setSpeed(1.0);

    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.playbackRate = 1.0;
      videoRef.current.load();
    }
  }, [exercise.id, exercise.externalId, exercise.reviewStatus, exercise.mediaUrl]);

  // Pause video/animation when element is scrolled out of viewport
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
          if (videoRef.current) {
            if (entry.isIntersecting) {
              if (isPlaying) {
                videoRef.current.play().catch(() => {});
              }
            } else {
              videoRef.current.pause();
            }
          }
        });
      },
      { threshold: 0.15 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, [isPlaying]);

  // Handle video playback speed updates
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  }, [speed]);

  const togglePlay = useCallback(() => {
    if (videoRef.current) {
      if (videoRef.current.paused) {
        videoRef.current.play().catch(() => {});
        setIsPlaying(true);
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    } else {
      setIsPlaying((prev) => !prev);
    }
  }, []);

  const toggleSpeed = useCallback(() => {
    setSpeed((prev) => (prev === 1.0 ? 0.5 : 1.0));
  }, []);

  // Determine if the media is a true animated medium vs still photo
  const isMediaAnimated = useMemo(() => {
    if (resolved.provider === 'builtin') return true;
    if (resolved.provider === 'licensed' && resolved.mediaUrl) {
      const url = resolved.mediaUrl.toLowerCase();
      if (url.endsWith('.mp4') || url.endsWith('.webm') || url.endsWith('.gif') || url.includes('animated')) {
        return true;
      }
      // If it's a static image like .jpg or .png, it's NOT looping
      if (url.endsWith('.jpg') || url.endsWith('.jpeg') || url.endsWith('.png')) {
        return false;
      }
      return resolved.mediaType === 'video';
    }
    return false;
  }, [resolved]);

  const isActuallyLooping = isMediaAnimated && isPlaying && isVisible && !isLoading && !loadError;

  // 1. FALLBACK TO BUILT-IN ANIMATION IF NOT VERIFIED OR FILE FAILS
  const shouldRenderBuiltin = 
    exercise.reviewStatus !== 'verified' ||
    resolved.provider === 'builtin' || 
    (resolved.provider === 'licensed' && (loadError || !resolved.mediaUrl));

  // 2. EXPLICIT "NONE" OR EMPTY PLACEHOLDER
  if (resolved.provider === 'none') {
    return (
      <div
        ref={containerRef}
        className={`relative w-full aspect-4/3 rounded-2xl bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col items-center justify-center p-6 text-center select-none ${className}`}
        style={{ aspectRatio: '4/3' }}
      >
        <div className="w-14 h-14 rounded-2xl bg-slate-800/80 border border-slate-700/80 flex items-center justify-center text-slate-400 mb-3 shadow-lg">
          <AlertCircle className="w-7 h-7 stroke-[1.5]" />
        </div>
        <h4 className="text-sm font-bold text-white mb-1">{exercise.name}</h4>
        <p className="text-xs text-slate-400 max-w-xs">
          Demo animation preview currently unavailable.
        </p>
        <div className="flex items-center gap-2 mt-3">
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
            {exercise.primaryMuscle}
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
            {exercise.equipment}
          </span>
        </div>
      </div>
    );
  }

  // 3. RENDER BUILT-IN REALISTIC ANATOMICAL FIGURE (Default & Fallback)
  if (shouldRenderBuiltin) {
    return (
      <div className="relative w-full">
        <ExerciseAnimation
          pattern={exercise.animationPattern}
          params={exercise.animationParams}
          equipment={exercise.equipment}
          primaryMuscles={exercise.primaryMuscles || [exercise.primaryMuscle]}
          secondaryMuscles={exercise.secondaryMusclesList}
          primaryMuscle={exercise.primaryMuscle}
          className={className}
          showControls={showControls}
        />
        {loadError && (
          <div className="absolute top-3 left-3 z-10 px-2 py-0.5 rounded-md bg-amber-950/80 border border-amber-500/40 text-[9px] font-bold text-amber-300 backdrop-blur-md">
            Fallback: Built-in Anatomical Demo
          </div>
        )}
      </div>
    );
  }

  // 4. RENDER LICENSED VIDEO (MP4/WebM) OR ANIMATED IMAGE (GIF/WebP)
  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-4/3 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 shadow-2xl overflow-hidden select-none flex items-center justify-center group ${className}`}
      style={{ aspectRatio: '4/3' }}
    >
      {/* Loading Skeleton */}
      {isLoading && (
        <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-20 flex flex-col items-center justify-center gap-2">
          <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
          <span className="text-xs font-semibold text-slate-300 tracking-wide">
            Buffering demo...
          </span>
        </div>
      )}

      {/* VIDEO PLAYER (MP4 / WebM preferred on mobile) */}
      {resolved.mediaType === 'video' ? (
        <video
          ref={videoRef}
          src={resolved.mediaUrl}
          poster={resolved.posterUrl}
          muted
          loop
          autoPlay
          playsInline
          preload="metadata"
          className="w-full h-full object-cover object-center"
          onLoadedData={() => setIsLoading(false)}
          onCanPlay={() => setIsLoading(false)}
          onError={() => {
            console.warn(`[FitTrack Media] Video load failed: ${resolved.mediaUrl}. Gracefully falling back to built-in animation.`);
            setLoadError(true);
            setIsLoading(false);
          }}
        />
      ) : (
        /* ANIMATED IMAGE (GIF / WebP) */
        <img
          src={resolved.mediaUrl}
          alt={`${exercise.name} demonstration`}
          loading={priority ? 'eager' : 'lazy'}
          className="w-full h-full object-cover object-center"
          onLoad={() => setIsLoading(false)}
          onError={() => {
            console.warn(`[FitTrack Media] Image load failed: ${resolved.mediaUrl}. Gracefully falling back to built-in animation.`);
            setLoadError(true);
            setIsLoading(false);
          }}
        />
      )}

      {/* TOP OVERLAY: SOURCE BADGE & LOOPING STATUS */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-950/80 border border-slate-800 text-[10px] font-bold text-slate-300 backdrop-blur-md">
            {getSourceBadgeLabel()}
          </span>
          <span className="text-[10px] text-slate-400 capitalize font-medium hidden sm:inline">
            {exercise.primaryMuscle}
          </span>
        </div>

        {/* Looping indicator ONLY active while actually animating */}
        {isActuallyLooping ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-[10px] font-bold text-red-400 backdrop-blur-md shadow-lg shadow-red-950/50">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Looping</span>
          </div>
        ) : !isMediaAnimated ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] font-bold text-slate-400 backdrop-blur-md">
            <span>Photo Frame</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] font-bold text-slate-400 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Paused</span>
          </div>
        )}
      </div>

      {/* BOTTOM OVERLAY: INTERACTIVE CONTROLS */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto z-10">
          {/* Attribution or Muscle Text */}
          <div className="hidden sm:flex items-center max-w-[220px] truncate text-[10px] text-slate-300 font-semibold px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-800/80 backdrop-blur-md gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="truncate">
              {resolved.attribution || exercise.name}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto bg-slate-950/90 border border-slate-800 rounded-xl p-1 backdrop-blur-md shadow-xl">
            {/* Play/Pause Button */}
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label={isPlaying ? 'Pause demo' : 'Play demo'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            {/* Speed Toggle: 1x / 0.5x (Supported on Video) */}
            {resolved.mediaType === 'video' && (
              <button
                type="button"
                onClick={toggleSpeed}
                className={`px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${
                  speed === 0.5
                    ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
                aria-label={`Toggle playback speed, current speed ${speed}x`}
                title="Toggle Speed"
              >
                {speed}x
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseMedia;
