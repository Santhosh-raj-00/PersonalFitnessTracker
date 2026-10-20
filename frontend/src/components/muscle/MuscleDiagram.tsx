import React, { useState, useEffect, useMemo } from 'react';

export type MuscleRole = 'primary' | 'secondary' | 'neutral';

export interface MuscleDiagramProps {
  primary?: string[] | string;
  secondary?: string[] | string;
  primaryMuscles?: string[] | string;
  secondaryMuscles?: string[] | string;
  view?: 'front' | 'back';
  chestRegion?: 'Upper' | 'Mid' | 'Lower' | 'Inner' | string;
  className?: string;
  showLegend?: boolean;
  interactive?: boolean;
  onMuscleClick?: (muscleName: string, role: MuscleRole) => void;
}

// Controlled mapping of internal muscle path groups to normalized muscle keys
const MUSCLE_KEY_MAP: Record<string, string[]> = {
  // Chest and regions
  CHEST: ['chest_upper', 'chest_mid', 'chest_lower'],
  'UPPER CHEST': ['chest_upper'],
  'MID CHEST': ['chest_mid'],
  'LOWER CHEST': ['chest_lower'],
  PECTORALS: ['chest_upper', 'chest_mid', 'chest_lower'],
  PECTORALIS: ['chest_upper', 'chest_mid', 'chest_lower'],

  // Back & Lats
  BACK: ['lats', 'upper_back', 'lower_back', 'traps'],
  LATS: ['lats'],
  LATISSIMUS: ['lats'],
  LATISSIMUS_DORSI: ['lats'],
  'UPPER BACK': ['upper_back', 'traps'],
  'LOWER BACK': ['lower_back'],
  LOWER_BACK: ['lower_back'],
  UPPER_BACK: ['upper_back'],
  ERECTORS: ['lower_back'],
  RHOMBOIDS: ['upper_back'],

  // Shoulders & Deltoids
  SHOULDERS: ['deltoids_front', 'deltoids_lateral', 'deltoids_rear'],
  DELTOIDS: ['deltoids_front', 'deltoids_lateral', 'deltoids_rear'],
  'FRONT DELTS': ['deltoids_front'],
  'SIDE DELTS': ['deltoids_lateral'],
  'LATERAL DELTS': ['deltoids_lateral'],
  'REAR DELTS': ['deltoids_rear'],
  ANTERIOR_DELTOID: ['deltoids_front'],
  LATERAL_DELTOID: ['deltoids_lateral'],
  POSTERIOR_DELTOID: ['deltoids_rear'],

  // Traps
  TRAPS: ['traps'],
  TRAPEZIUS: ['traps'],

  // Arms
  BICEPS: ['biceps'],
  BRACHIALIS: ['biceps'],
  TRICEPS: ['triceps'],
  FOREARMS: ['forearms'],
  WRISTS: ['forearms'],

  // Core & Abs
  ABS: ['abs_upper', 'abs_lower', 'obliques'],
  ABDOMINALS: ['abs_upper', 'abs_lower'],
  'UPPER ABS': ['abs_upper'],
  'LOWER ABS': ['abs_lower'],
  CORE: ['abs_upper', 'abs_lower', 'obliques'],
  OBLIQUES: ['obliques'],

  // Lower Body
  GLUTES: ['glutes'],
  GLUTEUS: ['glutes'],
  LEGS: ['quads', 'hamstrings', 'calves', 'glutes', 'adductors', 'abductors'],
  QUADS: ['quads'],
  QUADRICEPS: ['quads'],
  HAMSTRINGS: ['hamstrings'],
  CALVES: ['calves'],
  GASTROCNEMIUS: ['calves'],
  SOLEUS: ['calves'],
  ADDUCTORS: ['adductors'],
  ABDUCTORS: ['abductors'],
  'INNER THIGHS': ['adductors'],
  'OUTER HIPS': ['abductors'],

  // Cardio / Compounds
  CARDIO: ['abs_upper', 'abs_lower', 'quads', 'hamstrings', 'calves'],
  FULL_BODY: ['chest_mid', 'lats', 'deltoids_front', 'quads', 'hamstrings', 'abs_upper'],
};

// Posterior-dominant muscle groups for automatic back-view detection
const POSTERIOR_DOMINANT = new Set([
  'BACK',
  'LATS',
  'HAMSTRINGS',
  'GLUTES',
  'TRAPS',
  'LOWER_BACK',
  'UPPER_BACK',
  'TRICEPS',
  'REAR_DELTS',
  'POSTERIOR_DELTOID',
  'ERECTORS',
  'RHOMBOIDS',
]);

