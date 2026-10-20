import React, { useEffect, useRef, useState, useMemo, useCallback } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import {
  MOVEMENT_PATTERNS,
  DEFAULT_PATTERN,
} from './animationPatterns';
import type {
  JointStateSide,
  JointStateFront,
  MovementPatternDef,
} from './animationPatterns';

export interface ExerciseAnimationProps {
  pattern?: string;
  params?: string | Record<string, unknown>;
  equipment?: string;
  primaryMuscles?: string[] | string;
  secondaryMuscles?: string[] | string;
  primaryMuscle?: string;
  className?: string;
  showControls?: boolean;
}

// Linear interpolation between two coordinates
function lerpCoord(a: [number, number], b: [number, number], t: number): [number, number] {
  return [a[0] + (b[0] - a[0]) * t, a[1] + (b[1] - a[1]) * t];
}

// Smooth keyframe interpolation with sinusoidal easing
function interpolateSide(
  start: JointStateSide,
  mid: JointStateSide,
  peak: JointStateSide,
  progress: number
): JointStateSide {
  let p1: JointStateSide;
  let p2: JointStateSide;
  let subT: number;

  if (progress <= 0.5) {
    p1 = start;
    p2 = mid;
    subT = progress * 2;
  } else {
    p1 = mid;
    p2 = peak;
    subT = (progress - 0.5) * 2;
  }

  return {
    head: lerpCoord(p1.head, p2.head, subT),
    shoulder: lerpCoord(p1.shoulder, p2.shoulder, subT),
    elbow: lerpCoord(p1.elbow, p2.elbow, subT),
    wrist: lerpCoord(p1.wrist, p2.wrist, subT),
    hip: lerpCoord(p1.hip, p2.hip, subT),
    knee: lerpCoord(p1.knee, p2.knee, subT),
    ankle: lerpCoord(p1.ankle, p2.ankle, subT),
    toe: p1.toe && p2.toe ? lerpCoord(p1.toe, p2.toe, subT) : undefined,
    prop: p1.prop && p2.prop ? lerpCoord(p1.prop, p2.prop, subT) : undefined,
  };
}

function interpolateFront(
  start: JointStateFront,
  mid: JointStateFront,
  peak: JointStateFront,
  progress: number
): JointStateFront {
  let p1: JointStateFront;
  let p2: JointStateFront;
  let subT: number;

  if (progress <= 0.5) {
    p1 = start;
    p2 = mid;
    subT = progress * 2;
  } else {
    p1 = mid;
    p2 = peak;
    subT = (progress - 0.5) * 2;
  }

  return {
    head: lerpCoord(p1.head, p2.head, subT),
    leftShoulder: lerpCoord(p1.leftShoulder, p2.leftShoulder, subT),
    rightShoulder: lerpCoord(p1.rightShoulder, p2.rightShoulder, subT),
    leftElbow: lerpCoord(p1.leftElbow, p2.leftElbow, subT),
    rightElbow: lerpCoord(p1.rightElbow, p2.rightElbow, subT),
    leftWrist: lerpCoord(p1.leftWrist, p2.leftWrist, subT),
    rightWrist: lerpCoord(p1.rightWrist, p2.rightWrist, subT),
    pelvis: lerpCoord(p1.pelvis, p2.pelvis, subT),
    leftHip: lerpCoord(p1.leftHip, p2.leftHip, subT),
    rightHip: lerpCoord(p1.rightHip, p2.rightHip, subT),
    leftKnee: lerpCoord(p1.leftKnee, p2.leftKnee, subT),
    rightKnee: lerpCoord(p1.rightKnee, p2.rightKnee, subT),
    leftAnkle: lerpCoord(p1.leftAnkle, p2.leftAnkle, subT),
    rightAnkle: lerpCoord(p1.rightAnkle, p2.rightAnkle, subT),
    propLeft: p1.propLeft && p2.propLeft ? lerpCoord(p1.propLeft, p2.propLeft, subT) : undefined,
    propRight: p1.propRight && p2.propRight ? lerpCoord(p1.propRight, p2.propRight, subT) : undefined,
  };
}

type AnatomicalMuscleKey = 
  | 'chest' 
  | 'shoulders' 
  | 'biceps' 
  | 'triceps' 
  | 'forearms' 
  | 'back' 
  | 'traps' 
  | 'abs' 
  | 'quads' 
  | 'hamstrings' 
  | 'glutes' 
  | 'calves';

function extractMuscleTokens(input?: string[] | string): string[] {
  if (!input) return [];
  if (Array.isArray(input)) {
    return input.map(m => m.toUpperCase().trim()).filter(Boolean);
  }
  return input
    .toUpperCase()
    .split(/[,;/+&]+/)
    .map(s => s.trim())
    .filter(Boolean);
}

