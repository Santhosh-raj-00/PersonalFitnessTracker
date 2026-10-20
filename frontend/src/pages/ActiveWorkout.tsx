import React, { useState, useEffect } from 'react';
import { workoutService } from '../services/workoutService';
import { exerciseService } from '../services/exerciseService';
import type { WorkoutSession, Exercise, LastExerciseStats } from '../types';
import { StepperInput } from '../components/StepperInput';
import { RestTimer } from '../components/RestTimer';
import { PRBadgeBanner } from '../components/PRBadgeBanner';
import { useNavigate } from 'react-router-dom';
import { Check, Copy, Plus, Trophy } from 'lucide-react';

interface ActiveExerciseState {
  exercise: Exercise;
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
  const [session, setSession] = useState<WorkoutSession | null>(null);
  const [exerciseStates, setExerciseStates] = useState<ActiveExerciseState[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeRestTimer, setActiveRestTimer] = useState<{ seconds: number; exerciseName: string; mediaUrl?: string } | null>(null);
  const [prBanner, setPrBanner] = useState<{ exerciseName: string; weightKg: number; reps: number; estimated1rm: number } | null>(null);
  const [finishNotes, setFinishNotes] = useState<string>('');
  const [showFinishModal, setShowFinishModal] = useState<boolean>(false);

  const navigate = useNavigate();

  useEffect(() => {
    initWorkout();
  }, []);