// Friendly display metadata for muscle groups
const MUSCLE_DETAILS: Record<string, { label: string; view: 'front' | 'back' | 'both'; description: string }> = {
  chest_upper: { label: 'Upper Chest (Clavicular)', view: 'front', description: 'Incline pressing and clavicular pectoral development.' },
  chest_mid: { label: 'Mid Chest (Sternal)', view: 'front', description: 'Horizontal pressing and central pectoral thickness.' },
  chest_lower: { label: 'Lower Chest (Costal)', view: 'front', description: 'Decline pressing, dips, and lower chest sweep.' },
  deltoids_front: { label: 'Front Deltoid (Anterior)', view: 'front', description: 'Overhead pressing and forward shoulder flexion.' },
  deltoids_lateral: { label: 'Side Deltoid (Lateral)', view: 'both', description: 'Lateral raises and shoulder capping width.' },
  deltoids_rear: { label: 'Rear Deltoid (Posterior)', view: 'back', description: 'Face pulls, reverse flyes, and upper back posture.' },
  biceps: { label: 'Biceps Brachii', view: 'front', description: 'Elbow flexion and forearm supination.' },
  triceps: { label: 'Triceps Brachii', view: 'back', description: 'Elbow extension and lockout pressing power.' },
  forearms: { label: 'Forearms & Grip', view: 'both', description: 'Wrist flexion, extension, and crushing grip strength.' },
  abs_upper: { label: 'Upper Abdominals', view: 'front', description: 'Thoracic spine flexion and core stability.' },
  abs_lower: { label: 'Lower Abdominals', view: 'front', description: 'Pelvic posterior tilt and anti-extension bracing.' },
  obliques: { label: 'External Obliques', view: 'front', description: 'Rotational power and lateral core bracing.' },
  traps: { label: 'Trapezius (Upper/Mid)', view: 'back', description: 'Scapular elevation, retraction, and neck support.' },
  upper_back: { label: 'Upper Back & Rhomboids', view: 'back', description: 'Scapular retraction, pulling posture, and spinal stability.' },
  lats: { label: 'Latissimus Dorsi', view: 'back', description: 'Vertical and horizontal pulling power; V-taper.' },
  lower_back: { label: 'Lower Back (Erectors)', view: 'back', description: 'Spinal extension, hip hinge bracing, and anti-flexion.' },
  glutes: { label: 'Gluteus Maximus & Medius', view: 'back', description: 'Hip extension, abduction, and explosive propulsion.' },
  quads: { label: 'Quadriceps Femoris', view: 'front', description: 'Knee extension and squatting drive.' },
  hamstrings: { label: 'Hamstrings', view: 'back', description: 'Knee flexion, hip hinge power, and deceleration.' },
  calves: { label: 'Calves (Gastrocnemius)', view: 'both', description: 'Plantarflexion, ankle stability, and jumping.' },
  adductors: { label: 'Adductors (Inner Thighs)', view: 'front', description: 'Hip adduction and pelvic stabilization during squats.' },
  abductors: { label: 'Abductors (Outer Hips)', view: 'both', description: 'Pelvic alignment and lateral leg stabilization.' },
};

