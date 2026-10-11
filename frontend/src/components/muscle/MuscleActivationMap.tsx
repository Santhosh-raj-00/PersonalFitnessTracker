import React, { useState } from 'react';

export type MuscleStatus = 'primary' | 'secondary' | 'neutral';

interface MuscleActivationMapProps {
  primaryMuscles?: string[] | string;
  secondaryMuscles?: string[] | string;
  className?: string;
  showLegend?: boolean;
  interactive?: boolean;
  activeView?: 'front' | 'back' | 'both';
}

// Muscle group alias mapping to coordinate path targets
const MUSCLE_MAPPINGS: Record<string, string[]> = {
  CHEST: ['chest'],
  BACK: ['lats', 'lower_back', 'mid_back'],
  SHOULDERS: ['shoulders_front', 'shoulders_rear'],
  BICEPS: ['biceps'],
  TRICEPS: ['triceps'],
  FOREARMS: ['forearms_front', 'forearms_back'],
  ABS: ['abs', 'obliques'],
  GLUTES: ['glutes'],
  QUADS: ['quads'],
  QUADRICEPS: ['quads'],
  HAMSTRINGS: ['hamstrings'],
  CALVES: ['calves_front', 'calves_back'],
  TRAPS: ['traps_front', 'traps_back'],
  CARDIO: ['abs', 'quads', 'hamstrings', 'calves_front'],
};

