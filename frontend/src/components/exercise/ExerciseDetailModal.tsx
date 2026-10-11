import React, { useState, useRef, useEffect } from 'react';
import type { Exercise } from '../../types';
import { MuscleActivationMap } from '../muscle/MuscleActivationMap';
import { AddToWorkoutModal } from './AddToWorkoutModal';
import {
  X,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Dumbbell,
  Sparkles,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

interface ExerciseDetailModalProps {
  exercise: Exercise | null;
  isOpen: boolean;
  onClose: () => void;
}

export const ExerciseDetailModal: React.FC<ExerciseDetailModalProps> = ({
  exercise,
  isOpen,
  onClose,
}) => {
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const [showAddToWorkout, setShowAddToWorkout] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<number | null>(null);

  // If exercise has dual frame images, auto-loop between frame 0 and frame 1 like a smooth motion preview
  const mediaUrl1 = exercise?.mediaUrl || exercise?.demoImageUrl;
  const mediaUrl2 =
    mediaUrl1 && mediaUrl1.includes('/0.jpg')
      ? mediaUrl1.replace('/0.jpg', '/1.jpg')
      : null;

  useEffect(() => {
    if (!isOpen) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    if (mediaUrl2 && isPlaying) {
      timerRef.current = window.setInterval(() => {
        setActiveFrame((prev) => (prev === 0 ? 1 : 0));
      }, 950);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isOpen, mediaUrl2, isPlaying]);

  if (!isOpen || !exercise) return null;

  const steps = exercise.steps && exercise.steps.length > 0
    ? exercise.steps
    : [
        'Set up with proper posture and secure foot placement.',
        'Engage core and initiate controlled movement with full range of motion.',
        'Squeeze target muscles at peak contraction and resist during 2-3s eccentric return.',
      ];

  const mistakes = exercise.mistakes && exercise.mistakes.length > 0
    ? exercise.mistakes
    : [
        'Using rapid momentum rather than controlled tempo.',
        'Losing spinal bracing during heavy loading.',
      ];

  const currentDisplayImage =
    activeFrame === 1 && mediaUrl2 ? mediaUrl2 : mediaUrl1;

  const isVideo = mediaUrl1 && (mediaUrl1.endsWith('.mp4') || mediaUrl1.endsWith('.webm'));

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in duration-200">
        <div
          ref={containerRef}
          className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl max-w-lg w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden"
        >
          {/* Mobile Top Bar */}
          <div className="sticky top-0 z-20 bg-slate-900/95 backdrop-blur-md px-4 py-3 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 shrink-0">
                Level 3 Guide
              </span>
              <h2 className="text-sm font-black text-white truncate">
                {exercise.name}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-xl min-w-[38px] min-h-[38px] flex items-center justify-center shrink-0"
              aria-label="Close details"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Scrollable Content Body */}
          <div className="flex-1 overflow-y-auto p-4 space-y-5 pb-24">
            {/* Movement Media / Video Demo */}
            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800/90 aspect-video flex items-center justify-center group shadow-inner">
              {isVideo ? (
                <video
                  src={mediaUrl1}
                  autoPlay={isPlaying}
                  loop
                  muted
                  playsInline
                  className="w-full h-full object-cover"
                />
              ) : currentDisplayImage ? (
                <img
                  src={currentDisplayImage}
                  alt={`${exercise.name} movement form`}
                  loading="lazy"
                  className="w-full h-full object-contain bg-slate-950 transition-opacity duration-300"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-slate-500">
                  <Dumbbell className="w-12 h-12 mb-2 stroke-[1.5]" />
                  <span className="text-xs">No media demonstration available</span>
                </div>
              )}

              {/* Play / Pause Fallback Control */}
              {mediaUrl2 && (
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="absolute bottom-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl backdrop-blur-md border border-slate-700/80 shadow-lg min-w-[36px] min-h-[36px] flex items-center justify-center transition-transform active:scale-95"
                  aria-label={isPlaying ? 'Pause looping motion' : 'Play motion'}
                >
                  {isPlaying ? (
                    <Pause className="w-3.5 h-3.5 fill-white" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-white" />
                  )}
                </button>
              )}

              {/* Motion Frame Indicator */}
              {mediaUrl2 && (
                <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-[10px] text-slate-300 font-bold border border-slate-700/60">
                  <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
                  <span>
                    Frame {activeFrame + 1}/2 {isPlaying ? '(Looping)' : '(Paused)'}
                  </span>
                </div>
              )}
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Target Sets
                </div>
                <div className="text-sm font-black text-orange-400 mt-0.5">
                  {exercise.defaultSets || 3} Sets
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Rep Range
                </div>
                <div className="text-sm font-black text-white mt-0.5">
                  {exercise.defaultReps || '8-12'}
                </div>
              </div>
              <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                  Equipment
                </div>
                <div className="text-xs font-black text-slate-300 truncate mt-0.5">
                  {exercise.equipment}
                </div>
              </div>
            </div>

            {/* Muscle Activation Diagram (Reusable SVG Human Body) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-orange-400" />
                  <span>Muscle Activation Diagram</span>
                </h3>
                <span className="text-[10px] text-slate-400">
                  {exercise.primaryMuscle} primary
                </span>
              </div>

              <div className="p-3 bg-slate-950/80 rounded-2xl border border-slate-800/80 flex flex-col items-center">
                <MuscleActivationMap
                  primaryMuscles={[exercise.primaryMuscle]}
                  secondaryMuscles={
                    exercise.secondaryMusclesList ||
                    (exercise.secondaryMuscles ? exercise.secondaryMuscles.split(',') : [])
                  }
                  showLegend={true}
                  className="w-full"
                />
              </div>
            </div>

            {/* Numbered Execution Steps */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Execution Steps ({steps.length})</span>
              </h3>
              <div className="space-y-2">
                {steps.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-slate-950/60 border border-slate-800/80 flex items-start gap-3"
                  >
                    <span className="w-5 h-5 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-[11px] font-black flex items-center justify-center shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <p className="text-xs text-slate-200 leading-relaxed font-medium">
                      {step}
                    </p>
                  </div>
                ))}
              </div>
            </div>

            {/* Common Mistakes */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
                <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                <span>Common Mistakes to Avoid</span>
              </h3>
              <div className="space-y-2">
                {mistakes.map((mistake, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-rose-950/20 border border-rose-900/40 flex items-start gap-2.5 text-xs text-rose-200"
                  >
                    <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <p className="leading-relaxed">{mistake}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* License & Attribution Banner */}
            <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/60 text-[10px] text-slate-400 flex items-start gap-2">
              <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-slate-300">Data & Media Attribution: </span>
                {exercise.attribution ||
                  'Open Source exercise dataset via Free Exercise DB (Public Domain / The Unlicense). Standard biomechanical alignment.'}
              </div>
            </div>
          </div>

          {/* Fixed Floating Bottom Bar on Mobile */}
          <div className="sticky bottom-0 z-20 bg-slate-900/95 backdrop-blur-md p-3.5 border-t border-slate-800 pb-[max(14px,env(safe-area-inset-bottom))]">
            <button
              type="button"
              onClick={() => setShowAddToWorkout(true)}
              className="w-full py-3 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all min-h-[48px] active:scale-[0.99]"
            >
              <Dumbbell className="w-4 h-4 stroke-[2.5]" />
              <span>Add to Workout</span>
              <ChevronRight className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Add to Workout Routine / Active Session Modal */}
      <AddToWorkoutModal
        exercise={exercise}
        isOpen={showAddToWorkout}
        onClose={() => setShowAddToWorkout(false)}
      />
    </>
  );
};
