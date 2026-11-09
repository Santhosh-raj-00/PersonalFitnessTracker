import React, { useState, useEffect } from 'react';
import { exerciseService } from '../../services/exerciseService';
import type { Exercise, MuscleGroupSummary } from '../../types';
import { Search, X, Dumbbell, Plus } from 'lucide-react';

interface AddExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercise: (exercise: Exercise) => void;
}

export const AddExerciseModal: React.FC<AddExerciseModalProps> = ({
  isOpen,
  onClose,
  onSelectExercise,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [muscles, setMuscles] = useState<MuscleGroupSummary[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadMuscles();
      searchExercises();
    }
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const timer = setTimeout(() => {
      searchExercises();
    }, 250);
    return () => clearTimeout(timer);
  }, [searchTerm, selectedMuscle]);

  const loadMuscles = async () => {
    try {
      const data = await exerciseService.getMuscleGroups();
      setMuscles(data);
    } catch (err) {
      console.error('Failed to load muscles', err);
    }
  };

  const searchExercises = async () => {
    setIsLoading(true);
    try {
      const res = await exerciseService.searchExercises(
        searchTerm || undefined,
        selectedMuscle !== 'ALL' ? selectedMuscle : undefined
      );
      setExercises(res.slice(0, 50));
    } catch (err) {
      console.error('Failed to search exercises', err);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-exercise-title"
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 overflow-y-auto"
    >
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl space-y-4 my-auto animate-in zoom-in-95">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/15 text-orange-500 flex items-center justify-center">
              <Plus className="w-4 h-4" />
            </div>
            <h3 id="add-exercise-title" className="text-lg font-black text-white">
              Add Exercise to Workout
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close dialog"
            className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search exercises by name (e.g. Incline Bench, Lateral Raise)..."
            className="w-full pl-9 pr-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 transition-colors"
            autoFocus
          />
        </div>

        {/* Muscle Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-thin">
          <button
            type="button"
            onClick={() => setSelectedMuscle('ALL')}
            className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
              selectedMuscle === 'ALL'
                ? 'bg-orange-500 text-slate-950'
                : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
            }`}
          >
            All Muscles
          </button>
          {muscles.map((m) => (
            <button
              key={m.id}
              type="button"
              onClick={() => setSelectedMuscle(m.id)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-bold shrink-0 transition-colors ${
                selectedMuscle === m.id
                  ? 'bg-orange-500 text-slate-950'
                  : 'bg-slate-800 text-slate-400 hover:bg-slate-700 hover:text-white'
              }`}
            >
              {m.displayName}
            </button>
          ))}
        </div>

        {/* Exercise List */}
        <div className="max-h-72 overflow-y-auto space-y-2 pr-1">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2">
              <div className="w-6 h-6 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs text-slate-400">Searching exercises...</span>
            </div>
          ) : exercises.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400">
              No exercises match "{searchTerm}". Try a different search term.
            </div>
          ) : (
            exercises.map((ex) => (
              <div
                key={ex.id}
                className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/80 hover:border-orange-500/50 hover:bg-slate-800/60 transition-all gap-3"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {ex.mediaUrl ? (
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 overflow-hidden shrink-0">
                      {ex.mediaUrl.endsWith('.mp4') || ex.mediaUrl.endsWith('.webm') ? (
                        <video
                          src={ex.mediaUrl}
                          muted
                          loop
                          autoPlay
                          playsInline
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <img
                          src={ex.mediaUrl}
                          alt={ex.name}
                          className="w-full h-full object-cover"
                          loading="lazy"
                        />
                      )}
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center text-slate-500 shrink-0">
                      <Dumbbell className="w-4 h-4" />
                    </div>
                  )}

                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{ex.name}</div>
                    <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                      <span className="text-orange-400 font-medium">{ex.primaryMuscle}</span>
                      <span>•</span>
                      <span>{ex.equipment}</span>
                    </div>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectExercise(ex);
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 text-xs font-bold rounded-xl shadow shrink-0 flex items-center gap-1 active:scale-95 transition-transform"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};
