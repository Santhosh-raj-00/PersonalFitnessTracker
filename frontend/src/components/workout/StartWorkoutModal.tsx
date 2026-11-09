import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { routineService } from '../../services/routineService';
import { workoutService } from '../../services/workoutService';
import type { Routine, RoutineDay, WorkoutSession } from '../../types';
import {
  Play,
  X,
  Dumbbell,
  Calendar,
  Clock,
  Layers,
  AlertTriangle,
  RotateCcw,
  ChevronRight,
  CheckCircle2,
  PlusCircle,
} from 'lucide-react';

interface StartWorkoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  preselectedRoutineId?: number;
  preselectedDayId?: number;
}

export const StartWorkoutModal: React.FC<StartWorkoutModalProps> = ({
  isOpen,
  onClose,
  preselectedRoutineId,
  preselectedDayId,
}) => {
  const navigate = useNavigate();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [activeSession, setActiveSession] = useState<WorkoutSession | null>(null);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [selectedDay, setSelectedDay] = useState<RoutineDay | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isStarting, setIsStarting] = useState<boolean>(false);
  const [isDiscarding, setIsDiscarding] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const [routinesData, sessionData] = await Promise.all([
        routineService.getRoutines().catch(() => [] as Routine[]),
        workoutService.getActiveSession().catch(() => null),
      ]);

      setRoutines(routinesData);
      setActiveSession(sessionData);

      // Pre-selection logic
      if (routinesData.length > 0) {
        let initialRoutine = routinesData[0];
        if (preselectedRoutineId) {
          const match = routinesData.find((r) => r.id === preselectedRoutineId);
          if (match) initialRoutine = match;
        }

        setSelectedRoutine(initialRoutine);

        if (initialRoutine.days && initialRoutine.days.length > 0) {
          let initialDay = initialRoutine.days[0];
          if (preselectedDayId) {
            const dayMatch = initialRoutine.days.find((d) => d.id === preselectedDayId);
            if (dayMatch) initialDay = dayMatch;
          }
          setSelectedDay(initialDay);
        } else {
          setSelectedDay(null);
        }
      }
    } catch (err: any) {
      console.error('Failed to load workout options:', err);
      setErrorMessage('Could not load routines. Please check your connection.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSelectRoutine = (routine: Routine) => {
    setSelectedRoutine(routine);
    if (routine.days && routine.days.length > 0) {
      setSelectedDay(routine.days[0]);
    } else {
      setSelectedDay(null);
    }
  };

  const handleSelectDay = (day: RoutineDay) => {
    setSelectedDay(day);
  };

  const handleStartSelectedDay = async () => {
    if (!selectedDay) return;
    setIsStarting(true);
    setErrorMessage(null);
    try {
      // If there's an active session with no sets, it will update; otherwise it creates
      await workoutService.startWorkout(selectedDay.id, selectedDay.dayName);
      onClose();
      navigate('/workout/active');
    } catch (err: any) {
      console.error('Failed to start workout:', err);
      setErrorMessage(err.message || 'Failed to start workout session.');
      setIsStarting(false);
    }
  };

  const handleStartQuickWorkout = async () => {
    setIsStarting(true);
    setErrorMessage(null);
    try {
      await workoutService.startWorkout(undefined, 'Quick Workout');
      onClose();
      navigate('/workout/active');
    } catch (err: any) {
      console.error('Failed to start quick workout:', err);
      setErrorMessage(err.message || 'Failed to start workout.');
      setIsStarting(false);
    }
  };

  const handleResumeActiveSession = () => {
    onClose();
    navigate('/workout/active');
  };

  const handleDiscardActiveSession = async () => {
    if (!activeSession) return;
    if (!window.confirm('Discard active workout in progress? All uncompleted sets will be cleared.')) {
      return;
    }

    setIsDiscarding(true);
    try {
      await workoutService.cancelWorkout(activeSession.id);
      setActiveSession(null);
    } catch (err: any) {
      console.error('Failed to discard session:', err);
      alert('Could not discard active session. You can continue or finish it directly.');
    } finally {
      setIsDiscarding(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="start-workout-modal-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-5 sm:p-6 shadow-2xl space-y-5 animate-in zoom-in-95 my-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
              <Play className="w-5 h-5 fill-current" aria-hidden="true" />
            </div>
            <div>
              <h2 id="start-workout-modal-title" className="text-xl font-black text-white">
                Start Workout
              </h2>
              <p className="text-xs text-slate-400">
                Choose your routine split and day to load scheduled exercises
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" aria-hidden="true" />
          </button>
        </div>

        {errorMessage && (
          <div className="p-3 bg-red-950/80 border border-red-800 rounded-xl flex items-center gap-2 text-xs text-red-300">
            <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Active Session Warning Banner */}
        {activeSession && (
          <div className="p-4 bg-gradient-to-r from-amber-950/70 to-orange-950/60 border border-amber-800/80 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
                </span>
                <span className="text-[11px] font-black uppercase tracking-wider text-amber-300">
                  Active Session In Progress
                </span>
              </div>
              <div className="text-sm font-bold text-white">
                {activeSession.sessionName}
                {activeSession.routineName && (
                  <span className="text-xs text-amber-300/80 ml-1.5 font-normal">
                    ({activeSession.routineName})
                  </span>
                )}
              </div>
              <div className="text-xs text-slate-300 flex items-center gap-3">
                <span>{activeSession.sets?.length || 0} sets logged</span>
                <span>•</span>
                <span>Started {new Date(activeSession.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={handleDiscardActiveSession}
                disabled={isDiscarding}
                className="px-3 py-2 bg-slate-800 hover:bg-red-950/80 hover:text-red-300 text-slate-300 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{isDiscarding ? 'Discarding...' : 'Discard'}</span>
              </button>

              <button
                type="button"
                onClick={handleResumeActiveSession}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume</span>
              </button>
            </div>
          </div>
        )}

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-8 h-8 border-3 border-orange-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs font-semibold text-slate-400">Loading workout splits...</span>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Step 1: Select Routine */}
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-orange-400" />
                <span>1. Select Routine Split</span>
              </label>

              {routines.length === 0 ? (
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl text-center text-xs text-slate-400">
                  No routines found. You can start a freestyle workout below.
                </div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {routines.map((routine) => {
                    const isSelected = selectedRoutine?.id === routine.id;
                    return (
                      <button
                        key={routine.id}
                        type="button"
                        onClick={() => handleSelectRoutine(routine)}
                        className={`text-left p-3 rounded-2xl border transition-all ${
                          isSelected
                            ? 'bg-orange-500/10 border-orange-500 text-white shadow-md'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="text-xs font-bold truncate flex items-center justify-between">
                          <span>{routine.name}</span>
                          {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-orange-400 shrink-0" />}
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1 flex items-center gap-1">
                          <span>{routine.days?.length || 0} Workout Days</span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Select Day */}
            {selectedRoutine && selectedRoutine.days && selectedRoutine.days.length > 0 && (
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5 text-orange-400" />
                  <span>2. Select Day</span>
                </label>

                <div className="flex flex-wrap gap-2">
                  {selectedRoutine.days.map((day) => {
                    const isSelected = selectedDay?.id === day.id;
                    return (
                      <button
                        key={day.id}
                        type="button"
                        onClick={() => handleSelectDay(day)}
                        className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all flex items-center gap-2 ${
                          isSelected
                            ? 'bg-orange-500 text-slate-950 border-orange-500 shadow-md shadow-orange-500/20'
                            : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <span>{day.dayName}</span>
                        <span
                          className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                            isSelected ? 'bg-slate-950/20 text-slate-950 font-black' : 'bg-slate-800 text-slate-400'
                          }`}
                        >
                          {day.exercises?.length || 0} ex
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Step 3: Exercise Preview */}
            {selectedDay && (
              <div className="bg-slate-950/80 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Dumbbell className="w-4 h-4 text-orange-400" />
                    <span className="text-xs font-bold text-white">
                      {selectedDay.dayName}
                    </span>
                  </div>
                  <span className="text-[11px] font-bold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded-md border border-orange-800/60">
                    {selectedDay.exercises?.length || 0} Exercises Scheduled
                  </span>
                </div>

                {selectedDay.exercises && selectedDay.exercises.length > 0 ? (
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedDay.exercises.map((ex, idx) => (
                      <div
                        key={ex.id || idx}
                        className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-lg bg-slate-900/80 border border-slate-800/60 text-slate-300"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <span className="text-[10px] font-black text-slate-500 w-4">
                            {idx + 1}.
                          </span>
                          <span className="font-semibold text-white truncate">
                            {ex.exerciseName}
                          </span>
                          <span className="text-[10px] uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-400">
                            {ex.primaryMuscle}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-[11px] text-slate-400 shrink-0">
                          <span className="text-orange-400 font-bold">{ex.targetSets} sets</span>
                          <span>•</span>
                          <span>{ex.targetRepRange} reps</span>
                          <span>•</span>
                          <span className="flex items-center gap-0.5">
                            <Clock className="w-3 h-3 text-slate-500" />
                            {ex.restSeconds}s
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-400 italic">No exercises configured in this day yet.</p>
                )}
              </div>
            )}

            {/* Actions */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
              <button
                type="button"
                onClick={handleStartQuickWorkout}
                disabled={isStarting}
                className="text-xs font-semibold text-slate-400 hover:text-orange-400 flex items-center gap-1.5 transition-colors order-2 sm:order-1"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Or start empty / freestyle workout</span>
              </button>

              <button
                type="button"
                onClick={handleStartSelectedDay}
                disabled={!selectedDay || isStarting}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-orange-500/25 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:pointer-events-none order-1 sm:order-2"
              >
                {isStarting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                    <span>Preparing Workout...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    <span>Start {selectedDay?.dayName || 'Workout'}</span>
                    <ChevronRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
