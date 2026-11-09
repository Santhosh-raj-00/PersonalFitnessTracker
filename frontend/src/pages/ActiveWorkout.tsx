import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { workoutService } from '../services/workoutService';
import { routineService } from '../services/routineService';
import { exerciseService } from '../services/exerciseService';
import type { WorkoutSession, Exercise, LastExerciseStats, RoutineDay } from '../types';
import { StepperInput } from '../components/StepperInput';
import { RestTimer } from '../components/RestTimer';
import { PRBadgeBanner } from '../components/PRBadgeBanner';
import { StartWorkoutModal } from '../components/workout/StartWorkoutModal';
import { AddExerciseModal } from '../components/workout/AddExerciseModal';
import {
  Check,
  Copy,
  Plus,
  Trophy,
  RotateCcw,
  Dumbbell,
  AlertTriangle,
} from 'lucide-react';

interface ActiveExerciseState {
  exercise: Exercise;
  targetSets?: number;
  targetRepRange?: string;
  targetRestSeconds?: number;
  lastStats?: LastExerciseStats;
  sets: {
    weightKg: number;
    reps: number;
    rpe?: number;
    isWarmup?: boolean;
    isLogged?: boolean;
    isPr?: boolean;
  }[];
}

export const ActiveWorkout: React.FC = () => {
  const navigate = useNavigate();
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exerciseStates, setExerciseStates] = useState<ActiveExerciseState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isFinishing, setIsFinishing] = useState<boolean>(false);
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false);
  const [showStartModal, setShowStartModal] = useState<boolean>(false);
  const [showAddExModal, setShowAddExModal] = useState<boolean>(false);
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);
  const [finishNotes, setFinishNotes] = useState<string>('');
  const [finishError, setFinishError] = useState<string | null>(null);

  const [activeRestTimer, setActiveRestTimer] = useState<{
    seconds: number;
    exerciseName: string;
    mediaUrl?: string;
  } | null>(null);

  const [prBanner, setPrBanner] = useState<{
    exerciseName: string;
    weightKg: number;
    reps: number;
    estimated1rm: number;
  } | null>(null);

  useEffect(() => {
    initWorkout();
  }, []);

  const initWorkout = async () => {
    setIsLoading(true);
    try {
      const active = await workoutService.getActiveSession();
      if (!active) {
        // No active session found; prompt user with routine & day picker
        setShowStartModal(true);
        setIsLoading(false);
        return;
      }
      setSession(active);
      await loadSessionExercises(active);
    } catch (err) {
      console.error('Failed to initialize workout session:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionExercises = async (activeSession: WorkoutSession) => {
    try {
      const states: ActiveExerciseState[] = [];

      // 1. If session has a Routine Day assigned, load that specific day's exercises
      if (activeSession.routineDayId) {
        try {
          const routineDay: RoutineDay = await routineService.getRoutineDay(activeSession.routineDayId);

          if (routineDay && routineDay.exercises && routineDay.exercises.length > 0) {
            for (const re of routineDay.exercises) {
              let exData: Exercise | null = null;
              try {
                exData = await exerciseService.getExerciseById(re.exerciseId);
              } catch {
                exData = {
                  id: re.exerciseId,
                  name: re.exerciseName,
                  primaryMuscle: (re.primaryMuscle as any) || 'FULL_BODY',
                  equipment: (re.equipment as any) || 'BODYWEIGHT',
                  difficulty: 'INTERMEDIATE',
                  mediaUrl: re.demoImageUrl,
                };
              }

              const lastStats = await workoutService
                .getLastExerciseStats(exData.id)
                .catch(() => undefined);

              const loggedSetsForEx =
                activeSession.sets?.filter((s) => s.exerciseId === exData!.id) || [];

              const numSets = Math.max(re.targetSets || 3, loggedSetsForEx.length);
              const defaultWeight = lastStats?.lastWeightKg || 40.0;

              // Parse default reps from targetRepRange (e.g. "8-12" -> 10, "5" -> 5)
              let defaultReps = lastStats?.lastReps || 10;
              if (re.targetRepRange) {
                const parts = re.targetRepRange.split('-');
                if (parts.length === 2) {
                  const r1 = parseInt(parts[0], 10);
                  const r2 = parseInt(parts[1], 10);
                  if (!isNaN(r1) && !isNaN(r2)) {
                    defaultReps = Math.round((r1 + r2) / 2);
                  }
                } else {
                  const single = parseInt(re.targetRepRange, 10);
                  if (!isNaN(single)) defaultReps = single;
                }
              }

              const sets: ActiveExerciseState['sets'] = Array.from({ length: numSets }, () => ({
                weightKg: defaultWeight,
                reps: defaultReps,
                isLogged: false,
              }));

              // Apply existing logged sets
              loggedSetsForEx.forEach((s, idx) => {
                if (idx < sets.length) {
                  sets[idx] = {
                    weightKg: s.weightKg,
                    reps: s.reps,
                    rpe: s.rpe,
                    isWarmup: s.isWarmup,
                    isLogged: true,
                    isPr: s.isPr,
                  };
                }
              });

              states.push({
                exercise: exData,
                targetSets: re.targetSets,
                targetRepRange: re.targetRepRange,
                targetRestSeconds: re.restSeconds,
                lastStats,
                sets,
              });
            }
          }
        } catch (dayErr) {
          console.error('Could not fetch routine day exercises:', dayErr);
        }
      }

      // 2. If no routine day or routine day was empty, check existing logged sets or provide empty state
      if (states.length === 0 && activeSession.sets && activeSession.sets.length > 0) {
        const uniqueExIds = Array.from(new Set(activeSession.sets.map((s) => s.exerciseId)));
        for (const exId of uniqueExIds) {
          try {
            const exData = await exerciseService.getExerciseById(exId);
            const lastStats = await workoutService.getLastExerciseStats(exId).catch(() => undefined);
            const loggedSets = activeSession.sets.filter((s) => s.exerciseId === exId);

            const sets: ActiveExerciseState['sets'] = loggedSets.map((s) => ({
              weightKg: s.weightKg,
              reps: s.reps,
              rpe: s.rpe,
              isWarmup: s.isWarmup,
              isLogged: true,
              isPr: s.isPr,
            }));

            states.push({
              exercise: exData,
              lastStats,
              sets,
            });
          } catch (exErr) {
            console.error('Failed to load logged exercise:', exErr);
          }
        }
      }

      setExerciseStates(states);
    } catch (err) {
      console.error('Failed to load session exercises:', err);
    }
  };

  const handleLogSet = async (exIdx: number, setIdx: number) => {
    if (!session) return;
    const exState = exerciseStates[exIdx];
    const targetSet = exState.sets[setIdx];

    try {
      const loggedSet = await workoutService.logSet(session.id, {
        exerciseId: exState.exercise.id,
        setOrder: setIdx + 1,
        weightKg: targetSet.weightKg,
        reps: targetSet.reps,
        rpe: targetSet.rpe || 8.0,
        isWarmup: targetSet.isWarmup || false,
      });

      // Update local state
      const updatedStates = [...exerciseStates];
      updatedStates[exIdx].sets[setIdx].isLogged = true;
      updatedStates[exIdx].sets[setIdx].isPr = loggedSet.isPr;
      setExerciseStates(updatedStates);

      // Trigger PR celebration banner if achieved
      if (loggedSet.isPr) {
        setPrBanner({
          exerciseName: exState.exercise.name,
          weightKg: targetSet.weightKg,
          reps: targetSet.reps,
          estimated1rm:
            loggedSet.estimated1rm ||
            Math.round(targetSet.weightKg * (1 + targetSet.reps / 30)),
        });
      }

      // Rest timer calculation: prefer routine day's restSeconds if available, else 180s compound / 90s isolation
      const isCompound =
        exState.exercise.movementType === 'COMPOUND' ||
        ['CHEST', 'BACK', 'QUADS', 'QUADRICEPS', 'HAMSTRINGS', 'SHOULDERS'].includes(
          exState.exercise.primaryMuscle
        );
      const restSec = exState.targetRestSeconds || (isCompound ? 180 : 90);

      setActiveRestTimer({
        seconds: restSec,
        exerciseName: exState.exercise.name,
        mediaUrl: exState.exercise.mediaUrl || exState.exercise.thumbnailUrl,
      });
    } catch (err: any) {
      alert(err.message || 'Failed to log set');
    }
  };

  const handleCopyLastSet = (exIdx: number, currentSetIdx: number) => {
    if (currentSetIdx === 0) return;
    const prevSet = exerciseStates[exIdx].sets[currentSetIdx - 1];
    const updated = [...exerciseStates];
    updated[exIdx].sets[currentSetIdx].weightKg = prevSet.weightKg;
    updated[exIdx].sets[currentSetIdx].reps = prevSet.reps;
    setExerciseStates(updated);
  };

  const addSetToExercise = (exIdx: number) => {
    const updated = [...exerciseStates];
    const lastSet = updated[exIdx].sets[updated[exIdx].sets.length - 1];
    updated[exIdx].sets.push({
      weightKg: lastSet ? lastSet.weightKg : 40,
      reps: lastSet ? lastSet.reps : 10,
      isLogged: false,
    });
    setExerciseStates(updated);
  };

  const handleAddCustomExercise = async (exercise: Exercise) => {
    try {
      const lastStats = await workoutService
        .getLastExerciseStats(exercise.id)
        .catch(() => undefined);
      const defaultWeight = lastStats?.lastWeightKg || 40.0;
      const defaultReps = lastStats?.lastReps || 10;

      const newExState: ActiveExerciseState = {
        exercise,
        lastStats,
        sets: [
          { weightKg: defaultWeight, reps: defaultReps, isLogged: false },
          { weightKg: defaultWeight, reps: defaultReps, isLogged: false },
          { weightKg: defaultWeight, reps: defaultReps, isLogged: false },
        ],
      };

      setExerciseStates((prev) => [...prev, newExState]);
    } catch (err) {
      console.error('Failed to add exercise to workout:', err);
    }
  };

  const handleFinishWorkout = async () => {
    if (!session) return;
    setIsFinishing(true);
    setFinishError(null);
    try {
      await workoutService.finishWorkout(session.id, finishNotes);
      setShowFinishModal(false);
      navigate('/workout/history');
    } catch (err: any) {
      console.error('Failed to finish workout:', err);
      setFinishError(err.message || 'Failed to complete session. Please retry.');
      setIsFinishing(false);
    }
  };

  const handleDiscardWorkout = async () => {
    if (!session) return;
    if (
      !window.confirm(
        'Are you sure you want to discard this workout? In-progress uncompleted data will be cancelled.'
      )
    ) {
      return;
    }

    setIsDiscarding(true);
    try {
      await workoutService.cancelWorkout(session.id);
      setShowFinishModal(false);
      navigate('/workout/history');
    } catch (err: any) {
      console.error('Failed to discard workout:', err);
      alert('Could not discard workout. Please finish or resume.');
    } finally {
      setIsDiscarding(false);
    }
  };

  // Summary stats for modal
  const summaryStats = useMemo(() => {
    let totalSetsLogged = 0;
    let totalVolume = 0;
    let prCount = 0;

    for (const ex of exerciseStates) {
      for (const s of ex.sets) {
        if (s.isLogged) {
          totalSetsLogged += 1;
          if (!s.isWarmup) {
            totalVolume += (s.weightKg || 0) * (s.reps || 0);
          }
          if (s.isPr) {
            prCount += 1;
          }
        }
      }
    }

    let elapsedMinutes = 0;
    if (session?.startTime) {
      const diffMs = Date.now() - new Date(session.startTime).getTime();
      elapsedMinutes = Math.max(1, Math.round(diffMs / 60000));
    }

    return {
      totalSetsLogged,
      totalVolume: Math.round(totalVolume),
      prCount,
      elapsedMinutes,
    };
  }, [exerciseStates, session]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-400">Loading workout session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 md:pb-8 max-w-4xl mx-auto">
      {/* Top Header Card */}
      <div className="bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/70 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-[10px] font-bold uppercase tracking-wider text-orange-400 bg-orange-950/90 px-2.5 py-0.5 rounded-full border border-orange-800/80">
              Active Workout
            </span>
            {session?.routineName && (
              <span className="text-[10px] font-semibold text-slate-300 bg-slate-800/80 px-2 py-0.5 rounded-full border border-slate-700">
                Split: {session.routineName}
              </span>
            )}
          </div>
          <h1 className="text-xl sm:text-2xl font-black text-white mt-1">
            {session?.sessionName || 'Active Gym Session'}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
            <span>Started {session?.startTime ? new Date(session.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}</span>
            <span>•</span>
            <span>{summaryStats.totalSetsLogged} sets completed</span>
            {summaryStats.totalVolume > 0 && (
              <>
                <span>•</span>
                <span className="text-orange-400 font-bold">{summaryStats.totalVolume} kg volume</span>
              </>
            )}
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => setShowAddExModal(true)}
            className="px-3 py-2.5 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs rounded-xl border border-slate-700 flex items-center gap-1.5 transition-colors"
          >
            <Plus className="w-3.5 h-3.5 text-orange-400" />
            <span>Add Exercise</span>
          </button>

          <button
            type="button"
            onClick={() => setShowFinishModal(true)}
            className="px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all"
          >
            Finish Session
          </button>
        </div>
      </div>

      {/* PR Celebration Banner */}
      {prBanner && (
        <PRBadgeBanner
          exerciseName={prBanner.exerciseName}
          weightKg={prBanner.weightKg}
          reps={prBanner.reps}
          estimated1rm={prBanner.estimated1rm}
          onClose={() => setPrBanner(null)}
        />
      )}

      {/* Empty State if No Exercises */}
      {exerciseStates.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-4 shadow-xl">
          <div className="w-14 h-14 rounded-2xl bg-orange-500/15 text-orange-500 mx-auto flex items-center justify-center">
            <Dumbbell className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-black text-white">No Exercises in Active Session</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
              Add exercises to start logging sets, auto-detecting PRs, and tracking volume.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3">
            <button
              type="button"
              onClick={() => setShowAddExModal(true)}
              className="px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 font-black text-xs rounded-xl shadow-md flex items-center gap-2 active:scale-95 transition-transform"
            >
              <Plus className="w-4 h-4" />
              <span>Add Exercise</span>
            </button>
            <button
              type="button"
              onClick={() => setShowStartModal(true)}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl border border-slate-700 transition-colors"
            >
              Choose Routine & Day
            </button>
          </div>
        </div>
      ) : (
        /* Exercises Logger List */
        <div className="space-y-6">
          {exerciseStates.map((exState, exIdx) => (
            <div
              key={`${exState.exercise.id}-${exIdx}`}
              className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4"
            >
              {/* Exercise Title Header */}
              <div className="flex items-center justify-between pb-3 border-b border-slate-800 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {exState.exercise.mediaUrl && (
                    <div className="w-12 h-12 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative shadow">
                      {exState.exercise.mediaUrl.endsWith('.mp4') ||
                      exState.exercise.mediaUrl.endsWith('.webm') ? (
                        <video
                          src={exState.exercise.mediaUrl}
                          muted
                          loop
                          autoPlay
                          playsInline
                          preload="metadata"
                          className="w-full h-full object-cover pointer-events-none"
                        />
                      ) : (
                        <img
                          src={exState.exercise.mediaUrl}
                          alt={exState.exercise.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                  )}

                  <div className="min-w-0">
                    <h2 className="text-base font-bold text-white flex items-center gap-2 flex-wrap">
                      <span className="truncate">{exState.exercise.name}</span>
                      {exState.lastStats?.maxWeightKg && exState.lastStats.maxWeightKg > 0 && (
                        <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800 flex items-center gap-1 shrink-0">
                          <Trophy className="w-3 h-3" /> PR: {exState.lastStats.maxWeightKg} kg
                        </span>
                      )}
                    </h2>
                    <div className="text-xs text-orange-400 font-semibold mt-0.5 flex items-center gap-2">
                      <span>{exState.exercise.primaryMuscle}</span>
                      <span>•</span>
                      <span>{exState.exercise.equipment}</span>
                      {exState.targetRepRange && (
                        <>
                          <span>•</span>
                          <span className="text-slate-400 font-normal">
                            Target: {exState.targetRepRange} reps
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Display Last Session Numbers Beside Exercise */}
                {exState.lastStats?.lastWeightKg && (
                  <div className="text-right bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800 shrink-0">
                    <div className="text-[10px] text-slate-400 uppercase font-semibold">
                      Last Session
                    </div>
                    <div className="text-xs font-bold text-white">
                      {exState.lastStats.lastWeightKg} kg × {exState.lastStats.lastReps} reps
                    </div>
                  </div>
                )}
              </div>

              {/* Set Logging Rows */}
              <div className="space-y-3">
                {exState.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={`p-3 rounded-2xl border transition-all ${
                      set.isLogged
                        ? 'bg-orange-950/20 border-orange-500/40'
                        : 'bg-slate-950 border-slate-800/80'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                        <span className="w-5 h-5 rounded-full bg-slate-800 text-orange-400 flex items-center justify-center text-[10px] font-black">
                          {setIdx + 1}
                        </span>
                        Set #{setIdx + 1}
                      </span>

                      <div className="flex items-center gap-2">
                        {setIdx > 0 && !set.isLogged && (
                          <button
                            type="button"
                            onClick={() => handleCopyLastSet(exIdx, setIdx)}
                            className="flex items-center gap-1 px-2 py-1 bg-slate-800 hover:bg-slate-700 text-[10px] font-semibold text-orange-400 rounded-lg transition-colors"
                            title="Copy values from previous set"
                          >
                            <Copy className="w-3 h-3" /> Copy Prev
                          </button>
                        )}

                        {set.isPr && (
                          <span className="text-[10px] font-bold text-amber-400 bg-amber-950 px-2 py-0.5 rounded-md border border-amber-800">
                            ⚡ PR SET
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 items-center">
                      <StepperInput
                        label="Weight (kg)"
                        value={set.weightKg}
                        onChange={(v) => {
                          const updated = [...exerciseStates];
                          updated[exIdx].sets[setIdx].weightKg = v;
                          setExerciseStates(updated);
                        }}
                        step={2.5}
                        quickAddValues={[2.5, 5]}
                      />

                      <StepperInput
                        label="Reps"
                        value={set.reps}
                        onChange={(v) => {
                          const updated = [...exerciseStates];
                          updated[exIdx].sets[setIdx].reps = v;
                          setExerciseStates(updated);
                        }}
                        step={1}
                        quickAddValues={[1, 2]}
                      />

                      <div className="col-span-2 sm:col-span-1 flex items-end">
                        <button
                          type="button"
                          onClick={() => handleLogSet(exIdx, setIdx)}
                          className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 transition-all ${
                            set.isLogged
                              ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                              : 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 hover:from-orange-400 hover:to-amber-400 active:scale-95'
                          }`}
                        >
                          <Check className="w-4 h-4" />
                          <span>{set.isLogged ? 'Logged ✓' : 'Log Set'}</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <button
                type="button"
                onClick={() => addSetToExercise(exIdx)}
                className="w-full py-2 bg-slate-950 hover:bg-slate-800 text-xs font-bold text-slate-400 hover:text-orange-400 rounded-xl border border-dashed border-slate-800 flex items-center justify-center gap-1 transition-colors"
              >
                <Plus className="w-3.5 h-3.5" /> Add Set
              </button>
            </div>
          ))}

          {/* Add Exercise Floating / Bottom Button */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={() => setShowAddExModal(true)}
              className="px-5 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-2xl border border-slate-800 inline-flex items-center gap-2 transition-colors shadow"
            >
              <Plus className="w-4 h-4 text-orange-400" />
              <span>Add Another Exercise to Session</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Rest Timer Bar with Exercise Animation */}
      {activeRestTimer && (
        <RestTimer
          initialSeconds={activeRestTimer.seconds}
          exerciseName={activeRestTimer.exerciseName}
          mediaUrl={activeRestTimer.mediaUrl}
          onCancel={() => setActiveRestTimer(null)}
          onFinish={() => setActiveRestTimer(null)}
        />
      )}

      {/* Finish Session Confirmation Modal */}
      {showFinishModal && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 my-auto animate-in zoom-in-95">
            <div className="text-center space-y-1">
              <h3 className="text-xl font-black text-white">Complete Workout Session</h3>
              <p className="text-xs text-slate-400">
                Save your workout volume, sets, and personal records to history.
              </p>
            </div>

            {finishError && (
              <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-300">
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                <span>{finishError}</span>
              </div>
            )}

            {/* Quick Session Stats Summary */}
            <div className="grid grid-cols-3 gap-2 p-3 bg-slate-950 rounded-2xl border border-slate-800 text-center">
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Duration</div>
                <div className="text-sm font-black text-white">{summaryStats.elapsedMinutes}m</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Total Volume</div>
                <div className="text-sm font-black text-orange-400">{summaryStats.totalVolume} kg</div>
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase font-semibold">Sets Logged</div>
                <div className="text-sm font-black text-white">{summaryStats.totalSetsLogged} sets</div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">
                Workout Notes (Optional)
              </label>
              <textarea
                value={finishNotes}
                onChange={(e) => setFinishNotes(e.target.value)}
                placeholder="Felt strong on bench press, energy was high today..."
                rows={3}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            <div className="flex flex-col gap-2 pt-1">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setShowFinishModal(false)}
                  disabled={isFinishing || isDiscarding}
                  className="w-1/2 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-colors disabled:opacity-50"
                >
                  Keep Logging
                </button>
                <button
                  type="button"
                  onClick={handleFinishWorkout}
                  disabled={isFinishing || isDiscarding}
                  className="w-1/2 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-orange-500/20 active:scale-95 transition-all flex items-center justify-center gap-1.5 disabled:opacity-50"
                >
                  {isFinishing ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Complete Workout</span>
                  )}
                </button>
              </div>

              <button
                type="button"
                onClick={handleDiscardWorkout}
                disabled={isFinishing || isDiscarding}
                className="w-full py-2 text-[11px] font-semibold text-slate-500 hover:text-red-400 transition-colors flex items-center justify-center gap-1 disabled:opacity-50"
              >
                <RotateCcw className="w-3 h-3" />
                <span>Discard this workout session</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Routine & Day Picker Modal (when initiated or needed) */}
      <StartWorkoutModal
        isOpen={showStartModal}
        onClose={() => {
          setShowStartModal(false);
          if (!session) {
            navigate('/');
          }
        }}
      />

      {/* Add Custom Exercise Modal */}
      <AddExerciseModal
        isOpen={showAddExModal}
        onClose={() => setShowAddExModal(false)}
        onSelectExercise={handleAddCustomExercise}
      />
    </div>
  );
};
