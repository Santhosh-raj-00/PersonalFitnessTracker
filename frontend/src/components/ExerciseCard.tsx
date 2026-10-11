import React, { useState } from 'react';
import type { Exercise } from '../types';
import { Dumbbell, Info, Sparkles, ChevronRight, X } from 'lucide-react';

interface ExerciseCardProps {
  exercise: Exercise;
  onSelect?: (exercise: Exercise) => void;
  actionButtonLabel?: string;
}

export const ExerciseCard: React.FC<ExerciseCardProps> = ({
  exercise,
  onSelect,
  actionButtonLabel = 'Details',
}) => {
  const [showTipsModal, setShowTipsModal] = useState<boolean>(false);

  const getDifficultyColor = (diff: string) => {
    switch (diff) {
      case 'BEGINNER': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'INTERMEDIATE': return 'bg-amber-500/10 text-amber-400 border-amber-500/30';
      case 'ADVANCED': return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default: return 'bg-gray-800 text-gray-300 border-gray-700';
    }
  };

  return (
    <>
      <div className="bg-gray-900/90 border border-gray-800 hover:border-gray-700 rounded-2xl p-4 flex flex-col justify-between transition-all hover:shadow-lg group">
        <div className="flex items-start gap-3.5">
          <div className="w-14 h-14 rounded-xl bg-gray-800/80 border border-gray-700/60 overflow-hidden shrink-0 flex items-center justify-center relative">
            {exercise.demoImageUrl ? (
              <img
                src={exercise.demoImageUrl}
                alt={exercise.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                loading="lazy"
              />
            ) : (
              <Dumbbell className="w-6 h-6 text-gray-500" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center justify-between gap-1">
              <h3 className="text-base font-bold text-white truncate group-hover:text-emerald-400 transition-colors">
                {exercise.name}
              </h3>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${getDifficultyColor(exercise.difficulty)}`}>
                {exercise.difficulty}
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-1.5 mt-2">
              <span className="text-xs font-semibold px-2 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-800/50">
                {exercise.primaryMuscle}
              </span>
              <span className="text-xs font-medium px-2 py-0.5 rounded-md bg-gray-800/80 text-gray-300 border border-gray-700/50">
                {exercise.equipment}
              </span>
              {exercise.secondaryMuscles && (
                <span className="text-[11px] text-gray-400 truncate max-w-[140px]">
                  +{exercise.secondaryMuscles}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 mt-3 border-t border-gray-800/60 text-xs">
          <button
            type="button"
            onClick={() => setShowTipsModal(true)}
            className="flex items-center gap-1 text-gray-400 hover:text-emerald-400 transition-colors font-medium"
          >
            <Info className="w-3.5 h-3.5" />
            <span>Form Tips</span>
          </button>

          {onSelect ? (
            <button
              type="button"
              onClick={() => onSelect(exercise)}
              className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg font-semibold shadow-md btn-press"
            >
              <span>{actionButtonLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setShowTipsModal(true)}
              className="p-1 text-gray-400 hover:text-white"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Form Tips Modal */}
      {showTipsModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-gray-800 rounded-2xl max-w-md w-full p-5 shadow-2xl animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                {exercise.name} Form Guide
              </h3>
              <button
                onClick={() => setShowTipsModal(false)}
                className="p-1 text-gray-400 hover:text-white bg-gray-800 rounded-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="my-4 space-y-3">
              {exercise.demoImageUrl && (
                <div className="h-44 rounded-xl overflow-hidden bg-gray-950 border border-gray-800">
                  <img src={exercise.demoImageUrl} alt={exercise.name} className="w-full h-full object-cover" />
                </div>
              )}

              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Target Muscles</div>
                <div className="flex flex-wrap gap-1.5">
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded-md border border-emerald-800">
                    Primary: {exercise.primaryMuscle}
                  </span>
                  {exercise.secondaryMuscles && (
                    <span className="text-xs text-gray-300 bg-gray-800 px-2 py-0.5 rounded-md">
                      Secondary: {exercise.secondaryMuscles}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-1">Execution & Form Tips</div>
                <p className="text-sm text-gray-200 leading-relaxed bg-gray-950 p-3 rounded-xl border border-gray-800/60">
                  {exercise.formTips || 'Keep core tight, maintain controlled tempo on both concentric and eccentric phases, and avoid using momentum.'}
                </p>
              </div>
            </div>

            <button
              onClick={() => setShowTipsModal(false)}
              className="w-full py-2.5 bg-gray-800 hover:bg-gray-700 text-white rounded-xl font-semibold text-sm transition-colors"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
};
