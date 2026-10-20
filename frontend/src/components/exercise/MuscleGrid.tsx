import React from 'react';
import type { MuscleGroupSummary } from '../../types';
import {
  Flame,
  Layers,
  Crosshair,
  Dumbbell,
  Zap,
  Target,
  CircleDot,
  Footprints,
  HeartPulse,
  Compass,
  ArrowUp,
  Activity,
  ChevronRight,
  Sparkles,
} from 'lucide-react';

interface MuscleGridProps {
  summaries: MuscleGroupSummary[];
  onSelectMuscle: (muscleId: string) => void;
  isLoading?: boolean;
}

// Icon and styling mapping for the 11 muscle groups + Traps + Cardio
const MUSCLE_METADATA: Record<
  string,
  {
    label: string;
    sublabel: string;
    icon: React.ComponentType<{ className?: string }>;
    accentGradient: string;
    borderAccent: string;
    badgeColor: string;
  }
> = {
  CHEST: {
    label: 'Chest',
    sublabel: 'Pectoralis Major & Minor',
    icon: Flame,
    accentGradient: 'from-orange-500/20 via-orange-500/5 to-transparent',
    borderAccent: 'group-hover:border-orange-500/50',
    badgeColor: 'text-orange-400 bg-orange-950/60 border-orange-800/60',
  },
  BACK: {
    label: 'Back',
    sublabel: 'Lats, Rhomboids & Erectors',
    icon: Layers,
    accentGradient: 'from-blue-500/20 via-blue-500/5 to-transparent',
    borderAccent: 'group-hover:border-blue-500/50',
    badgeColor: 'text-blue-400 bg-blue-950/60 border-blue-800/60',
  },
  SHOULDERS: {
    label: 'Shoulders',
    sublabel: 'Anterior, Lateral & Rear Delts',
    icon: Crosshair,
    accentGradient: 'from-amber-500/20 via-amber-500/5 to-transparent',
    borderAccent: 'group-hover:border-amber-500/50',
    badgeColor: 'text-amber-400 bg-amber-950/60 border-amber-800/60',
  },
  BICEPS: {
    label: 'Biceps',
    sublabel: 'Biceps Brachii & Brachialis',
    icon: Dumbbell,
    accentGradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    borderAccent: 'group-hover:border-emerald-500/50',
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
  },
  TRICEPS: {
    label: 'Triceps',
    sublabel: 'Long, Lateral & Medial Heads',
    icon: Zap,
    accentGradient: 'from-indigo-500/20 via-indigo-500/5 to-transparent',
    borderAccent: 'group-hover:border-indigo-500/50',
    badgeColor: 'text-indigo-400 bg-indigo-950/60 border-indigo-800/60',
  },
  FOREARMS: {
    label: 'Forearms',
    sublabel: 'Wrist Flexors & Extensors',
    icon: Activity,
    accentGradient: 'from-teal-500/20 via-teal-500/5 to-transparent',
    borderAccent: 'group-hover:border-teal-500/50',
    badgeColor: 'text-teal-400 bg-teal-950/60 border-teal-800/60',
  },
  ABS: {
    label: 'Abs',
    sublabel: 'Rectus Abdominis & Core',
    icon: Target,
    accentGradient: 'from-rose-500/20 via-rose-500/5 to-transparent',
    borderAccent: 'group-hover:border-rose-500/50',
    badgeColor: 'text-rose-400 bg-rose-950/60 border-rose-800/60',
  },
  GLUTES: {
    label: 'Glutes',
    sublabel: 'Gluteus Maximus & Medius',
    icon: CircleDot,
    accentGradient: 'from-purple-500/20 via-purple-500/5 to-transparent',
    borderAccent: 'group-hover:border-purple-500/50',
    badgeColor: 'text-purple-400 bg-purple-950/60 border-purple-800/60',
  },
  QUADS: {
    label: 'Quads',
    sublabel: 'Vastus Lateralis & Medialis',
    icon: Footprints,
    accentGradient: 'from-yellow-500/20 via-yellow-500/5 to-transparent',
    borderAccent: 'group-hover:border-yellow-500/50',
    badgeColor: 'text-yellow-400 bg-yellow-950/60 border-yellow-800/60',
  },
  QUADRICEPS: {
    label: 'Quads',
    sublabel: 'Vastus Lateralis & Medialis',
    icon: Footprints,
    accentGradient: 'from-yellow-500/20 via-yellow-500/5 to-transparent',
    borderAccent: 'group-hover:border-yellow-500/50',
    badgeColor: 'text-yellow-400 bg-yellow-950/60 border-yellow-800/60',
  },
  HAMSTRINGS: {
    label: 'Hamstrings',
    sublabel: 'Biceps Femoris & Tendons',
    icon: Sparkles,
    accentGradient: 'from-red-500/20 via-red-500/5 to-transparent',
    borderAccent: 'group-hover:border-red-500/50',
    badgeColor: 'text-red-400 bg-red-950/60 border-red-800/60',
  },
  CALVES: {
    label: 'Calves',
    sublabel: 'Gastrocnemius & Soleus',
    icon: ArrowUp,
    accentGradient: 'from-cyan-500/20 via-cyan-500/5 to-transparent',
    borderAccent: 'group-hover:border-cyan-500/50',
    badgeColor: 'text-cyan-400 bg-cyan-950/60 border-cyan-800/60',
  },
  TRAPS: {
    label: 'Traps',
    sublabel: 'Upper & Mid Trapezius',
    icon: Compass,
    accentGradient: 'from-violet-500/20 via-violet-500/5 to-transparent',
    borderAccent: 'group-hover:border-violet-500/50',
    badgeColor: 'text-violet-400 bg-violet-950/60 border-violet-800/60',
  },
  CARDIO: {
    label: 'Cardio',
    sublabel: 'Conditioning & Stamina',
    icon: HeartPulse,
    accentGradient: 'from-pink-500/20 via-pink-500/5 to-transparent',
    borderAccent: 'group-hover:border-pink-500/50',
    badgeColor: 'text-pink-400 bg-pink-950/60 border-pink-800/60',
  },
  FULL_BODY: {
    label: 'Full Body',
    sublabel: 'Compound Functional Movement',
    icon: Zap,
    accentGradient: 'from-emerald-500/20 via-emerald-500/5 to-transparent',
    borderAccent: 'group-hover:border-emerald-500/50',
    badgeColor: 'text-emerald-400 bg-emerald-950/60 border-emerald-800/60',
  },
};

