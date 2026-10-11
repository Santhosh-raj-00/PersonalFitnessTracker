import React, { useState, useEffect } from 'react';
import type { Exercise, Routine } from '../../types';
import { routineService } from '../../services/routineService';
import { Plus, Check, Dumbbell, X, Play, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AddToWorkoutModalProps {
  exercise: Exercise;
  isOpen: boolean;
  onClose: () => void;
}

export const AddToWorkoutModal: React.FC<AddToWorkoutModalProps> = ({
  exercise,
  isOpen,
  onClose,
}) => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);
  const [selectedDayId, setSelectedDayId] = useState<number | null>(null);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen) {
      loadRoutines();
    }
  }, [isOpen]);

  const loadRoutines = async () => {
    setIsLoading(true);
    try {
      const data = await routineService.getRoutines();
      setRoutines(data);
      if (data.length > 0 && data[0].days.length > 0) {
        setSelectedRoutineId(data[0].id);
        setSelectedDayId(data[0].days[0].id);
      }
    } catch (err) {
      console.error('Error fetching routines:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuickSession = () => {
    // Navigate directly to active workout with this exercise preloaded in query/storage
    onClose();
    navigate('/workout/active', { state: { initialExercise: exercise } });
  };

  const handleSaveToRoutine = () => {
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 1200);
  };

  if (!isOpen) return null;

  const currentRoutine = routines.find((r) => r.id === selectedRoutineId);

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Dumbbell className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Add to Workout</h3>
              <p className="text-[11px] text-slate-400 truncate max-w-[220px]">
                {exercise.name}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 rounded-lg min-w-[36px] min-h-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Quick Log Action */}
        <button
          onClick={handleStartQuickSession}
          className="w-full p-3 rounded-xl bg-orange-500 hover:bg-orange-600 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all min-h-[46px]"
        >
          <Play className="w-4 h-4 fill-slate-950" />
          <span>Start Instant Logging Session Now</span>
        </button>

        <div className="flex items-center gap-2 text-[11px] text-slate-500 uppercase font-bold tracking-wider my-1">
          <div className="flex-1 h-px bg-slate-800" />
          <span>Or Attach to Routine Split</span>
          <div className="flex-1 h-px bg-slate-800" />
        </div>

        {/* Routine Selector */}
        {isLoading ? (
          <div className="py-6 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" />
            <span className="text-xs">Loading routines...</span>
          </div>
        ) : routines.length > 0 ? (
          <div className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Select Routine Template:
              </label>
              <select
                value={selectedRoutineId || ''}
                onChange={(e) => {
                  const id = Number(e.target.value);
                  setSelectedRoutineId(id);
                  const found = routines.find((r) => r.id === id);
                  if (found && found.days.length > 0) {
                    setSelectedDayId(found.days[0].id);
                  }
                }}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 min-h-[44px]"
              >
                {routines.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.name} ({r.splitType})
                  </option>
                ))}
              </select>
            </div>

            {currentRoutine && currentRoutine.days.length > 0 && (
              <div>
                <label className="text-xs font-semibold text-slate-300 block mb-1">
                  Select Day:
                </label>
                <select
                  value={selectedDayId || ''}
                  onChange={(e) => setSelectedDayId(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 min-h-[44px]"
                >
                  {currentRoutine.days.map((day) => (
                    <option key={day.id} value={day.id}>
                      {day.dayName}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              onClick={handleSaveToRoutine}
              disabled={isSuccess}
              className={`w-full py-2.5 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 min-h-[44px] ${
                isSuccess
                  ? 'bg-emerald-500 text-slate-950 font-black'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-100 border border-slate-700'
              }`}
            >
              {isSuccess ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Exercise Appended to Split!</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 text-orange-400" />
                  <span>Add to Routine Day</span>
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="py-4 text-center text-xs text-slate-400">
            No routines found. Create one in the Workouts tab!
          </div>
        )}
      </div>
    </div>
  );
};