export const MuscleDiagram: React.FC<MuscleDiagramProps> = ({
  primary,
  secondary,
  primaryMuscles,
  secondaryMuscles,
  view,
  chestRegion,
  className = '',
  showLegend = true,
  interactive = true,
  onMuscleClick,
}) => {
  // Normalize string array or comma-separated string
  const normalize = (input?: string[] | string): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) {
      return input.flatMap((i) =>
        i
          .toUpperCase()
          .split(',')
          .map((s) => s.trim().replace(/[_-]/g, ' '))
          .filter(Boolean)
      );
    }
    return input
      .toUpperCase()
      .split(',')
      .map((s) => s.trim().replace(/[_-]/g, ' '))
      .filter(Boolean);
  };

  const primaryList = useMemo(() => normalize(primary || primaryMuscles), [primary, primaryMuscles]);
  const secondaryList = useMemo(() => normalize(secondary || secondaryMuscles), [secondary, secondaryMuscles]);

  // Determine auto-view: auto-switch to 'back' if primary muscles are predominantly posterior
  const autoInitialView = useMemo<'front' | 'back'>(() => {
    if (view) return view;
    const hasPosterior = primaryList.some((m) => {
      const clean = m.replace(/\s+/g, '_');
      return (
        POSTERIOR_DOMINANT.has(clean) ||
        clean.includes('BACK') ||
        clean.includes('HAMSTRING') ||
        clean.includes('GLUTE') ||
        clean.includes('LAT') ||
        clean.includes('TRICEP')
      );
    });
    return hasPosterior ? 'back' : 'front';
  }, [view, primaryList]);

  const [currentView, setCurrentView] = useState<'front' | 'back'>(autoInitialView);
  const [hoveredMuscle, setHoveredMuscle] = useState<{ id: string; label: string; role: MuscleRole } | null>(null);

  // Sync when view prop or primary muscles change
  useEffect(() => {
    if (view) {
      setCurrentView(view);
    } else {
      setCurrentView(autoInitialView);
    }
  }, [view, autoInitialView]);

  // Determine activation role of an anatomical path group
  const getGroupRole = (group: string): MuscleRole => {
    // 1. Check chest region specificity if Chest is primary
    if (group.startsWith('chest_') && chestRegion && primaryList.some((p) => p.includes('CHEST'))) {
      const reg = chestRegion.toLowerCase();
      if (group === `chest_${reg}`) return 'primary';
      if (reg.includes('upper') && group === 'chest_upper') return 'primary';
      if (reg.includes('lower') && group === 'chest_lower') return 'primary';
      if (reg.includes('mid') && group === 'chest_mid') return 'primary';
      // Default to mid/sternal if generic
      if (group === 'chest_mid') return 'primary';
    }

    for (const [key, groups] of Object.entries(MUSCLE_KEY_MAP)) {
      if (groups.includes(group)) {
        const matchesKey = (list: string[]) =>
          list.some((item) => {
            const clean = item.replace(/\s+/g, '_');
            const keyClean = key.replace(/\s+/g, '_');
            return clean === keyClean || clean.includes(keyClean) || keyClean.includes(clean);
          });

        if (matchesKey(primaryList)) return 'primary';
        if (matchesKey(secondaryList)) return 'secondary';
      }
    }
    return 'neutral';
  };

  const handleInteraction = (groupId: string) => {
    if (!interactive) return;
    const role = getGroupRole(groupId);
    const meta = MUSCLE_DETAILS[groupId];
    const label = meta ? meta.label : groupId.replace('_', ' ');
    setHoveredMuscle({ id: groupId, label, role });
    if (onMuscleClick) {
      onMuscleClick(label, role);
    }
  };

  // Render an individual anatomical muscle SVG path with smooth curvature & dark holographic styling
  const renderMusclePath = (id: string, groupId: string, pathData: string) => {
    const role = getGroupRole(groupId);
    const isHovered = hoveredMuscle?.id === groupId;

    // Dark Holographic Color Palette
    let fill = '#050b18'; // Deep cosmic charcoal (inactive)
    let stroke = 'rgba(56, 189, 248, 0.35)'; // Thin glowing dim-blue outline
    let strokeWidth = '0.7';
    let filter = '';
    let classNameStr = 'transition-all duration-300 ';

    if (role === 'primary') {
      fill = '#f97316'; // Radiant primary amber/orange glow
      stroke = '#ffedd5'; // Crisp radiant rim
      strokeWidth = '1.0';
      filter = 'url(#holo-primary-glow)';
      classNameStr += 'holo-primary-pulse ';
    } else if (role === 'secondary') {
      fill = '#0284c7'; // Softer sky-cyan assist
      stroke = '#7dd3fc';
      strokeWidth = '0.8';
      filter = 'url(#holo-secondary-glow)';
    }

    if (isHovered) {
      stroke = '#ffffff';
      strokeWidth = '1.4';
      classNameStr += 'brightness-125 ';
    }

    const meta = MUSCLE_DETAILS[groupId];
    const label = meta ? meta.label : groupId;

    return (
      <path
        key={id}
        id={id}
        d={pathData}
        fill={fill}
        stroke={stroke}
        strokeWidth={strokeWidth}
        filter={filter}
        className={`${classNameStr} ${interactive ? 'cursor-pointer hover:opacity-95' : ''}`}
        onMouseEnter={() => handleInteraction(groupId)}
        onClick={() => handleInteraction(groupId)}
      >
        <title>{`${label} (${role === 'primary' ? 'Primary Target' : role === 'secondary' ? 'Secondary Assist' : 'Inactive'})`}</title>
      </path>
    );
  };

  // Compile active highlighted muscle chips for accessibility & legend
  const highlightedChips = useMemo(() => {
    const primaryChips: string[] = [];
    const secondaryChips: string[] = [];

    Object.keys(MUSCLE_DETAILS).forEach((groupId) => {
      const role = getGroupRole(groupId);
      const label = MUSCLE_DETAILS[groupId].label;
      if (role === 'primary' && !primaryChips.includes(label)) {
        primaryChips.push(label);
      } else if (role === 'secondary' && !secondaryChips.includes(label) && !primaryChips.includes(label)) {
        secondaryChips.push(label);
      }
    });

    return { primaryChips, secondaryChips };
  }, [primaryList, secondaryList, chestRegion]);

  const ariaDescription = `Anatomical muscle activation diagram: primary target ${
    primaryList.join(', ') || 'none'
  }, secondary assist ${secondaryList.join(', ') || 'none'}. Viewing ${currentView} view.`;

  return (
    <div className={`relative flex flex-col items-center select-none w-full ${className}`}>
      {/* Dark Holographic & Reduced-Motion Styles */}
      <style>{`
        @keyframes holo-primary-pulse {
          0%, 100% {
            filter: drop-shadow(0 0 4px rgba(249, 115, 22, 0.85)) drop-shadow(0 0 10px rgba(249, 115, 22, 0.5));
            opacity: 1;
          }
          50% {
            filter: drop-shadow(0 0 8px rgba(249, 115, 22, 1)) drop-shadow(0 0 16px rgba(251, 146, 60, 0.75));
            opacity: 0.94;
          }
        }
        @media (prefers-reduced-motion: reduce) {
          .holo-primary-pulse {
            animation: none !important;
          }
        }
      `}</style>

      {/* Top View Toggle Switch: Front (Anterior) / Back (Posterior) */}
      <div className="flex items-center gap-1.5 p-1 bg-slate-950/90 border border-slate-800 rounded-2xl mb-3 shadow-xl backdrop-blur-md">
        <button
          type="button"
          onClick={() => setCurrentView('front')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wide transition-all min-w-[80px] ${
            currentView === 'front'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          aria-label="View anterior front body diagram"
        >
          FRONT
        </button>
        <button
          type="button"
          onClick={() => setCurrentView('back')}
          className={`px-4 py-1.5 rounded-xl text-xs font-black tracking-wide transition-all min-w-[80px] ${
            currentView === 'back'
              ? 'bg-gradient-to-r from-orange-500 to-amber-500 text-slate-950 shadow-md shadow-orange-500/25'
              : 'text-slate-400 hover:text-white hover:bg-slate-900'
          }`}
          aria-label="View posterior back body diagram"
        >
          BACK
        </button>
      </div>

      {/* Main Holographic Anatomical Canvas */}
      <div className="relative w-full max-w-[280px] sm:max-w-[320px] aspect-[240/440] flex items-center justify-center p-3 rounded-3xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800 shadow-2xl overflow-hidden group">
        {/* Holographic Ambient Grid */}
        <div
          className="absolute inset-0 pointer-events-none opacity-15"
          style={{
            backgroundImage:
              'linear-gradient(to right, rgba(56, 189, 248, 0.2) 1px, transparent 1px), linear-gradient(to bottom, rgba(56, 189, 248, 0.2) 1px, transparent 1px)',
            backgroundSize: '16px 16px',
          }}
        />

        {/* Ambient Holographic Scanner Vignette */}
        <div className="absolute inset-0 bg-radial from-cyan-500/5 via-transparent to-transparent pointer-events-none" />

        <svg
          viewBox="0 0 240 440"
          className="w-full h-full drop-shadow-[0_0_15px_rgba(56,189,248,0.15)] transition-all duration-300"
          role="img"
          aria-label={ariaDescription}
        >
          <defs>
            {/* Holographic Glowing Glow Filters */}
            <filter id="holo-primary-glow" x="-50%" y="-50%" width="200%" height="200%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.5" result="blur1" />
              <feGaussianBlur in="SourceGraphic" stdDeviation="5.0" result="blur2" />
              <feMerge>
                <feMergeNode in="blur2" />
                <feMergeNode in="blur1" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            <filter id="holo-secondary-glow" x="-40%" y="-40%" width="180%" height="180%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="2.0" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>

            {/* Futuristic Ground Projection Disc */}
            <radialGradient id="holo-ground-glow" cx="50%" cy="50%" r="50%">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.35" />
              <stop offset="60%" stopColor="#0284c7" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#050b18" stopOpacity="0" />
            </radialGradient>
          </defs>

          {/* Futuristic Projection Platform Base */}
          <ellipse cx="120" cy="425" rx="75" ry="10" fill="url(#holo-ground-glow)" />
          <ellipse cx="120" cy="425" rx="65" ry="8" fill="none" stroke="rgba(56, 189, 248, 0.4)" strokeWidth="0.8" strokeDasharray="3 3" />
          <ellipse cx="120" cy="425" rx="45" ry="5" fill="none" stroke="rgba(249, 115, 22, 0.3)" strokeWidth="0.6" />

          {/* ========================================================================= */}
          {/* ANTERIOR (FRONT) BODY MODEL - Smooth Curved Anatomical Bezier Paths        */}
          {/* ========================================================================= */}
          {currentView === 'front' ? (
            <g id="anterior-anatomical-model">
              {/* Natural Head & Cranium */}
              <path
                id="front-head"
                d="M 120 14 C 132 14, 138 22, 138 34 C 138 46, 131 54, 120 56 C 109 54, 102 46, 102 34 C 102 22, 108 14, 120 14 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="0.8"
              />
              {/* Stylized Face Visor Contour */}
              <path d="M 113 32 Q 120 35 127 32" stroke="#38bdf8" strokeWidth="1" fill="none" strokeLinecap="round" opacity="0.6" />

              {/* Natural Neck (Sternocleidomastoid) */}
              <path
                id="front-neck"
                d="M 112 55 C 112 60, 110 66, 106 70 L 134 70 C 130 66, 128 60, 128 55 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="0.8"
              />

              {/* Trapezius (Superior / Front view) */}
              {renderMusclePath(
                'front-traps-left',
                'traps',
                'M 106 60 C 98 62, 88 66, 80 72 C 86 74, 94 74, 106 70 Z'
              )}
              {renderMusclePath(
                'front-traps-right',
                'traps',
                'M 134 60 C 142 62, 152 66, 160 72 C 154 74, 146 74, 134 70 Z'
              )}

              {/* Front Deltoids (Anterior Shoulder Cap) */}
              {renderMusclePath(
                'front-deltoid-left',
                'deltoids_front',
                'M 80 72 C 72 74, 62 82, 60 92 C 59 100, 64 106, 70 108 C 73 100, 76 90, 80 72 Z'
              )}
              {renderMusclePath(
                'front-deltoid-right',
                'deltoids_front',
                'M 160 72 C 168 74, 178 82, 180 92 C 181 100, 176 106, 170 108 C 167 100, 164 90, 160 72 Z'
              )}

              {/* Side / Lateral Deltoids (Front view outer sweep) */}
              {renderMusclePath(
                'front-lat-deltoid-left',
                'deltoids_lateral',
                'M 60 92 C 55 96, 54 104, 57 110 C 62 110, 68 108, 70 106 C 65 102, 61 98, 60 92 Z'
              )}
              {renderMusclePath(
                'front-lat-deltoid-right',
                'deltoids_lateral',
                'M 180 92 C 185 96, 186 104, 183 110 C 178 110, 172 108, 170 106 C 175 102, 179 98, 180 92 Z'
              )}

              {/* CHEST SUB-REGIONS (Pectoralis Major smooth curves) */}
              {/* Upper Chest (Clavicular Head) */}
              {renderMusclePath(
                'front-chest-upper-left',
                'chest_upper',
                'M 106 70 C 95 72, 85 75, 78 82 C 76 88, 78 94, 82 96 C 96 90, 108 86, 118 86 L 118 73 C 114 71, 110 70, 106 70 Z'
              )}
              {renderMusclePath(
                'front-chest-upper-right',
                'chest_upper',
                'M 134 70 C 145 72, 155 75, 162 82 C 164 88, 162 94, 158 96 C 144 90, 132 86, 122 86 L 122 73 C 126 71, 130 70, 134 70 Z'
              )}

              {/* Mid Chest (Sternal Head) */}
              {renderMusclePath(
                'front-chest-mid-left',
                'chest_mid',
                'M 118 87 C 106 87, 94 92, 82 97 C 84 106, 90 114, 100 116 C 108 116, 114 114, 118 112 Z'
              )}
              {renderMusclePath(
                'front-chest-mid-right',
                'chest_mid',
                'M 122 87 C 134 87, 146 92, 158 97 C 156 106, 150 114, 140 116 C 132 116, 126 114, 122 112 Z'
              )}

              {/* Lower Chest (Costal / Abdominal Head) */}
              {renderMusclePath(
                'front-chest-lower-left',
                'chest_lower',
                'M 118 113 C 112 115, 104 117, 98 117 C 90 116, 84 112, 82 108 C 84 118, 92 126, 104 126 C 112 126, 116 122, 118 118 Z'
              )}
              {renderMusclePath(
                'front-chest-lower-right',
                'chest_lower',
                'M 122 113 C 128 115, 136 117, 142 117 C 150 116, 156 112, 158 108 C 156 118, 148 126, 136 126 C 128 126, 124 122, 122 118 Z'
              )}

              {/* Biceps Brachii (Anterior Arm) */}
              {renderMusclePath(
                'front-biceps-left',
                'biceps',
                'M 70 108 C 66 116, 62 130, 64 142 C 66 148, 70 152, 74 150 C 78 142, 80 128, 76 116 C 74 112, 72 109, 70 108 Z'
              )}
              {renderMusclePath(
                'front-biceps-right',
                'biceps',
                'M 170 108 C 174 116, 178 130, 176 142 C 174 148, 170 152, 166 150 C 162 142, 160 128, 164 116 C 166 112, 168 109, 170 108 Z'
              )}

              {/* Forearms (Anterior Brachioradialis & Flexors) */}
              {renderMusclePath(
                'front-forearms-left',
                'forearms',
                'M 64 148 C 58 158, 52 176, 52 194 C 52 206, 56 214, 60 216 C 64 214, 68 200, 72 182 C 74 170, 74 156, 72 150 Z'
              )}
              {renderMusclePath(
                'front-forearms-right',
                'forearms',
                'M 176 148 C 182 158, 188 176, 188 194 C 188 206, 184 214, 180 216 C 176 214, 172 200, 168 182 C 166 170, 166 156, 168 150 Z'
              )}

              {/* Athletic Hands (Front) */}
              <path
                d="M 58 217 C 54 224, 52 235, 54 245 C 57 248, 62 245, 63 238 C 64 230, 63 222, 61 217 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="0.8"
              />
              <path
                d="M 182 217 C 186 224, 188 235, 186 245 C 183 248, 178 245, 177 238 C 176 230, 177 222, 179 217 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="0.8"
              />

              {/* Upper Rectus Abdominis (4-Pack) */}
              {renderMusclePath(
                'front-abs-upper-left',
                'abs_upper',
                'M 118 128 C 112 128, 106 130, 102 134 C 102 144, 104 150, 118 152 Z'
              )}
              {renderMusclePath(
                'front-abs-upper-right',
                'abs_upper',
                'M 122 128 C 128 128, 134 130, 138 134 C 138 144, 136 150, 122 152 Z'
              )}

              {/* Lower Rectus Abdominis (V-Taper) */}
              {renderMusclePath(
                'front-abs-lower-left',
                'abs_lower',
                'M 118 154 C 105 154, 104 164, 106 174 C 110 182, 116 186, 118 188 Z'
              )}
              {renderMusclePath(
                'front-abs-lower-right',
                'abs_lower',
                'M 122 154 C 135 154, 136 164, 134 174 C 130 182, 124 186, 122 188 Z'
              )}

              {/* External Obliques (Waist Flanks) */}
              {renderMusclePath(
                'front-obliques-left',
                'obliques',
                'M 98 128 C 90 134, 84 144, 84 160 C 84 172, 92 182, 102 186 C 100 174, 98 156, 100 136 Z'
              )}
              {renderMusclePath(
                'front-obliques-right',
                'obliques',
                'M 142 128 C 150 134, 156 144, 156 160 C 156 172, 148 182, 138 186 C 140 174, 142 156, 140 136 Z'
              )}

              {/* Abductors / Tensor Fasciae Latae (Outer Hip) */}
              {renderMusclePath(
                'front-abductor-left',
                'abductors',
                'M 84 180 C 78 190, 74 206, 76 224 C 80 224, 84 214, 86 196 C 86 188, 86 182, 84 180 Z'
              )}
              {renderMusclePath(
                'front-abductor-right',
                'abductors',
                'M 156 180 C 162 190, 166 206, 164 224 C 160 224, 156 214, 154 196 C 154 188, 154 182, 156 180 Z'
              )}

              {/* Quadriceps (Vastus Lateralis, Rectus Femoris, Vastus Medialis) */}
              {renderMusclePath(
                'front-quads-left',
                'quads',
                'M 88 196 C 82 216, 80 244, 86 268 C 90 282, 98 288, 104 286 C 108 274, 110 252, 106 230 C 104 212, 100 200, 92 196 Z'
              )}
              {renderMusclePath(
                'front-quads-right',
                'quads',
                'M 152 196 C 158 216, 160 244, 154 268 C 150 282, 142 288, 136 286 C 132 274, 130 252, 134 230 C 136 212, 140 200, 148 196 Z'
              )}

              {/* Adductors (Inner Thighs) */}
              {renderMusclePath(
                'front-adductors-left',
                'adductors',
                'M 112 196 C 114 208, 116 226, 116 248 C 114 256, 110 262, 108 266 C 108 252, 106 234, 104 216 Z'
              )}
              {renderMusclePath(
                'front-adductors-right',
                'adductors',
                'M 128 196 C 126 208, 124 226, 124 248 C 126 256, 130 262, 132 266 C 132 252, 134 234, 136 216 Z'
              )}

              {/* Patella / Knee Joint Caps */}
              <circle cx="103" cy="296" r="6" fill="#050b18" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="0.8" />
              <circle cx="137" cy="296" r="6" fill="#050b18" stroke="rgba(56, 189, 248, 0.35)" strokeWidth="0.8" />

              {/* Calves & Tibialis Anterior (Anterior Lower Leg) */}
              {renderMusclePath(
                'front-calves-left',
                'calves',
                'M 96 304 C 88 318, 86 342, 92 368 C 96 382, 100 392, 104 396 C 106 386, 108 362, 108 340 C 108 322, 104 310, 96 304 Z'
              )}
              {renderMusclePath(
                'front-calves-right',
                'calves',
                'M 144 304 C 152 318, 154 342, 148 368 C 144 382, 140 392, 136 396 C 134 386, 132 362, 132 340 C 132 322, 136 310, 144 304 Z'
              )}

              {/* Athletic Shoes / Feet (Front) */}
              <path
                d="M 98 398 C 94 406, 92 418, 94 424 C 98 426, 108 426, 110 422 C 110 416, 108 404, 104 398 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="0.8"
              />
              <path
                d="M 142 398 C 146 406, 148 418, 146 424 C 142 426, 132 426, 130 422 C 130 416, 132 404, 136 398 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="0.8"
              />
            </g>
          ) : (
            // =========================================================================
            // POSTERIOR (BACK) BODY MODEL - Smooth Curved Anatomical Bezier Paths
            // =========================================================================
            <g id="posterior-anatomical-model">
              {/* Head & Occipital Cranium */}
              <path
                id="back-head"
                d="M 120 14 C 132 14, 138 22, 138 34 C 138 46, 131 54, 120 56 C 109 54, 102 46, 102 34 C 102 22, 108 14, 120 14 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="0.8"
              />

              {/* Back of Neck */}
              <path
                id="back-neck"
                d="M 112 55 L 110 68 L 130 68 L 128 55 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="0.8"
              />

              {/* Trapezius (Diamond shaped upper, mid, lower back) */}
              {renderMusclePath(
                'back-traps-left',
                'traps',
                'M 120 58 C 114 62, 98 66, 82 72 C 92 78, 104 88, 118 108 L 120 134 L 120 58 Z'
              )}
              {renderMusclePath(
                'back-traps-right',
                'traps',
                'M 120 58 C 126 62, 142 66, 158 72 C 148 78, 136 88, 122 108 L 120 134 L 120 58 Z'
              )}

              {/* Rear Deltoids (Posterior Shoulder Cap) */}
              {renderMusclePath(
                'back-deltoid-left',
                'deltoids_rear',
                'M 82 72 C 74 76, 62 84, 60 96 C 60 106, 68 112, 74 110 C 76 98, 80 84, 82 72 Z'
              )}
              {renderMusclePath(
                'back-deltoid-right',
                'deltoids_rear',
                'M 158 72 C 166 76, 178 84, 180 96 C 180 106, 172 112, 166 110 C 164 98, 160 84, 158 72 Z'
              )}

              {/* Upper Back (Rhomboids, Infraspinatus & Teres Major) */}
              {renderMusclePath(
                'back-upperback-left',
                'upper_back',
                'M 118 108 C 104 90, 92 84, 78 88 C 76 96, 78 112, 86 122 C 96 128, 108 128, 118 126 Z'
              )}
              {renderMusclePath(
                'back-upperback-right',
                'upper_back',
                'M 122 108 C 136 90, 148 84, 162 88 C 164 96, 162 112, 154 122 C 144 128, 132 128, 122 126 Z'
              )}

              {/* Latissimus Dorsi (Lats V-Taper Wings) */}
              {renderMusclePath(
                'back-lats-left',
                'lats',
                'M 86 122 C 78 128, 76 142, 82 158 C 88 168, 96 174, 106 178 C 108 166, 110 150, 118 132 C 106 130, 94 128, 86 122 Z'
              )}
              {renderMusclePath(
                'back-lats-right',
                'lats',
                'M 154 122 C 162 128, 164 142, 158 158 C 152 168, 144 174, 134 178 C 132 166, 130 150, 122 132 C 134 130, 146 128, 154 122 Z'
              )}

              {/* Triceps Brachii (Posterior Arms) */}
              {renderMusclePath(
                'back-triceps-left',
                'triceps',
                'M 72 110 C 66 118, 62 134, 64 148 C 66 154, 72 156, 76 152 C 78 142, 78 126, 74 112 Z'
              )}
              {renderMusclePath(
                'back-triceps-right',
                'triceps',
                'M 168 110 C 174 118, 178 134, 176 148 C 174 154, 168 156, 164 152 C 162 142, 162 126, 166 112 Z'
              )}

              {/* Forearms (Posterior Extensors) */}
              {renderMusclePath(
                'back-forearms-left',
                'forearms',
                'M 64 150 C 58 160, 52 178, 52 196 C 52 208, 56 216, 60 216 C 64 214, 68 200, 72 182 C 74 170, 74 156, 70 150 Z'
              )}
              {renderMusclePath(
                'back-forearms-right',
                'forearms',
                'M 176 150 C 182 160, 188 178, 188 196 C 188 208, 184 216, 180 216 C 176 214, 172 200, 168 182 C 166 170, 166 156, 170 150 Z'
              )}

              {/* Athletic Hands (Back) */}
              <path
                d="M 58 217 C 54 224, 52 235, 54 245 C 57 248, 62 245, 63 238 C 64 230, 63 222, 61 217 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="0.8"
              />
              <path
                d="M 182 217 C 186 224, 188 235, 186 245 C 183 248, 178 245, 177 238 C 176 230, 177 222, 179 217 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.35)"
                strokeWidth="0.8"
              />

              {/* Lower Back (Erector Spinae & Thoracolumbar Fascia) */}
              {renderMusclePath(
                'back-erectors-left',
                'lower_back',
                'M 118 136 C 110 148, 106 166, 106 182 C 112 186, 116 188, 118 190 Z'
              )}
              {renderMusclePath(
                'back-erectors-right',
                'lower_back',
                'M 122 136 C 130 148, 134 166, 134 182 C 128 186, 124 188, 122 190 Z'
              )}

              {/* Gluteus Maximus & Medius */}
              {renderMusclePath(
                'back-glutes-left',
                'glutes',
                'M 118 190 C 104 186, 88 194, 82 210 C 78 226, 84 242, 98 248 C 108 248, 114 238, 118 222 Z'
              )}
              {renderMusclePath(
                'back-glutes-right',
                'glutes',
                'M 122 190 C 136 186, 152 194, 158 210 C 162 226, 156 242, 142 248 C 132 248, 126 238, 122 222 Z'
              )}

              {/* Hamstrings (Biceps Femoris & Semitendinosus) */}
              {renderMusclePath(
                'back-hamstrings-left',
                'hamstrings',
                'M 98 248 C 88 260, 84 282, 88 304 C 92 314, 98 316, 104 316 C 110 306, 112 284, 114 260 C 114 246, 108 248, 98 248 Z'
              )}
              {renderMusclePath(
                'back-hamstrings-right',
                'hamstrings',
                'M 142 248 C 152 260, 156 282, 152 304 C 148 314, 142 316, 136 316 C 130 306, 128 284, 126 260 C 126 246, 132 248, 142 248 Z'
              )}

              {/* Calves (Posterior Gastrocnemius & Achilles Tendon) */}
              {renderMusclePath(
                'back-calves-left',
                'calves',
                'M 96 320 C 86 332, 84 354, 90 376 C 94 388, 98 396, 102 398 C 104 388, 108 368, 108 348 C 108 332, 104 322, 96 320 Z'
              )}
              {renderMusclePath(
                'back-calves-right',
                'calves',
                'M 144 320 C 154 332, 156 354, 150 376 C 146 388, 142 396, 138 398 C 136 388, 132 368, 132 348 C 132 332, 136 322, 144 320 Z'
              )}

              {/* Heels & Achilles Base (Back) */}
              <path
                d="M 98 398 C 96 406, 96 418, 98 424 C 102 426, 108 426, 110 422 C 110 416, 106 404, 102 398 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="0.8"
              />
              <path
                d="M 142 398 C 144 406, 144 418, 142 424 C 138 426, 132 426, 130 422 C 130 416, 134 404, 138 398 Z"
                fill="#050b18"
                stroke="rgba(56, 189, 248, 0.4)"
                strokeWidth="0.8"
              />
            </g>
          )}
        </svg>

        {/* Hover / Click Interactive Inspection HUD Tooltip */}
        {hoveredMuscle && (
          <div className="absolute bottom-3 inset-x-3 p-2.5 rounded-xl bg-slate-950/95 border border-cyan-500/40 backdrop-blur-md shadow-2xl flex items-center justify-between gap-2 animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-none">
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-black text-white truncate">{hoveredMuscle.label}</span>
                <span
                  className={`text-[9px] font-black px-1.5 py-0.5 rounded uppercase tracking-wider ${
                    hoveredMuscle.role === 'primary'
                      ? 'bg-orange-500/20 text-orange-400 border border-orange-500/40'
                      : hoveredMuscle.role === 'secondary'
                      ? 'bg-sky-500/20 text-sky-400 border border-sky-500/40'
                      : 'bg-slate-800 text-slate-400 border border-slate-700'
                  }`}
                >
                  {hoveredMuscle.role === 'primary' ? 'Primary' : hoveredMuscle.role === 'secondary' ? 'Secondary' : 'Inactive'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 truncate mt-0.5">
                {MUSCLE_DETAILS[hoveredMuscle.id]?.description || 'Biomechanical target group.'}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Muscle Text Chips & Legend (Guarantees understanding without relying on color alone) */}
      {showLegend && (
        <div className="w-full mt-3 space-y-2">
          {/* Legend Color Keys */}
          <div className="flex items-center justify-center gap-4 text-[11px] font-semibold text-slate-400">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-sm shadow-orange-500/50 animate-pulse" />
              <span className="text-white font-bold">Primary Target</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-sky-500 shadow-sm shadow-sky-500/50" />
              <span className="text-slate-300">Secondary Assist</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
              <span className="text-slate-500">Neutral</span>
            </div>
          </div>

          {/* Named Text Chips */}
          {(highlightedChips.primaryChips.length > 0 || highlightedChips.secondaryChips.length > 0) && (
            <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1">
              {highlightedChips.primaryChips.map((name) => (
                <span
                  key={name}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase tracking-wider bg-orange-500/15 text-orange-400 border border-orange-500/40 shadow-sm shadow-orange-500/10"
                >
                  ★ {name}
                </span>
              ))}
              {highlightedChips.secondaryChips.map((name) => (
                <span
                  key={name}
                  className="px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider bg-sky-500/15 text-sky-400 border border-sky-500/30"
                >
                  + {name}
                </span>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