export const MuscleGrid: React.FC<MuscleGridProps> = ({
  summaries,
  onSelectMuscle,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {Array.from({ length: 12 }).map((_, i) => (
          <div
            key={i}
            className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800/80 animate-pulse"
          />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-black text-white tracking-tight flex items-center gap-1.5">
            <span>Muscle Groups</span>
            <span className="text-[11px] font-bold text-orange-400 bg-orange-950/80 px-2 py-0.5 rounded-full border border-orange-800/60">
              Level 1
            </span>
          </h2>
          <p className="text-xs text-slate-400">
            Tap a muscle group to view targeting exercises, equipment filters & movement guides
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {summaries.map((summary) => {
          const meta = MUSCLE_METADATA[summary.id] || {
            label: summary.displayName,
            sublabel: summary.description,
            icon: Dumbbell,
            accentGradient: 'from-orange-500/20 via-orange-500/5 to-transparent',
            borderAccent: 'group-hover:border-orange-500/50',
            badgeColor: 'text-orange-400 bg-orange-950/60 border-orange-800/60',
          };
          const Icon = meta.icon;

          return (
            <button
              key={summary.id}
              type="button"
              onClick={() => onSelectMuscle(summary.id)}
              className={`group relative overflow-hidden rounded-2xl bg-slate-900/90 hover:bg-slate-850 border border-slate-800/90 ${meta.borderAccent} p-3.5 text-left transition-all duration-200 hover:shadow-xl hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 flex flex-col justify-between min-h-[110px]`}
            >
              {/* Background gradient hint */}
              <div
                className={`absolute inset-0 bg-gradient-to-br ${meta.accentGradient} opacity-60 pointer-events-none`}
              />

              {/* Top Row: Icon and Exercise Count */}
              <div className="flex items-start justify-between relative z-10">
                <div className="w-9 h-9 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-slate-200 group-hover:scale-110 group-hover:text-orange-400 transition-all shadow-sm">
                  <Icon className="w-5 h-5" />
                </div>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${meta.badgeColor}`}
                >
                  {summary.exerciseCount} exercises
                </span>
              </div>

              {/* Bottom Row: Muscle Name & Sublabel */}
              <div className="mt-3 relative z-10 flex items-end justify-between">
                <div>
                  <h3 className="text-sm font-black text-white group-hover:text-orange-400 transition-colors">
                    {meta.label} - {summary.exerciseCount}
                  </h3>
                  <p className="text-[10px] text-slate-400 line-clamp-1">
                    {meta.sublabel}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-orange-400 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};
