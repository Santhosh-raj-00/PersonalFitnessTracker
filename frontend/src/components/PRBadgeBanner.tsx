import React from 'react';
import { Trophy, Sparkles, X } from 'lucide-react';

interface PRBadgeBannerProps {
  exerciseName: string;
  weightKg: number;
  reps: number;
  estimated1rm: number;
  onClose: () => void;
}

export const PRBadgeBanner: React.FC<PRBadgeBannerProps> = ({
  exerciseName,
  weightKg,
  reps,
  estimated1rm,
  onClose,
}) => {
  return (
    <div className="fixed inset-x-4 top-20 z-50 md:max-w-md md:mx-auto bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-0.5 rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200">
      <div className="bg-gray-950 p-4 rounded-[14px] flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 shadow-inner">
            <Trophy className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> NEW PERSONAL RECORD!
              </span>
            </div>
            <div className="text-sm font-bold text-white leading-snug">{exerciseName}</div>
            <div className="text-xs text-amber-200/90 font-medium mt-0.5">
              {weightKg} kg × {reps} reps • Est. 1RM: <span className="font-bold text-white">{estimated1rm} kg</span>
            </div>
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-white bg-gray-900 rounded-lg border border-gray-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