export const MuscleActivationMap: React.FC<MuscleActivationMapProps> = ({
  primaryMuscles = [],
  secondaryMuscles = [],
  className = '',
  showLegend = true,
  interactive = true,
  activeView: initialView = 'front',
}) => {
  const [selectedView, setSelectedView] = useState<'front' | 'back'>(
    initialView === 'back' ? 'back' : 'front'
  );
  const [hoveredMuscle, setHoveredMuscle] = useState<string | null>(null);

  // Normalize string array or comma-separated string
  const normalizeList = (input: string[] | string): string[] => {
    if (Array.isArray(input)) {
      return input.flatMap((item) => item.toUpperCase().split(',').map((s) => s.trim()));
    }
    if (typeof input === 'string') {
      return input.toUpperCase().split(',').map((s) => s.trim()).filter(Boolean);
    }
    return [];
  };

  const primaryList = normalizeList(primaryMuscles);
  const secondaryList = normalizeList(secondaryMuscles);

  const getStatus = (pathGroup: string): MuscleStatus => {
    for (const [key, groups] of Object.entries(MUSCLE_MAPPINGS)) {
      if (groups.includes(pathGroup)) {
        if (primaryList.includes(key)) return 'primary';
        if (secondaryList.includes(key)) return 'secondary';
      }
    }
    return 'neutral';
  };

  const getFillColor = (status: MuscleStatus, isHovered: boolean) => {
    if (status === 'primary') {
      return isHovered ? '#ea580c' : '#f97316'; // Vibrant orange
    }
    if (status === 'secondary') {
      return isHovered ? '#0284c7' : '#38bdf8'; // Sky cyan
    }
    return isHovered ? '#475569' : '#334155'; // Neutral body slate
  };

  const getStrokeColor = (status: MuscleStatus) => {
    if (status === 'primary') return '#fdba74';
    if (status === 'secondary') return '#7dd3fc';
    return '#1e293b';
  };

  const renderMusclePath = (
    id: string,
    group: string,
    d: string,
    label: string
  ) => {
    const status = getStatus(group);
    const isHovered = hoveredMuscle === label;

    return (
      <path
        id={id}
        d={d}
        fill={getFillColor(status, isHovered)}
        stroke={getStrokeColor(status)}
        strokeWidth="1.2"
        strokeLinejoin="round"
        className={`transition-colors duration-200 ${
          interactive ? 'cursor-pointer hover:opacity-90' : ''
        }`}
        onMouseEnter={() => setHoveredMuscle(label)}
        onMouseLeave={() => setHoveredMuscle(null)}
      >
        <title>{`${label} (${status === 'primary' ? 'Primary Target' : status === 'secondary' ? 'Secondary Assist' : 'Neutral'})`}</title>
      </path>
    );
  };

  return (
    <div className={`flex flex-col items-center select-none ${className}`}>
      {/* Front / Back Toggle Buttons */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-900/90 dark:bg-slate-950/90 border border-slate-800 rounded-xl mb-3 shadow-inner">
        <button
          type="button"
          onClick={() => setSelectedView('front')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-w-[70px] ${
            selectedView === 'front'
              ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Front View
        </button>
        <button
          type="button"
          onClick={() => setSelectedView('back')}
          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all min-w-[70px] ${
            selectedView === 'back'
              ? 'bg-orange-500 text-slate-950 shadow-md shadow-orange-500/20'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          Back View
        </button>
      </div>

      {/* SVG Container */}
      <div className="relative w-48 h-84 md:w-56 md:h-96 flex items-center justify-center p-2 bg-slate-950/40 rounded-2xl border border-slate-800/80">
        <svg
          viewBox="0 0 200 340"
          className="w-full h-full drop-shadow-md"
          role="img"
          aria-label={`Human body muscle diagram showing ${selectedView} activation`}
        >
          {selectedView === 'front' ? (
            <g id="front-view">
              {/* Head & Neck Base Outline */}
              <ellipse cx="100" cy="24" rx="14" ry="17" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <path d="M94 40 L94 48 L106 48 L106 40 Z" fill="#1e293b" />

              {/* Traps (Front) */}
              {renderMusclePath(
                'muscle-traps-front-left',
                'traps_front',
                'M93 42 L82 48 L88 56 L94 48 Z',
                'Traps'
              )}
              {renderMusclePath(
                'muscle-traps-front-right',
                'traps_front',
                'M107 42 L118 48 L112 56 L106 48 Z',
                'Traps'
              )}

              {/* Shoulders (Front Deltoids) */}
              {renderMusclePath(
                'muscle-shoulders-front-left',
                'shoulders_front',
                'M82 48 L68 56 L66 69 L78 68 L88 56 Z',
                'Front Shoulders'
              )}
              {renderMusclePath(
                'muscle-shoulders-front-right',
                'shoulders_front',
                'M118 48 L132 56 L134 69 L122 68 L112 56 Z',
                'Front Shoulders'
              )}

              {/* Chest (Pectorals) */}
              {renderMusclePath(
                'muscle-chest-left',
                'chest',
                'M88 56 L78 68 L79 84 L99 82 L99 56 Z',
                'Pectoralis Major (Chest)'
              )}
              {renderMusclePath(
                'muscle-chest-right',
                'chest',
                'M112 56 L122 68 L121 84 L101 82 L101 56 Z',
                'Pectoralis Major (Chest)'
              )}

              {/* Biceps */}
              {renderMusclePath(
                'muscle-biceps-left',
                'biceps',
                'M66 69 L62 90 L72 90 L78 68 Z',
                'Biceps Brachii'
              )}
              {renderMusclePath(
                'muscle-biceps-right',
                'biceps',
                'M134 69 L138 90 L128 90 L122 68 Z',
                'Biceps Brachii'
              )}

              {/* Forearms (Front) */}
              {renderMusclePath(
                'muscle-forearms-front-left',
                'forearms_front',
                'M62 92 L56 122 L65 120 L72 92 Z',
                'Forearms'
              )}
              {renderMusclePath(
                'muscle-forearms-front-right',
                'forearms_front',
                'M138 92 L144 122 L135 120 L128 92 Z',
                'Forearms'
              )}

              {/* Hands */}
              <ellipse cx="54" cy="129" rx="5" ry="7" fill="#1e293b" />
              <ellipse cx="146" cy="129" rx="5" ry="7" fill="#1e293b" />

              {/* Core / Abdominals */}
              {renderMusclePath(
                'muscle-abs',
                'abs',
                'M87 84 L88 122 L112 122 L113 84 Z',
                'Rectus Abdominis (Abs)'
              )}

              {/* Obliques */}
              {renderMusclePath(
                'muscle-obliques-left',
                'obliques',
                'M79 84 L76 118 L88 122 L87 84 Z',
                'Obliques'
              )}
              {renderMusclePath(
                'muscle-obliques-right',
                'obliques',
                'M121 84 L124 118 L112 122 L113 84 Z',
                'Obliques'
              )}

              {/* Pelvis / Base */}
              <path d="M76 118 L82 136 L118 136 L124 118 Z" fill="#1e293b" />

              {/* Quadriceps (Left & Right) */}
              {renderMusclePath(
                'muscle-quads-left',
                'quads',
                'M82 136 L72 195 L88 198 L97 142 Z',
                'Quadriceps'
              )}
              {renderMusclePath(
                'muscle-quads-right',
                'quads',
                'M118 136 L128 195 L112 198 L103 142 Z',
                'Quadriceps'
              )}

              {/* Knees */}
              <circle cx="80" cy="204" r="5" fill="#1e293b" stroke="#334155" />
              <circle cx="120" cy="204" r="5" fill="#1e293b" stroke="#334155" />

              {/* Calves / Shins (Front) */}
              {renderMusclePath(
                'muscle-calves-front-left',
                'calves_front',
                'M76 210 L74 270 L86 270 L87 210 Z',
                'Calves & Tibialis'
              )}
              {renderMusclePath(
                'muscle-calves-front-right',
                'calves_front',
                'M124 210 L126 270 L114 270 L113 210 Z',
                'Calves & Tibialis'
              )}

              {/* Feet */}
              <path d="M70 274 L84 274 L88 288 L66 288 Z" fill="#1e293b" />
              <path d="M130 274 L116 274 L112 288 L134 288 Z" fill="#1e293b" />
            </g>
          ) : (
            <g id="back-view">
              {/* Head & Neck Back */}
              <ellipse cx="100" cy="24" rx="14" ry="17" fill="#1e293b" stroke="#334155" strokeWidth="1" />
              <path d="M94 40 L94 48 L106 48 L106 40 Z" fill="#1e293b" />

              {/* Traps (Upper & Mid Back) */}
              {renderMusclePath(
                'muscle-traps-back',
                'traps_back',
                'M94 42 L82 48 L90 74 L100 84 L110 74 L118 48 L106 42 Z',
                'Trapezius'
              )}

              {/* Rear Deltoids */}
              {renderMusclePath(
                'muscle-shoulders-rear-left',
                'shoulders_rear',
                'M82 48 L68 56 L66 69 L78 68 L82 54 Z',
                'Rear Deltoids'
              )}
              {renderMusclePath(
                'muscle-shoulders-rear-right',
                'shoulders_rear',
                'M118 48 L132 56 L134 69 L122 68 L118 54 Z',
                'Rear Deltoids'
              )}

              {/* Triceps (Back of Arms) */}
              {renderMusclePath(
                'muscle-triceps-left',
                'triceps',
                'M66 69 L62 90 L72 90 L78 68 Z',
                'Triceps'
              )}
              {renderMusclePath(
                'muscle-triceps-right',
                'triceps',
                'M134 69 L138 90 L128 90 L122 68 Z',
                'Triceps'
              )}

              {/* Forearms (Back) */}
              {renderMusclePath(
                'muscle-forearms-back-left',
                'forearms_back',
                'M62 92 L56 122 L65 120 L72 92 Z',
                'Forearm Extensors'
              )}
              {renderMusclePath(
                'muscle-forearms-back-right',
                'forearms_back',
                'M138 92 L144 122 L135 120 L128 92 Z',
                'Forearm Extensors'
              )}

              {/* Hands */}
              <ellipse cx="54" cy="129" rx="5" ry="7" fill="#1e293b" />
              <ellipse cx="146" cy="129" rx="5" ry="7" fill="#1e293b" />

              {/* Latissimus Dorsi (Lats) */}
              {renderMusclePath(
                'muscle-lats-left',
                'lats',
                'M78 68 L74 105 L92 108 L90 74 Z',
                'Latissimus Dorsi (Lats)'
              )}
              {renderMusclePath(
                'muscle-lats-right',
                'lats',
                'M122 68 L126 105 L108 108 L110 74 Z',
                'Latissimus Dorsi (Lats)'
              )}

              {/* Lower Back / Erector Spinae */}
              {renderMusclePath(
                'muscle-lower-back',
                'lower_back',
                'M90 108 L88 126 L112 126 L110 108 Z',
                'Lower Back'
              )}

              {/* Glutes (Gluteus Maximus) */}
              {renderMusclePath(
                'muscle-glutes-left',
                'glutes',
                'M80 126 L73 155 L98 155 L98 126 Z',
                'Gluteus Maximus'
              )}
              {renderMusclePath(
                'muscle-glutes-right',
                'glutes',
                'M120 126 L127 155 L102 155 L102 126 Z',
                'Gluteus Maximus'
              )}

              {/* Hamstrings (Back of Thighs) */}
              {renderMusclePath(
                'muscle-hamstrings-left',
                'hamstrings',
                'M74 157 L72 198 L92 198 L98 157 Z',
                'Hamstrings'
              )}
              {renderMusclePath(
                'muscle-hamstrings-right',
                'hamstrings',
                'M126 157 L128 198 L108 198 L102 157 Z',
                'Hamstrings'
              )}

              {/* Knees Back */}
              <circle cx="80" cy="204" r="5" fill="#1e293b" stroke="#334155" />
              <circle cx="120" cy="204" r="5" fill="#1e293b" stroke="#334155" />

              {/* Calves (Gastrocnemius & Soleus) */}
              {renderMusclePath(
                'muscle-calves-back-left',
                'calves_back',
                'M74 210 L70 264 L86 264 L88 210 Z',
                'Calves'
              )}
              {renderMusclePath(
                'muscle-calves-back-right',
                'calves_back',
                'M126 210 L130 264 L114 264 L112 210 Z',
                'Calves'
              )}

              {/* Feet Back */}
              <path d="M70 268 L84 268 L86 284 L68 284 Z" fill="#1e293b" />
              <path d="M130 268 L116 268 L114 284 L132 284 Z" fill="#1e293b" />
            </g>
          )}
        </svg>

        {hoveredMuscle && (
          <div className="absolute top-2 left-1/2 -translate-x-1/2 bg-slate-900 text-white text-[10px] font-bold px-2 py-0.5 rounded-full border border-slate-700 shadow-md whitespace-nowrap">
            {hoveredMuscle}
          </div>
        )}
      </div>

      {/* Accessible Text Legend (Not relying on color alone!) */}
      {showLegend && (
        <div className="w-full mt-3 p-3 bg-slate-900/80 dark:bg-slate-950/80 border border-slate-800 rounded-xl space-y-1.5 text-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-orange-500 border border-orange-300 shrink-0" />
              <span className="font-bold text-slate-100">Primary Target</span>
            </div>
            <span className="text-orange-400 font-semibold truncate max-w-[160px] text-right">
              {primaryList.length > 0 ? primaryList.join(', ') : 'None'}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="w-3.5 h-3.5 rounded-full bg-sky-400 border border-sky-200 shrink-0" />
              <span className="font-semibold text-slate-300">Secondary Assist</span>
            </div>
            <span className="text-sky-300 font-medium truncate max-w-[160px] text-right">
              {secondaryList.length > 0 ? secondaryList.join(', ') : 'None'}
            </span>
          </div>

          <div className="flex items-center justify-between text-slate-400 text-[11px] pt-1 border-t border-slate-800">
            <div className="flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-slate-700 shrink-0" />
              <span>Neutral / Stabilizer</span>
            </div>
            <span className="italic">Passive stabilization</span>
          </div>
        </div>
      )}
    </div>
  );
};
