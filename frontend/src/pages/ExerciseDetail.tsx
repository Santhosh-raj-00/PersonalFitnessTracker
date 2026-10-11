import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import type { Exercise } from '../types';
import { exerciseService } from '../services/exerciseService';
import { MuscleActivationMap } from '../components/muscle/MuscleActivationMap';
import { AddToWorkoutModal } from '../components/exercise/AddToWorkoutModal';
import {
  ArrowLeft,
  Play,
  Pause,
  AlertTriangle,
  CheckCircle2,
  Dumbbell,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Loader2,
} from 'lucide-react';

export const ExerciseDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [exercise, setExercise] = useState<Exercise | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [activeFrame, setActiveFrame] = useState<number>(0);
  const [showAddToWorkout, setShowAddToWorkout] = useState<boolean>(false);

  useEffect(() => {
    if (id) {
      loadExercise(Number(id));
    }
  }, [id]);

  const loadExercise = async (exerciseId: number) => {
    setIsLoading(true);
    try {
      const data = await exerciseService.getExerciseById(exerciseId);
      setExercise(data);
    } catch (err) {
      console.error('Failed to load exercise:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const mediaUrl1 = exercise?.mediaUrl || exercise?.demoImageUrl;
  const mediaUrl2 =
    mediaUrl1 && mediaUrl1.includes('/0.jpg')
      ? mediaUrl1.replace('/0.jpg', '/1.jpg')
      : null;

  useEffect(() => {
    if (mediaUrl2 && isPlaying) {
      const timer = window.setInterval(() => {
        setActiveFrame((prev) => (prev === 0 ? 1 : 0));
      }, 950);
      return () => clearInterval(timer);
    }
  }, [mediaUrl2, isPlaying]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-slate-400 space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
        <span className="text-xs">Loading movement biomechanics...</span>
      </div>
    );
  }

  if (!exercise) {
    return (
      <div className="p-8 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-4">
        <h3 className="text-base font-bold text-white">Exercise Not Found</h3>
        <p className="text-xs text-slate-400">The requested exercise could not be located.</p>
        <button
          onClick={() => navigate('/exercises')}
          className="px-4 py-2 bg-orange-500 text-slate-950 font-bold rounded-xl text-xs"
        >
          Return to Exercise Library
        </button>
      </div>
    );
  }

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
    <div className="max-w-2xl mx-auto space-y-5 pb-24 animate-in fade-in">
      {/* Top Mobile Bar */}
      <div className="flex items-center justify-between gap-3 pt-1">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800 text-xs font-bold transition-all min-h-[44px]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back</span>
        </button>
        <span className="text-[11px] font-bold text-orange-400 bg-orange-950/80 px-2.5 py-1 rounded-full border border-orange-800/60">
          Level 3 Exercise Guide
        </span>
      </div>

      <div className="space-y-1">
        <h1 className="text-2xl font-black text-white tracking-tight">
          {exercise.name}
        </h1>
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-bold text-orange-400 bg-orange-950/90 px-2.5 py-0.5 rounded-md border border-orange-800/80">
            {exercise.primaryMuscle}
          </span>
          <span className="text-xs font-medium text-slate-300 bg-slate-800/90 px-2.5 py-0.5 rounded-md border border-slate-700/60">
            {exercise.equipment}
          </span>
          <span className="text-xs font-medium text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/60">
            {exercise.difficulty}
          </span>
        </div>
      </div>

      {/* Movement Media / Video Demo */}
      <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-800 aspect-video flex items-center justify-center group shadow-xl">
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
            className="w-full h-full object-contain bg-slate-950"
          />
        ) : (
          <div className="flex flex-col items-center justify-center text-slate-500">
            <Dumbbell className="w-12 h-12 mb-2 stroke-[1.5]" />
            <span className="text-xs">No media demonstration available</span>
          </div>
        )}

        {mediaUrl2 && (
          <button
            type="button"
            onClick={() => setIsPlaying(!isPlaying)}
            className="absolute bottom-3 right-3 p-2 bg-slate-900/80 hover:bg-slate-900 text-white rounded-xl backdrop-blur-md border border-slate-700/80 shadow-lg min-w-[38px] min-h-[38px] flex items-center justify-center"
            aria-label={isPlaying ? 'Pause looping motion' : 'Play motion'}
          >
            {isPlaying ? (
              <Pause className="w-4 h-4 fill-white" />
            ) : (
              <Play className="w-4 h-4 fill-white" />
            )}
          </button>
        )}

        {mediaUrl2 && (
          <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2.5 py-1 bg-slate-900/80 backdrop-blur-md rounded-lg text-[10px] text-slate-300 font-bold border border-slate-700/60">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
            <span>
              Frame {activeFrame + 1}/2 {isPlaying ? '(Looping)' : '(Paused)'}
            </span>
          </div>
        )}
      </div>

      {/* Suggested Sets & Reps Bar */}
      <div className="grid grid-cols-3 gap-2.5 text-center">
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Suggested Sets
          </div>
          <div className="text-base font-black text-orange-400 mt-0.5">
            {exercise.defaultSets || 3} Sets
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Target Reps
          </div>
          <div className="text-base font-black text-white mt-0.5">
            {exercise.defaultReps || '8-12'}
          </div>
        </div>
        <div className="p-3 rounded-2xl bg-slate-900 border border-slate-800">
          <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            Equipment
          </div>
          <div className="text-xs font-black text-slate-300 truncate mt-1">
            {exercise.equipment}
          </div>
        </div>
      </div>

      {/* Muscle Activation Diagram */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
            <Sparkles className="w-4 h-4 text-orange-400" />
            <span>Muscle Activation Diagram</span>
          </h2>
          <span className="text-xs text-orange-400 font-bold">
            {exercise.primaryMuscle}
          </span>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-3xl border border-slate-800 flex flex-col items-center">
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

      {/* Execution Steps */}
      <div className="space-y-2.5">
        <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-1.5">
          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          <span>Execution Technique ({steps.length} Steps)</span>
        </h2>
        <div className="space-y-2">
          {steps.map((step, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800/80 flex items-start gap-3"
            >
              <span className="w-6 h-6 rounded-full bg-orange-500/10 text-orange-400 border border-orange-500/30 text-xs font-black flex items-center justify-center shrink-0 mt-0.5">
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
        <h2 className="text-sm font-bold uppercase tracking-wider text-rose-300 flex items-center gap-1.5">
          <AlertTriangle className="w-4 h-4 text-rose-400" />
          <span>Common Mistakes to Avoid</span>
        </h2>
        <div className="space-y-2">
          {mistakes.map((mistake, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-2xl bg-rose-950/20 border border-rose-900/40 flex items-start gap-2.5 text-xs text-rose-200"
            >
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
              <p className="leading-relaxed">{mistake}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Attribution */}
      <div className="p-3.5 rounded-2xl bg-slate-900 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2.5">
        <ShieldCheck className="w-4 h-4 text-slate-500 shrink-0 mt-0.5" />
        <div>
          <span className="font-bold text-slate-300">Data & Media Attribution: </span>
          {exercise.attribution ||
            'Open Source exercise dataset via Free Exercise DB (Public Domain / The Unlicense). Standard biomechanical alignment.'}
        </div>
      </div>

      {/* Sticky Bottom Add to Workout Action */}
      <div className="fixed bottom-0 left-0 right-0 z-30 bg-slate-950/95 backdrop-blur-md p-3.5 border-t border-slate-800/90 pb-[max(16px,env(safe-area-inset-bottom))]">
        <div className="max-w-2xl mx-auto">
          <button
            type="button"
            onClick={() => setShowAddToWorkout(true)}
            className="w-full py-3.5 px-4 rounded-2xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-sm flex items-center justify-center gap-2 shadow-xl shadow-orange-500/25 transition-all min-h-[48px]"
          >
            <Dumbbell className="w-4 h-4 stroke-[2.5]" />
            <span>Add to Workout</span>
            <ChevronRight className="w-4 h-4 ml-0.5" />
          </button>
        </div>
      </div>

      <AddToWorkoutModal
        exercise={exercise}
        isOpen={showAddToWorkout}
        onClose={() => setShowAddToWorkout(false)}
      />
    </div>
  );
};