export const ExerciseAnimation: React.FC<ExerciseAnimationProps> = ({
  pattern,
  params: _params,
  equipment,
  primaryMuscles,
  secondaryMuscles,
  primaryMuscle,
  className = '',
  showControls = true,
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [speed, setSpeed] = useState<number>(1.0);
  const [progress, setProgress] = useState<number>(0);
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const animFrameId = useRef<number | null>(null);
  const startTimeRef = useRef<number | null>(null);
  const pausedTimeOffsetRef = useRef<number>(0);

  // Normalize working muscles for anatomical highlighting
  const primaryTokens = useMemo(() => {
    const list = extractMuscleTokens(primaryMuscles);
    if (list.length === 0 && primaryMuscle) {
      list.push(primaryMuscle.toUpperCase().trim());
    }
    return list;
  }, [primaryMuscles, primaryMuscle]);

  const secondaryTokens = useMemo(() => {
    return extractMuscleTokens(secondaryMuscles);
  }, [secondaryMuscles]);

  const getMuscleStatus = useCallback(
    (key: AnatomicalMuscleKey): 'primary' | 'secondary' | 'neutral' => {
      const matchKey = (tokens: string[]) => {
        return tokens.some(t => {
          if (key === 'chest') return t.includes('CHEST') || t.includes('PEC');
          if (key === 'shoulders') return t.includes('SHOULDER') || t.includes('DELT');
          if (key === 'biceps') return t.includes('BICEP');
          if (key === 'triceps') return t.includes('TRICEP');
          if (key === 'forearms') return t.includes('FOREARM') || t.includes('WRIST');
          if (key === 'back') return t.includes('BACK') || t.includes('LAT') || t.includes('RHOMBOID');
          if (key === 'traps') return t.includes('TRAP');
          if (key === 'abs') return t.includes('AB') || t.includes('CORE') || t.includes('OBLIQUE');
          if (key === 'quads') return t.includes('QUAD');
          if (key === 'hamstrings') return t.includes('HAMSTRING');
          if (key === 'glutes') return t.includes('GLUTE') || t.includes('HIP');
          if (key === 'calves') return t.includes('CALF') || t.includes('CALVES');
          return false;
        });
      };

      if (matchKey(primaryTokens)) return 'primary';
      if (matchKey(secondaryTokens)) return 'secondary';
      return 'neutral';
    },
    [primaryTokens, secondaryTokens]
  );

  const getMuscleStyle = useCallback(
    (key: AnatomicalMuscleKey) => {
      const status = getMuscleStatus(key);
      if (status === 'primary') {
        return {
          fill: 'url(#redPrimaryMuscleGrad)',
          stroke: '#ef4444',
          strokeWidth: 1.5,
          striation: '#fca5a5',
          isHighlighted: true,
          glow: true,
        };
      }
      if (status === 'secondary') {
        return {
          fill: 'url(#orangeSecondaryMuscleGrad)',
          stroke: '#fb923c',
          strokeWidth: 1.2,
          striation: '#fed7aa',
          isHighlighted: true,
          glow: false,
        };
      }
      return {
        fill: 'url(#neutralAnatomicalGrad)',
        stroke: '#475569',
        strokeWidth: 1,
        striation: '#334155',
        isHighlighted: false,
        glow: false,
      };
    },
    [getMuscleStatus]
  );

  const patternDef: MovementPatternDef = useMemo(() => {
    if (!pattern) return DEFAULT_PATTERN;
    const cleanPattern = pattern.toLowerCase().trim();
    if (MOVEMENT_PATTERNS[cleanPattern]) {
      return MOVEMENT_PATTERNS[cleanPattern];
    }
    return DEFAULT_PATTERN;
  }, [pattern]);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (mediaQuery.matches) {
      setIsPlaying(false);
      setProgress(0.5);
    }
    const handleChange = (e: MediaQueryListEvent) => {
      if (e.matches) {
        setIsPlaying(false);
        setProgress(0.5);
      }
    };
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.1 }
    );
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  const durationMs = useMemo(() => {
    return (patternDef.tempo / speed) * 1000;
  }, [patternDef.tempo, speed]);

  const animate = useCallback(
    (timestamp: number) => {
      if (!startTimeRef.current) {
        startTimeRef.current = timestamp - pausedTimeOffsetRef.current;
      }
      const elapsed = timestamp - startTimeRef.current;
      const cycleProgress = (elapsed % durationMs) / durationMs;
      const linearPhase = cycleProgress <= 0.5 ? cycleProgress * 2 : (1 - cycleProgress) * 2;
      const eased = (1 - Math.cos(linearPhase * Math.PI)) / 2;
      setProgress(eased);

      if (isPlaying && isVisible) {
        animFrameId.current = requestAnimationFrame(animate);
      }
    },
    [durationMs, isPlaying, isVisible]
  );

  useEffect(() => {
    if (isPlaying && isVisible) {
      animFrameId.current = requestAnimationFrame(animate);
    } else {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
        animFrameId.current = null;
      }
      startTimeRef.current = null;
    }
    return () => {
      if (animFrameId.current) {
        cancelAnimationFrame(animFrameId.current);
      }
    };
  }, [isPlaying, isVisible, animate]);

  const togglePlay = () => setIsPlaying(prev => !prev);
  const toggleSpeed = () => setSpeed(prev => (prev === 1.0 ? 0.5 : 1.0));
  const resetPose = () => {
    setProgress(0);
    startTimeRef.current = null;
    pausedTimeOffsetRef.current = 0;
  };

  const currentSide = useMemo(() => {
    if (!patternDef.sidePoses) return null;
    return interpolateSide(
      patternDef.sidePoses.start,
      patternDef.sidePoses.mid,
      patternDef.sidePoses.peak,
      progress
    );
  }, [patternDef.sidePoses, progress]);

  const currentFront = useMemo(() => {
    if (!patternDef.frontPoses) return null;
    return interpolateFront(
      patternDef.frontPoses.start,
      patternDef.frontPoses.mid,
      patternDef.frontPoses.peak,
      progress
    );
  }, [patternDef.frontPoses, progress]);

  const activeProp = useMemo(() => {
    if (equipment) {
      const eq = equipment.toUpperCase();
      if (eq.includes('BARBELL') || eq.includes('EZ_BAR')) return 'barbell';
      if (eq.includes('DUMBBELL')) return 'dumbbell';
      if (eq.includes('KETTLEBELL')) return 'kettlebell';
      if (eq.includes('CABLE')) return 'cable';
      if (eq.includes('MACHINE') || eq.includes('SMITH')) return 'machine';
      if (eq.includes('BODYWEIGHT')) return 'bodyweight';
      if (eq.includes('BAND')) return 'band';
    }
    return patternDef.propType;
  }, [equipment, patternDef.propType]);

  const isLoopingActive = isPlaying && isVisible;

  const chestStyle = getMuscleStyle('chest');
  const shoulderStyle = getMuscleStyle('shoulders');
  const bicepStyle = getMuscleStyle('biceps');
  const tricepStyle = getMuscleStyle('triceps');
  const forearmStyle = getMuscleStyle('forearms');
  const backStyle = getMuscleStyle('back');
  const absStyle = getMuscleStyle('abs');
  const quadStyle = getMuscleStyle('quads');
  const hamstringStyle = getMuscleStyle('hamstrings');
  const gluteStyle = getMuscleStyle('glutes');
  const calfStyle = getMuscleStyle('calves');

  return (
    <div
      ref={containerRef}
      className={`relative w-full aspect-4/3 rounded-2xl bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 border border-slate-800/90 shadow-2xl overflow-hidden select-none flex items-center justify-center ${className}`}
      style={{ aspectRatio: '4/3' }}
    >
      <svg
        viewBox="0 0 400 300"
        className="absolute inset-0 w-full h-full pointer-events-none"
        preserveAspectRatio="xMidYMid meet"
      >
        <defs>
          {/* PRIMARY WORKING MUSCLE: Crimson Red */}
          <linearGradient id="redPrimaryMuscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#ef4444" />
            <stop offset="60%" stopColor="#dc2626" />
            <stop offset="100%" stopColor="#991b1b" />
          </linearGradient>

          {/* SECONDARY WORKING MUSCLE: Terracotta Orange */}
          <linearGradient id="orangeSecondaryMuscleGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#fb923c" />
            <stop offset="60%" stopColor="#f97316" />
            <stop offset="100%" stopColor="#c2410c" />
          </linearGradient>

          {/* NEUTRAL ANATOMICAL MUSCLE: Realistic athletic slate shading */}
          <linearGradient id="neutralAnatomicalGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#64748b" />
            <stop offset="50%" stopColor="#475569" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          {/* SKIN & BONE / CARTILAGE ACCENTS */}
          <linearGradient id="skinBoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#f1f5f9" />
            <stop offset="60%" stopColor="#e2e8f0" />
            <stop offset="100%" stopColor="#cbd5e1" />
          </linearGradient>

          {/* ATHLETIC COMPRESSION SHORTS */}
          <linearGradient id="shortsGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#020617" />
          </linearGradient>

          {/* EQUIPMENT GRADIENTS */}
          <linearGradient id="metalBarGrad" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#f8fafc" />
            <stop offset="50%" stopColor="#94a3b8" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="weightPlateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="40%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#dc2626" />
          </linearGradient>

          <linearGradient id="benchPadGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="50%" stopColor="#334155" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>

          <filter id="primaryRedGlow" x="-30%" y="-30%" width="160%" height="160%">
            <feDropShadow dx="0" dy="0" stdDeviation="3.5" floodColor="#ef4444" floodOpacity="0.65" />
          </filter>
        </defs>

        {/* Floor Horizon Line */}
        <line x1="20" y1="262" x2="380" y2="262" stroke="#1e293b" strokeWidth="2" strokeDasharray="6 6" />
        <ellipse cx="200" cy="265" rx="140" ry="18" fill="#ef444408" opacity="0.6" />

        {/* 1. BENCH / APPARATUS PROPS */}
        {patternDef.benchType === 'flat' && (
          <g id="flatBenchProp">
            <rect x="90" y="180" width="165" height="12" rx="4" fill="url(#benchPadGrad)" stroke="#475569" strokeWidth="1.5" />
            <path d="M 110 192 L 105 260 M 235 192 L 240 260 M 100 260 L 120 260 M 230 260 L 250 260" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {patternDef.benchType === 'incline' && (
          <g id="inclineBenchProp">
            <rect x="110" y="130" width="135" height="12" rx="4" transform="rotate(-30 110 130)" fill="url(#benchPadGrad)" stroke="#475569" strokeWidth="1.5" />
            <rect x="200" y="200" width="50" height="10" rx="3" fill="#1e293b" stroke="#334155" strokeWidth="1.5" />
            <path d="M 140 205 L 140 260 M 225 210 L 225 260 M 130 260 L 235 260" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {patternDef.benchType === 'decline' && (
          <g id="declineBenchProp">
            <rect x="95" y="170" width="160" height="12" rx="4" transform="rotate(20 95 170)" fill="url(#benchPadGrad)" stroke="#475569" strokeWidth="1.5" />
            <circle cx="280" cy="155" r="9" fill="#dc2626" opacity="0.8" />
            <path d="M 120 200 L 120 260 M 245 225 L 245 260" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {patternDef.benchType === 'seated' && (
          <g id="seatedBenchProp">
            <rect x="135" y="140" width="10" height="75" rx="3" fill="url(#benchPadGrad)" stroke="#475569" strokeWidth="1.5" />
            <rect x="135" y="205" width="75" height="10" rx="3" fill="url(#benchPadGrad)" stroke="#475569" strokeWidth="1.5" />
            <path d="M 140 215 L 140 260 M 195 215 L 195 260" stroke="#334155" strokeWidth="4" strokeLinecap="round" />
          </g>
        )}

        {patternDef.propType === 'pull_up_bar' && (
          <g id="pullUpBarProp">
            <line x1="80" y1="28" x2="320" y2="28" stroke="url(#metalBarGrad)" strokeWidth="6" strokeLinecap="round" />
            <line x1="100" y1="28" x2="100" y2="0" stroke="#475569" strokeWidth="4" />
            <line x1="300" y1="28" x2="300" y2="0" stroke="#475569" strokeWidth="4" />
          </g>
        )}

        {patternDef.propType === 'dip_station' && (
          <g id="dipBarsProp">
            <line x1="140" y1="165" x2="230" y2="165" stroke="url(#metalBarGrad)" strokeWidth="6" strokeLinecap="round" />
            <line x1="150" y1="165" x2="150" y2="260" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
            <line x1="220" y1="165" x2="220" y2="260" stroke="#334155" strokeWidth="5" strokeLinecap="round" />
          </g>
        )}

        {/* 2. REALISTIC ANATOMICAL MANNEQUIN: SIDE PROFILE VIEW */}
        {currentSide && (
          <g id="anatomicalMannequinSide">
            {/* Foot / Athletic Shoe */}
            <path
              d={`M ${currentSide.ankle[0] - 10} ${currentSide.ankle[1]} L ${currentSide.ankle[0] + 6} ${currentSide.ankle[1]} L ${
                currentSide.toe ? currentSide.toe[0] : currentSide.ankle[0] + 24
              } ${currentSide.toe ? currentSide.toe[1] : currentSide.ankle[1] + 3} L ${
                currentSide.ankle[0] - 10
              } ${currentSide.ankle[1] + 8} Z`}
              fill="#0f172a"
              stroke="#475569"
              strokeWidth="1.5"
            />

            {/* CALVES: Gastrocnemius muscle belly */}
            <g id="sideCalf" filter={calfStyle.glow ? 'url(#primaryRedGlow)' : undefined}>
              <line
                x1={currentSide.knee[0]}
                y1={currentSide.knee[1]}
                x2={currentSide.ankle[0]}
                y2={currentSide.ankle[1]}
                stroke={calfStyle.fill}
                strokeWidth="16"
                strokeLinecap="round"
              />
              <line
                x1={(currentSide.knee[0] + currentSide.ankle[0]) / 2 - 3}
                y1={(currentSide.knee[1] + currentSide.ankle[1]) / 2 - 8}
                x2={(currentSide.knee[0] + currentSide.ankle[0]) / 2 + 3}
                y2={(currentSide.knee[1] + currentSide.ankle[1]) / 2 + 8}
                stroke={calfStyle.striation}
                strokeWidth="1.5"
                opacity="0.8"
              />
            </g>

            {/* Patella / Knee Joint */}
            <circle cx={currentSide.knee[0]} cy={currentSide.knee[1]} r="7" fill="url(#skinBoneGrad)" stroke="#475569" strokeWidth="1.2" />

            {/* THIGH: Quadriceps & Hamstrings */}
            <g id="sideThigh" filter={(quadStyle.glow || hamstringStyle.glow) ? 'url(#primaryRedGlow)' : undefined}>
              <line
                x1={currentSide.hip[0]}
                y1={currentSide.hip[1]}
                x2={currentSide.knee[0]}
                y2={currentSide.knee[1]}
                stroke={quadStyle.isHighlighted ? quadStyle.fill : (hamstringStyle.isHighlighted ? hamstringStyle.fill : 'url(#neutralAnatomicalGrad)')}
                strokeWidth="22"
                strokeLinecap="round"
              />
              <line
                x1={currentSide.hip[0]}
                y1={currentSide.hip[1]}
                x2={currentSide.knee[0]}
                y2={currentSide.knee[1]}
                stroke={quadStyle.isHighlighted ? quadStyle.striation : '#1e293b'}
                strokeWidth="2"
                strokeDasharray="8 4"
                opacity="0.8"
              />
            </g>

            {/* GLUTES & COMPRESSION SHORTS */}
            <g id="sidePelvisGlutes" filter={gluteStyle.glow ? 'url(#primaryRedGlow)' : undefined}>
              <circle
                cx={currentSide.hip[0]}
                cy={currentSide.hip[1]}
                r="14"
                fill={gluteStyle.isHighlighted ? gluteStyle.fill : 'url(#shortsGrad)'}
                stroke={gluteStyle.isHighlighted ? gluteStyle.stroke : '#334155'}
                strokeWidth="1.5"
              />
            </g>

            {/* TORSO & WORKING CHEST / LATS / ABS */}
            <g id="sideTorso">
              <line
                x1={currentSide.hip[0]}
                y1={currentSide.hip[1]}
                x2={currentSide.shoulder[0]}
                y2={currentSide.shoulder[1]}
                stroke="url(#neutralAnatomicalGrad)"
                strokeWidth="26"
                strokeLinecap="round"
              />

              {/* LATS / UPPER BACK */}
              <line
                x1={currentSide.hip[0] - 6}
                y1={currentSide.hip[1] - 10}
                x2={currentSide.shoulder[0] - 5}
                y2={currentSide.shoulder[1] + 6}
                stroke={backStyle.fill}
                strokeWidth={backStyle.isHighlighted ? "13" : "7"}
                strokeLinecap="round"
                filter={backStyle.glow ? 'url(#primaryRedGlow)' : undefined}
                opacity={backStyle.isHighlighted ? 0.95 : 0.4}
              />

              {/* PECTORALIS MAJOR (Contoured Chest Muscle) */}
              <g id="sideChestPec" filter={chestStyle.glow ? 'url(#primaryRedGlow)' : undefined}>
                <path
                  d={`M ${currentSide.shoulder[0]} ${currentSide.shoulder[1] + 2} Q ${currentSide.shoulder[0] + 18} ${
                    currentSide.shoulder[1] + 14
                  } ${currentSide.shoulder[0] + 3} ${currentSide.shoulder[1] + 26} Z`}
                  fill={chestStyle.fill}
                  stroke={chestStyle.stroke}
                  strokeWidth={chestStyle.strokeWidth}
                />
                <path
                  d={`M ${currentSide.shoulder[0] + 2} ${currentSide.shoulder[1] + 7} Q ${currentSide.shoulder[0] + 13} ${
                    currentSide.shoulder[1] + 13
                  } ${currentSide.shoulder[0] + 5} ${currentSide.shoulder[1] + 20}`}
                  stroke={chestStyle.striation}
                  strokeWidth="1.5"
                  fill="none"
                  opacity="0.85"
                />
              </g>
            </g>

            {/* NECK (Sternocleidomastoid) */}
            <line
              x1={currentSide.shoulder[0]}
              y1={currentSide.shoulder[1]}
              x2={currentSide.head[0]}
              y2={currentSide.head[1]}
              stroke="url(#skinBoneGrad)"
              strokeWidth="12"
              strokeLinecap="round"
            />

            {/* REALISTIC HUMAN HEAD PROFILE */}
            <g id="sideHumanHead">
              {/* Cranium and Face Silhouette */}
              <path
                d={`M ${currentSide.head[0] - 12} ${currentSide.head[1] + 5} Q ${currentSide.head[0] - 14} ${
                  currentSide.head[1] - 15
                } ${currentSide.head[0]} ${currentSide.head[1] - 16} Q ${currentSide.head[0] + 13} ${
                  currentSide.head[1] - 15
                } ${currentSide.head[0] + 13} ${currentSide.head[1] - 3} L ${currentSide.head[0] + 17} ${
                  currentSide.head[1] + 1
                } L ${currentSide.head[0] + 12} ${currentSide.head[1] + 6} L ${currentSide.head[0] + 14} ${
                  currentSide.head[1] + 10
                } L ${currentSide.head[0] + 8} ${currentSide.head[1] + 14} L ${currentSide.head[0] - 2} ${
                  currentSide.head[1] + 12
                } Z`}
                fill="url(#skinBoneGrad)"
                stroke="#475569"
                strokeWidth="1.2"
              />
              {/* Cropped Athletic Hair */}
              <path
                d={`M ${currentSide.head[0] - 13} ${currentSide.head[1] + 3} Q ${currentSide.head[0] - 14} ${
                  currentSide.head[1] - 17
                } ${currentSide.head[0]} ${currentSide.head[1] - 18} Q ${currentSide.head[0] + 12} ${
                  currentSide.head[1] - 17
                } ${currentSide.head[0] + 13} ${currentSide.head[1] - 8} Q ${currentSide.head[0] + 4} ${
                  currentSide.head[1] - 10
                } ${currentSide.head[0] - 10} ${currentSide.head[1] - 5} Z`}
                fill="#0f172a"
              />
              {/* Ear */}
              <ellipse cx={currentSide.head[0] - 1} cy={currentSide.head[1] + 3} rx="3" ry="4.5" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
            </g>

            {/* DELTOID CAP (3-Headed Shoulder Cap) */}
            <g id="sideDeltoid" filter={shoulderStyle.glow ? 'url(#primaryRedGlow)' : undefined}>
              <ellipse
                cx={currentSide.shoulder[0]}
                cy={currentSide.shoulder[1]}
                rx="12"
                ry="10"
                fill={shoulderStyle.fill}
                stroke={shoulderStyle.stroke}
                strokeWidth={shoulderStyle.strokeWidth}
              />
              <path
                d={`M ${currentSide.shoulder[0] - 7} ${currentSide.shoulder[1] - 2} Q ${currentSide.shoulder[0]} ${
                  currentSide.shoulder[1] + 6
                } ${currentSide.shoulder[0] + 7} ${currentSide.shoulder[1] - 2}`}
                stroke={shoulderStyle.striation}
                strokeWidth="1.2"
                fill="none"
              />
            </g>

            {/* UPPER ARM: BICEPS & TRICEPS */}
            <g id="sideUpperArm" filter={(bicepStyle.glow || tricepStyle.glow) ? 'url(#primaryRedGlow)' : undefined}>
              <line
                x1={currentSide.shoulder[0]}
                y1={currentSide.shoulder[1]}
                x2={currentSide.elbow[0]}
                y2={currentSide.elbow[1]}
                stroke={
                  bicepStyle.isHighlighted
                    ? bicepStyle.fill
                    : tricepStyle.isHighlighted
                    ? tricepStyle.fill
                    : 'url(#neutralAnatomicalGrad)'
                }
                strokeWidth="16"
                strokeLinecap="round"
              />
            </g>

            {/* Elbow Joint */}
            <circle cx={currentSide.elbow[0]} cy={currentSide.elbow[1]} r="5.5" fill="url(#skinBoneGrad)" stroke="#475569" strokeWidth="1" />

            {/* FOREARM */}
            <g id="sideForearm" filter={forearmStyle.glow ? 'url(#primaryRedGlow)' : undefined}>
              <line
                x1={currentSide.elbow[0]}
                y1={currentSide.elbow[1]}
                x2={currentSide.wrist[0]}
                y2={currentSide.wrist[1]}
                stroke={forearmStyle.fill}
                strokeWidth="13"
                strokeLinecap="round"
              />
            </g>

            {/* Hand Grip */}
            <circle cx={currentSide.wrist[0]} cy={currentSide.wrist[1]} r="6" fill="#f8fafc" stroke="#475569" strokeWidth="1.5" />

            {/* SIDE EQUIPMENT */}
            {activeProp === 'barbell' && (
              <g id="sideBarbell">
                <circle cx={currentSide.wrist[0]} cy={currentSide.wrist[1]} r="4" fill="#cbd5e1" stroke="#ffffff" strokeWidth="1" />
                <circle cx={currentSide.wrist[0]} cy={currentSide.wrist[1]} r="22" fill="url(#weightPlateGrad)" stroke="#ef4444" strokeWidth="2.5" opacity="0.95" />
                <circle cx={currentSide.wrist[0]} cy={currentSide.wrist[1]} r="9" fill="#0f172a" stroke="#cbd5e1" strokeWidth="1.5" />
                <text x={currentSide.wrist[0]} y={currentSide.wrist[1] + 3} textAnchor="middle" fill="#ef4444" fontSize="7" fontWeight="bold">45</text>
              </g>
            )}

            {activeProp === 'dumbbell' && (
              <g id="sideDumbbell">
                <rect x={currentSide.wrist[0] - 7} y={currentSide.wrist[1] - 14} width="14" height="8" rx="2" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                <rect x={currentSide.wrist[0] - 7} y={currentSide.wrist[1] + 6} width="14" height="8" rx="2" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                <line x1={currentSide.wrist[0]} y1={currentSide.wrist[1] - 10} x2={currentSide.wrist[0]} y2={currentSide.wrist[1] + 10} stroke="#cbd5e1" strokeWidth="3.5" />
              </g>
            )}
          </g>
        )}

        {/* 3. REALISTIC ANATOMICAL MANNEQUIN: FRONT SYMMETRICAL VIEW */}
        {currentFront && (
          <g id="anatomicalMannequinFront">
            {/* Pelvis Core & Compression Shorts */}
            <ellipse cx={currentFront.pelvis[0]} cy={currentFront.pelvis[1]} rx="24" ry="15" fill="url(#shortsGrad)" stroke="#334155" strokeWidth="1.5" />

            {/* V-TAPER TORSO TRUNK */}
            <path
              d={`M ${currentFront.leftShoulder[0]} ${currentFront.leftShoulder[1]} Q 200 ${
                currentFront.pelvis[1] - 12
              } ${currentFront.pelvis[0] - 16} ${currentFront.pelvis[1]} L ${currentFront.pelvis[0] + 16} ${
                currentFront.pelvis[1]
              } Q 200 ${currentFront.pelvis[1] - 12} ${currentFront.rightShoulder[0]} ${currentFront.rightShoulder[1]} Z`}
              fill="url(#neutralAnatomicalGrad)"
              stroke="#475569"
              strokeWidth="1.5"
            />

            {/* RECTUS ABDOMINIS 6-PACK WITH LINEA ALBA */}
            <g id="frontAbs" filter={absStyle.glow ? 'url(#primaryRedGlow)' : undefined}>
              {/* Linea Alba center groove */}
              <line x1="200" y1={currentFront.pelvis[1] - 38} x2="200" y2={currentFront.pelvis[1] - 4} stroke="#1e293b" strokeWidth="1.8" />
              
              {/* Six Pack Anatomical Pads */}
              {[-12, 0, 12].map((yOff, i) => (
                <g key={i}>
                  {/* Left Ab Pad */}
                  <path
                    d={`M 191 ${currentFront.pelvis[1] - 26 + yOff} Q 195 ${
                      currentFront.pelvis[1] - 28 + yOff
                    } 198 ${currentFront.pelvis[1] - 26 + yOff} L 198 ${currentFront.pelvis[1] - 18 + yOff} Q 194 ${
                      currentFront.pelvis[1] - 17 + yOff
                    } 191 ${currentFront.pelvis[1] - 19 + yOff} Z`}
                    fill={absStyle.fill}
                    stroke={absStyle.stroke}
                    strokeWidth="0.9"
                  />
                  {/* Right Ab Pad */}
                  <path
                    d={`M 209 ${currentFront.pelvis[1] - 26 + yOff} Q 205 ${
                      currentFront.pelvis[1] - 28 + yOff
                    } 202 ${currentFront.pelvis[1] - 26 + yOff} L 202 ${currentFront.pelvis[1] - 18 + yOff} Q 206 ${
                      currentFront.pelvis[1] - 17 + yOff
                    } 209 ${currentFront.pelvis[1] - 19 + yOff} Z`}
                    fill={absStyle.fill}
                    stroke={absStyle.stroke}
                    strokeWidth="0.9"
                  />
                </g>
              ))}
            </g>

            {/* PECTORALIS MAJOR PLATES (Sculpted Muscular Chest) */}
            <g id="frontChestPecs" filter={chestStyle.glow ? 'url(#primaryRedGlow)' : undefined}>
              {/* Left Pectoralis Major Plate */}
              <path
                d={`M ${currentFront.leftShoulder[0] + 5} ${currentFront.leftShoulder[1] + 6} Q 182 ${
                  currentFront.leftShoulder[1] + 28
                } 198 ${currentFront.leftShoulder[1] + 25} L 198 ${currentFront.leftShoulder[1] + 8} Q 170 ${
                  currentFront.leftShoulder[1] + 5
                } ${currentFront.leftShoulder[0] + 5} ${currentFront.leftShoulder[1] + 6} Z`}
                fill={chestStyle.fill}
                stroke={chestStyle.stroke}
                strokeWidth={chestStyle.strokeWidth}
              />
              {/* Left Pec Striations */}
              <path
                d={`M ${currentFront.leftShoulder[0] + 12} ${currentFront.leftShoulder[1] + 11} Q 185 ${
                  currentFront.leftShoulder[1] + 18
                } 196 ${currentFront.leftShoulder[1] + 17} M ${currentFront.leftShoulder[0] + 10} ${
                  currentFront.leftShoulder[1] + 16
                } Q 183 ${currentFront.leftShoulder[1] + 22} 195 ${currentFront.leftShoulder[1] + 21}`}
                stroke={chestStyle.striation}
                strokeWidth="1.3"
                fill="none"
                opacity="0.85"
              />

              {/* Right Pectoralis Major Plate */}
              <path
                d={`M ${currentFront.rightShoulder[0] - 5} ${currentFront.rightShoulder[1] + 6} Q 218 ${
                  currentFront.rightShoulder[1] + 28
                } 202 ${currentFront.rightShoulder[1] + 25} L 202 ${currentFront.rightShoulder[1] + 8} Q 230 ${
                  currentFront.rightShoulder[1] + 5
                } ${currentFront.rightShoulder[0] - 5} ${currentFront.rightShoulder[1] + 6} Z`}
                fill={chestStyle.fill}
                stroke={chestStyle.stroke}
                strokeWidth={chestStyle.strokeWidth}
              />
              {/* Right Pec Striations */}
              <path
                d={`M ${currentFront.rightShoulder[0] - 12} ${currentFront.rightShoulder[1] + 11} Q 215 ${
                  currentFront.rightShoulder[1] + 18
                } 204 ${currentFront.rightShoulder[1] + 17} M ${currentFront.rightShoulder[0] - 10} ${
                  currentFront.rightShoulder[1] + 16
                } Q 217 ${currentFront.rightShoulder[1] + 22} 205 ${currentFront.rightShoulder[1] + 21}`}
                stroke={chestStyle.striation}
                strokeWidth="1.3"
                fill="none"
                opacity="0.85"
              />
            </g>

            {/* LEFT LEG: Quads, Vastus Medialis Teardrop, Knee, Calf, Foot */}
            <g id="frontLeftLeg">
              <line
                x1={currentFront.leftHip[0]}
                y1={currentFront.leftHip[1]}
                x2={currentFront.leftKnee[0]}
                y2={currentFront.leftKnee[1]}
                stroke={quadStyle.fill}
                strokeWidth="18"
                strokeLinecap="round"
                filter={quadStyle.glow ? 'url(#primaryRedGlow)' : undefined}
              />
              {/* Vastus Medialis Teardrop Muscle */}
              <ellipse
                cx={currentFront.leftKnee[0] + 5}
                cy={currentFront.leftKnee[1] - 11}
                rx="4.5"
                ry="7"
                fill={quadStyle.isHighlighted ? quadStyle.striation : '#94a3b8'}
                opacity="0.8"
              />
              {/* Knee Joint */}
              <circle cx={currentFront.leftKnee[0]} cy={currentFront.leftKnee[1]} r="6" fill="url(#skinBoneGrad)" stroke="#475569" strokeWidth="1" />
              {/* Calf */}
              <line
                x1={currentFront.leftKnee[0]}
                y1={currentFront.leftKnee[1]}
                x2={currentFront.leftAnkle[0]}
                y2={currentFront.leftAnkle[1]}
                stroke={calfStyle.fill}
                strokeWidth="14"
                strokeLinecap="round"
                filter={calfStyle.glow ? 'url(#primaryRedGlow)' : undefined}
              />
              <rect x={currentFront.leftAnkle[0] - 6} y={currentFront.leftAnkle[1]} width="15" height="7" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            </g>

            {/* RIGHT LEG */}
            <g id="frontRightLeg">
              <line
                x1={currentFront.rightHip[0]}
                y1={currentFront.rightHip[1]}
                x2={currentFront.rightKnee[0]}
                y2={currentFront.rightKnee[1]}
                stroke={quadStyle.fill}
                strokeWidth="18"
                strokeLinecap="round"
                filter={quadStyle.glow ? 'url(#primaryRedGlow)' : undefined}
              />
              <ellipse
                cx={currentFront.rightKnee[0] - 5}
                cy={currentFront.rightKnee[1] - 11}
                rx="4.5"
                ry="7"
                fill={quadStyle.isHighlighted ? quadStyle.striation : '#94a3b8'}
                opacity="0.8"
              />
              <circle cx={currentFront.rightKnee[0]} cy={currentFront.rightKnee[1]} r="6" fill="url(#skinBoneGrad)" stroke="#475569" strokeWidth="1" />
              <line
                x1={currentFront.rightKnee[0]}
                y1={currentFront.rightKnee[1]}
                x2={currentFront.rightAnkle[0]}
                y2={currentFront.rightAnkle[1]}
                stroke={calfStyle.fill}
                strokeWidth="14"
                strokeLinecap="round"
                filter={calfStyle.glow ? 'url(#primaryRedGlow)' : undefined}
              />
              <rect x={currentFront.rightAnkle[0] - 9} y={currentFront.rightAnkle[1]} width="15" height="7" rx="2" fill="#0f172a" stroke="#475569" strokeWidth="1" />
            </g>

            {/* NECK & REALISTIC HUMAN HEAD (FRONT) */}
            <line x1="200" y1={currentFront.head[1] + 12} x2="200" y2={currentFront.leftShoulder[1]} stroke="url(#skinBoneGrad)" strokeWidth="11" strokeLinecap="round" />
            
            <g id="frontHumanHead">
              {/* Natural Human Cranium */}
              <ellipse cx="200" cy={currentFront.head[1]} rx="13" ry="16" fill="url(#skinBoneGrad)" stroke="#475569" strokeWidth="1.2" />
              {/* Athletic Hair */}
              <path
                d={`M 187 ${currentFront.head[1] - 4} Q 186 ${currentFront.head[1] - 17} 200 ${
                  currentFront.head[1] - 17
                } Q 214 ${currentFront.head[1] - 17} 213 ${currentFront.head[1] - 4} Q 206 ${
                  currentFront.head[1] - 10
                } 200 ${currentFront.head[1] - 11} Q 194 ${currentFront.head[1] - 10} 187 ${
                  currentFront.head[1] - 4
                } Z`}
                fill="#0f172a"
              />
              {/* Left & Right Ears */}
              <ellipse cx="186" cy={currentFront.head[1] + 1} rx="2" ry="4" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
              <ellipse cx="214" cy={currentFront.head[1] + 1} rx="2" ry="4" fill="#cbd5e1" stroke="#475569" strokeWidth="0.8" />
              {/* Subtle Natural Eyebrows & Nose Bridge (Human, not a robot slit!) */}
              <path d={`M 193 ${currentFront.head[1] - 2} Q 196 ${currentFront.head[1] - 4} 198 ${currentFront.head[1] - 2}`} stroke="#334155" strokeWidth="1" fill="none" />
              <path d={`M 202 ${currentFront.head[1] - 2} Q 204 ${currentFront.head[1] - 4} 207 ${currentFront.head[1] - 2}`} stroke="#334155" strokeWidth="1" fill="none" />
              <path d={`M 200 ${currentFront.head[1] - 1} L 200 ${currentFront.head[1] + 3} L 202 ${currentFront.head[1] + 4}`} stroke="#475569" strokeWidth="1" fill="none" />
              <line x1="197" y1={currentFront.head[1] + 8} x2="203" y2={currentFront.head[1] + 8} stroke="#475569" strokeWidth="1" />
            </g>

            {/* LEFT ARM: Deltoid, Biceps, Forearm, Hand */}
            <g id="frontLeftArm">
              <circle
                cx={currentFront.leftShoulder[0]}
                cy={currentFront.leftShoulder[1]}
                r="10"
                fill={shoulderStyle.fill}
                stroke={shoulderStyle.stroke}
                strokeWidth={shoulderStyle.strokeWidth}
                filter={shoulderStyle.glow ? 'url(#primaryRedGlow)' : undefined}
              />
              <line
                x1={currentFront.leftShoulder[0]}
                y1={currentFront.leftShoulder[1]}
                x2={currentFront.leftElbow[0]}
                y2={currentFront.leftElbow[1]}
                stroke={bicepStyle.isHighlighted ? bicepStyle.fill : tricepStyle.isHighlighted ? tricepStyle.fill : 'url(#neutralAnatomicalGrad)'}
                strokeWidth="15"
                strokeLinecap="round"
                filter={(bicepStyle.glow || tricepStyle.glow) ? 'url(#primaryRedGlow)' : undefined}
              />
              <circle cx={currentFront.leftElbow[0]} cy={currentFront.leftElbow[1]} r="5" fill="url(#skinBoneGrad)" stroke="#475569" strokeWidth="1" />
              <line
                x1={currentFront.leftElbow[0]}
                y1={currentFront.leftElbow[1]}
                x2={currentFront.leftWrist[0]}
                y2={currentFront.leftWrist[1]}
                stroke={forearmStyle.fill}
                strokeWidth="11"
                strokeLinecap="round"
                filter={forearmStyle.glow ? 'url(#primaryRedGlow)' : undefined}
              />
              <circle cx={currentFront.leftWrist[0]} cy={currentFront.leftWrist[1]} r="5.5" fill="#f8fafc" stroke="#475569" strokeWidth="1.2" />
            </g>

            {/* RIGHT ARM */}
            <g id="frontRightArm">
              <circle
                cx={currentFront.rightShoulder[0]}
                cy={currentFront.rightShoulder[1]}
                r="10"
                fill={shoulderStyle.fill}
                stroke={shoulderStyle.stroke}
                strokeWidth={shoulderStyle.strokeWidth}
                filter={shoulderStyle.glow ? 'url(#primaryRedGlow)' : undefined}
              />
              <line
                x1={currentFront.rightShoulder[0]}
                y1={currentFront.rightShoulder[1]}
                x2={currentFront.rightElbow[0]}
                y2={currentFront.rightElbow[1]}
                stroke={bicepStyle.isHighlighted ? bicepStyle.fill : tricepStyle.isHighlighted ? tricepStyle.fill : 'url(#neutralAnatomicalGrad)'}
                strokeWidth="15"
                strokeLinecap="round"
                filter={(bicepStyle.glow || tricepStyle.glow) ? 'url(#primaryRedGlow)' : undefined}
              />
              <circle cx={currentFront.rightElbow[0]} cy={currentFront.rightElbow[1]} r="5" fill="url(#skinBoneGrad)" stroke="#475569" strokeWidth="1" />
              <line
                x1={currentFront.rightElbow[0]}
                y1={currentFront.rightElbow[1]}
                x2={currentFront.rightWrist[0]}
                y2={currentFront.rightWrist[1]}
                stroke={forearmStyle.fill}
                strokeWidth="11"
                strokeLinecap="round"
                filter={forearmStyle.glow ? 'url(#primaryRedGlow)' : undefined}
              />
              <circle cx={currentFront.rightWrist[0]} cy={currentFront.rightWrist[1]} r="5.5" fill="#f8fafc" stroke="#475569" strokeWidth="1.2" />
            </g>

            {/* FRONT PROPS (ONLY DRAWN WHEN ACTUALLY USING THAT EQUIPMENT) */}
            {activeProp === 'barbell' && equipment && equipment.toUpperCase().includes('BARBELL') && (
              <g id="frontBarbell">
                <line
                  x1={Math.min(currentFront.leftWrist[0], currentFront.rightWrist[0]) - 32}
                  y1={(currentFront.leftWrist[1] + currentFront.rightWrist[1]) / 2}
                  x2={Math.max(currentFront.leftWrist[0], currentFront.rightWrist[0]) + 32}
                  y2={(currentFront.leftWrist[1] + currentFront.rightWrist[1]) / 2}
                  stroke="url(#metalBarGrad)"
                  strokeWidth="5"
                  strokeLinecap="round"
                />
                <rect
                  x={Math.min(currentFront.leftWrist[0], currentFront.rightWrist[0]) - 38}
                  y={(currentFront.leftWrist[1] + currentFront.rightWrist[1]) / 2 - 18}
                  width="7"
                  height="36"
                  rx="2"
                  fill="url(#weightPlateGrad)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
                <rect
                  x={Math.max(currentFront.leftWrist[0], currentFront.rightWrist[0]) + 31}
                  y={(currentFront.leftWrist[1] + currentFront.rightWrist[1]) / 2 - 18}
                  width="7"
                  height="36"
                  rx="2"
                  fill="url(#weightPlateGrad)"
                  stroke="#ef4444"
                  strokeWidth="1.5"
                />
              </g>
            )}

            {activeProp === 'dumbbell' && (
              <g id="frontDumbbells">
                <rect x={currentFront.leftWrist[0] - 7} y={currentFront.leftWrist[1] - 13} width="14" height="6" rx="2" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                <rect x={currentFront.leftWrist[0] - 7} y={currentFront.leftWrist[1] + 7} width="14" height="6" rx="2" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                <line x1={currentFront.leftWrist[0]} y1={currentFront.leftWrist[1] - 9} x2={currentFront.leftWrist[0]} y2={currentFront.leftWrist[1] + 9} stroke="#cbd5e1" strokeWidth="3.5" />

                <rect x={currentFront.rightWrist[0] - 7} y={currentFront.rightWrist[1] - 13} width="14" height="6" rx="2" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                <rect x={currentFront.rightWrist[0] - 7} y={currentFront.rightWrist[1] + 7} width="14" height="6" rx="2" fill="#1e293b" stroke="#ef4444" strokeWidth="1.5" />
                <line x1={currentFront.rightWrist[0]} y1={currentFront.rightWrist[1] - 9} x2={currentFront.rightWrist[0]} y2={currentFront.rightWrist[1] + 9} stroke="#cbd5e1" strokeWidth="3.5" />
              </g>
            )}
          </g>
        )}
      </svg>

      {/* TOP OVERLAY: PATTERN NAME & ACTIVE "LOOPING" INDICATOR */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="flex items-center gap-2">
          <span className="px-2 py-0.5 rounded-md bg-slate-950/85 border border-slate-800 text-[10px] font-bold text-slate-200 backdrop-blur-md">
            {patternDef.name}
          </span>
          <span className="text-[10px] text-slate-500 capitalize font-medium">
            {patternDef.cameraView} View
          </span>
        </div>

        {isLoopingActive ? (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-red-950/80 border border-red-500/50 text-[10px] font-bold text-red-400 backdrop-blur-md shadow-lg shadow-red-950/50">
            <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
            <span>Looping</span>
          </div>
        ) : (
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/80 border border-slate-700/60 text-[10px] font-bold text-slate-400 backdrop-blur-md">
            <span className="w-1.5 h-1.5 rounded-full bg-slate-500" />
            <span>Paused</span>
          </div>
        )}
      </div>

      {/* BOTTOM OVERLAY: INTERACTIVE CONTROLS */}
      {showControls && (
        <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between pointer-events-auto">
          <div className="hidden sm:flex items-center max-w-[220px] truncate text-[10px] text-slate-300 font-semibold px-2.5 py-1 rounded-lg bg-slate-950/85 border border-slate-800/80 backdrop-blur-md gap-1.5">
            <span className="w-2 h-2 rounded-full bg-red-500 shrink-0" />
            <span className="truncate">
              {primaryTokens.length > 0 ? primaryTokens.join(', ') : patternDef.description}
            </span>
          </div>

          <div className="flex items-center gap-1.5 ml-auto bg-slate-950/90 border border-slate-800 rounded-xl p-1 backdrop-blur-md shadow-xl">
            <button
              type="button"
              onClick={togglePlay}
              className="p-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label={isPlaying ? 'Pause animation' : 'Play animation'}
              title={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
            </button>

            <button
              type="button"
              onClick={toggleSpeed}
              className={`px-2 py-1 rounded-lg text-[10px] font-black transition-colors ${
                speed === 0.5
                  ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800'
              }`}
              aria-label={`Toggle playback speed, current speed ${speed}x`}
              title="Toggle Speed"
            >
              {speed}x
            </button>

            <button
              type="button"
              onClick={resetPose}
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              aria-label="Reset to start pose"
              title="Reset"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