  const initWorkout = async () => {
    setIsLoading(true);
    try {
      let active = await workoutService.getActiveSession();
      if (!active) {
        // Start quick workout if no active session
        active = await workoutService.startWorkout(undefined, 'Quick Workout');
      }
      setSession(active);
      await loadSessionExercises(active);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadSessionExercises = async (activeSession: WorkoutSession) => {
    try {
      const allEx = await exerciseService.searchExercises();

      // If routine day exists, pull exercises, else pull default exercises
      let initialExList: Exercise[] = [];
      if (allEx.length > 0) {
        initialExList = allEx.slice(0, 4); // bench, deadlift, squat, lat pulldown
      }

      const states: ActiveExerciseState[] = [];
      for (const ex of initialExList) {
        const lastStats = await workoutService.getLastExerciseStats(ex.id).catch(() => undefined);
        const loggedSetsForEx = activeSession.sets?.filter((s) => s.exerciseId === ex.id) || [];

        const defaultWeight = lastStats?.lastWeightKg || 40.0;
        const defaultReps = lastStats?.lastReps || 10;

        const sets: ActiveExerciseState['sets'] = [
          { weightKg: defaultWeight, reps: defaultReps, isLogged: false },
          { weightKg: defaultWeight, reps: defaultReps, isLogged: false },
          { weightKg: defaultWeight, reps: defaultReps, isLogged: false },
        ];

        // Mark already logged sets
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
          exercise: ex,
          lastStats,
          sets,
        });
      }

      setExerciseStates(states);
    } catch (err) {
      console.error(err);
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

      // Update state
      const updatedStates = [...exerciseStates];
      updatedStates[exIdx].sets[setIdx].isLogged = true;
      updatedStates[exIdx].sets[setIdx].isPr = loggedSet.isPr;
      setExerciseStates(updatedStates);

      // Trigger PR Celebration Banner if PR hit!
      if (loggedSet.isPr) {
        setPrBanner({
          exerciseName: exState.exercise.name,
          weightKg: targetSet.weightKg,
          reps: targetSet.reps,
          estimated1rm: loggedSet.estimated1rm || Math.round(targetSet.weightKg * (1 + targetSet.reps / 30)),
        });
      }

      // Auto-start rest timer
      // Compound lifts get 180s rest, isolation lifts get 90s rest
      const isCompound =
        exState.exercise.movementType === 'COMPOUND' ||
        ['CHEST', 'BACK', 'QUADS', 'QUADRICEPS', 'HAMSTRINGS', 'SHOULDERS'].includes(exState.exercise.primaryMuscle);
      const restSec = isCompound ? 180 : 90;
      setActiveRestTimer({
        seconds: restSec,
        exerciseName: exState.exercise.name,
        mediaUrl: exState.exercise.mediaUrl || exState.exercise.thumbnailUrl
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

  const handleFinishWorkout = async () => {
    if (!session) return;
    try {
      await workoutService.finishWorkout(session.id, finishNotes);
      setShowFinishModal(false);
      navigate('/workout/history');
    } catch (err: any) {
      alert('Failed to finish workout');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-gray-400">Setting up active session...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-28 md:pb-8 max-w-4xl mx-auto">
      {/* Top Header */}
      <div className="bg-gradient-to-r from-gray-900 via-gray-900 to-emerald-950/80 border border-gray-800 rounded-3xl p-5 shadow-2xl flex items-center justify-between">
        <div>
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-950 px-2.5 py-0.5 rounded-full border border-emerald-800">
            Workout In Progress
          </span>
          <h1 className="text-2xl font-black text-white mt-1">
            {session?.sessionName || 'Active Gym Session'}
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Log sets with 1-tap steppers & copy last set
          </p>
        </div>

        <button
          onClick={() => setShowFinishModal(true)}
          className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-gray-950 font-black text-xs rounded-2xl shadow-lg shadow-emerald-500/20 btn-press"
        >
          Finish Session
        </button>
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

      {/* Exercises Logger List */}
      <div className="space-y-6">
        {exerciseStates.map((exState, exIdx) => (
          <div
            key={exState.exercise.id}
            className="bg-gray-900/90 border border-gray-800 rounded-3xl p-4 sm:p-5 shadow-xl space-y-4"
          >
            {/* Exercise Title Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <div className="flex items-center gap-3">
                {exState.exercise.mediaUrl && (
                  <div className="w-12 h-12 rounded-xl bg-slate-950 border border-gray-800 overflow-hidden shrink-0 flex items-center justify-center relative shadow">
                    {exState.exercise.mediaUrl.endsWith('.mp4') || exState.exercise.mediaUrl.endsWith('.webm') ? (
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
                      />
                    )}
                  </div>
                )}
                <div>
                  <h2 className="text-base font-bold text-white flex items-center gap-2">
                    <span>{exState.exercise.name}</span>
                    {exState.lastStats?.maxWeightKg && (
                      <span className="text-[10px] font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800 flex items-center gap-1">
                        <Trophy className="w-3 h-3" /> PR: {exState.lastStats.maxWeightKg} kg
                      </span>
                    )}
                  </h2>
                  <div className="text-xs text-emerald-400 font-semibold mt-0.5">
                    {exState.exercise.primaryMuscle} • {exState.exercise.equipment}
                  </div>
                </div>
              </div>

              {/* Display Last Session Numbers Beside Exercise */}
              {exState.lastStats?.lastWeightKg && (
                <div className="text-right bg-gray-950 px-3 py-1.5 rounded-xl border border-gray-800">
                  <div className="text-[10px] text-gray-400 uppercase font-semibold">Last Session</div>
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
                      ? 'bg-emerald-950/30 border-emerald-500/40'
                      : 'bg-gray-950 border-gray-800/80'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
                      <span className="w-5 h-5 rounded-full bg-gray-800 text-emerald-400 flex items-center justify-center text-[10px]">
                        {setIdx + 1}
                      </span>
                      Set #{setIdx + 1}
                    </span>

                    <div className="flex items-center gap-2">
                      {setIdx > 0 && !set.isLogged && (
                        <button
                          type="button"
                          onClick={() => handleCopyLastSet(exIdx, setIdx)}
                          className="flex items-center gap-1 px-2 py-1 bg-gray-800 hover:bg-gray-700 text-[10px] font-semibold text-emerald-400 rounded-lg transition-colors"
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
                        className={`w-full py-2.5 rounded-xl font-bold text-xs shadow-md flex items-center justify-center gap-1.5 btn-press transition-all ${
                          set.isLogged
                            ? 'bg-emerald-600 text-white hover:bg-emerald-500'
                            : 'bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 hover:from-emerald-400 hover:to-teal-400'
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
              className="w-full py-2 bg-gray-950 hover:bg-gray-800 text-xs font-bold text-gray-400 hover:text-emerald-400 rounded-xl border border-dashed border-gray-800 flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-3.5 h-3.5" /> Add Set
            </button>
          </div>
        ))}
      </div>

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
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-3xl max-w-md w-full p-6 shadow-2xl animate-in zoom-in-95">
            <h3 className="text-xl font-black text-white text-center">Finish Workout Session?</h3>
            <p className="text-xs text-gray-400 text-center mt-1">
              Your volume, sets, and PRs will be saved to history.
            </p>

            <div className="my-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">
                Workout Notes (Optional)
              </label>
              <textarea
                value={finishNotes}
                onChange={(e) => setFinishNotes(e.target.value)}
                placeholder="Felt strong on bench press, energy was great..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-950 border border-gray-800 rounded-xl text-white text-xs focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFinishModal(false)}
                className="w-1/2 py-2.5 bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs rounded-xl"
              >
                Keep Logging
              </button>
              <button
                type="button"
                onClick={handleFinishWorkout}
                className="w-1/2 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 font-black text-xs rounded-xl shadow-lg btn-press"
              >
                Complete Workout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
