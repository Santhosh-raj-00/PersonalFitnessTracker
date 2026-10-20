import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import type { Exercise } from '../../types';
import { exerciseService } from '../../services/exerciseService';
import { MuscleDiagram } from '../muscle/MuscleDiagram';
import { CreateCustomExerciseModal } from './CreateCustomExerciseModal';
import { ExerciseMedia } from './ExerciseMedia';
import {
  getRecentExerciseIds,
  addRecentExerciseId,
  getFavoriteExerciseIds,
  toggleFavoriteExerciseId,
  isFavoriteExerciseId,
} from '../../utils/exercisePreferences';
import {
  X,
  Search,
  ArrowLeft,
  Check,
  Eye,
  Plus,
  Star,
  Clock,
  Layers,
  Sparkles,
  AlertCircle,
  SlidersHorizontal,
} from 'lucide-react';


export interface ExercisePickerProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectExercises: (exercises: Exercise[]) => void;
  alreadySelectedIds?: number[];
  title?: string;
  submitButtonText?: string;
}

interface MuscleItem {
  id: string;
  name: string;
  subtitle: string;
  iconName: string;
  accentColor: string;
  bgGradient: string;
}

const MUSCLE_GRID_ITEMS: MuscleItem[] = [
  { id: 'CHEST', name: 'Chest', subtitle: 'Pectorals & sternal', iconName: 'shield', accentColor: 'text-orange-400', bgGradient: 'from-orange-500/20 to-amber-500/10' },
  { id: 'BACK', name: 'Back', subtitle: 'Lats, rhomboids & spine', iconName: 'layers', accentColor: 'text-blue-400', bgGradient: 'from-blue-500/20 to-cyan-500/10' },
  { id: 'SHOULDERS', name: 'Shoulders', subtitle: 'Deltoids & rotators', iconName: 'triangle', accentColor: 'text-emerald-400', bgGradient: 'from-emerald-500/20 to-teal-500/10' },
  { id: 'TRAPS', name: 'Traps', subtitle: 'Upper & mid trapezius', iconName: 'mountain', accentColor: 'text-purple-400', bgGradient: 'from-purple-500/20 to-indigo-500/10' },
  { id: 'BICEPS', name: 'Biceps', subtitle: 'Brachii & brachialis', iconName: 'zap', accentColor: 'text-rose-400', bgGradient: 'from-rose-500/20 to-red-500/10' },
  { id: 'TRICEPS', name: 'Triceps', subtitle: 'Long, lateral & medial heads', iconName: 'target', accentColor: 'text-sky-400', bgGradient: 'from-sky-500/20 to-blue-500/10' },
  { id: 'FOREARMS', name: 'Forearms', subtitle: 'Flexors, extensors & grip', iconName: 'grip', accentColor: 'text-teal-400', bgGradient: 'from-teal-500/20 to-emerald-500/10' },
  { id: 'ABS', name: 'Abs & Core', subtitle: 'Rectus abdominis & obliques', iconName: 'activity', accentColor: 'text-yellow-400', bgGradient: 'from-yellow-500/20 to-amber-500/10' },
  { id: 'GLUTES', name: 'Glutes', subtitle: 'Maximus, medius & minimus', iconName: 'heart', accentColor: 'text-pink-400', bgGradient: 'from-pink-500/20 to-rose-500/10' },
  { id: 'QUADS', name: 'Quads', subtitle: 'Rectus femoris & vastus', iconName: 'flame', accentColor: 'text-red-400', bgGradient: 'from-red-500/20 to-orange-500/10' },
  { id: 'HAMSTRINGS', name: 'Hamstrings', subtitle: 'Biceps femoris & semitend.', iconName: 'repeat', accentColor: 'text-amber-400', bgGradient: 'from-amber-500/20 to-yellow-500/10' },
  { id: 'CALVES', name: 'Calves', subtitle: 'Gastrocnemius & soleus', iconName: 'arrow-up', accentColor: 'text-lime-400', bgGradient: 'from-lime-500/20 to-green-500/10' },
  { id: 'CARDIO', name: 'Cardio', subtitle: 'Conditioning & stamina', iconName: 'heart-pulse', accentColor: 'text-red-500', bgGradient: 'from-red-600/20 to-pink-500/10' },
  { id: 'FULL_BODY', name: 'Full Body', subtitle: 'Compound & Olympic lifts', iconName: 'globe', accentColor: 'text-cyan-400', bgGradient: 'from-cyan-500/20 to-blue-500/10' },
];

const EQUIPMENT_FILTERS: { label: string; value: string }[] = [
  { label: 'All Equipment', value: 'ALL' },
  { label: 'Barbell', value: 'BARBELL' },
  { label: 'Dumbbell', value: 'DUMBBELL' },
  { label: 'Kettlebell', value: 'KETTLEBELL' },
  { label: 'Machine', value: 'MACHINE' },
  { label: 'Cable', value: 'CABLE' },
  { label: 'Smith Machine', value: 'SMITH_MACHINE' },
  { label: 'Bodyweight', value: 'BODYWEIGHT' },
  { label: 'Band', value: 'BAND' },
  { label: 'Other', value: 'OTHER' },
];

const DIFFICULTY_FILTERS: { label: string; value: string }[] = [
  { label: 'All Levels', value: 'ALL' },
  { label: 'Beginner', value: 'BEGINNER' },
  { label: 'Intermediate', value: 'INTERMEDIATE' },
  { label: 'Advanced', value: 'ADVANCED' },
];

export const ExercisePicker: React.FC<ExercisePickerProps> = ({
  isOpen,
  onClose,
  onSelectExercises,
  alreadySelectedIds = [],
  title = 'Add Exercises to Routine',
  submitButtonText = 'Add to Routine',
}) => {
  // Navigation State
  const [activeStep, setActiveStep] = useState<'muscles' | 'exercises'>('muscles');
  const [selectedMuscle, setSelectedMuscle] = useState<string | null>(null);
  const [activeShortcut, setActiveShortcut] = useState<'recent' | 'favorites' | null>(null);

  // Filter & Search State
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<string>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('ALL');
  const [includeSecondary, setIncludeSecondary] = useState<boolean>(false);

  // Multi-selection Store
  const [selectedExercisesMap, setSelectedExercisesMap] = useState<Map<number, Exercise>>(new Map());

  // Quick Preview State
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);
  const [previewActiveTab, setPreviewActiveTab] = useState<'diagram' | 'instructions'>('diagram');


  // Custom Exercise Modal State
  const [showCustomModal, setShowCustomModal] = useState<boolean>(false);

  // Accessibility Focus Trap Ref
  const dialogRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Reset or initialize on open
  useEffect(() => {
    if (isOpen) {
      setActiveStep('muscles');
      setSelectedMuscle(null);
      setActiveShortcut(null);
      setSearchQuery('');
      setSelectedEquipment('ALL');
      setSelectedDifficulty('ALL');
      setIncludeSecondary(false);
      setSelectedExercisesMap(new Map());
      setPreviewExercise(null);
    }
  }, [isOpen]);

  // Focus trap & Escape key listener
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (previewExercise) {
          setPreviewExercise(null);
        } else if (activeStep === 'exercises') {
          setActiveStep('muscles');
        } else {
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, previewExercise, activeStep, onClose]);

  // Auto focus search when entering exercises step
  useEffect(() => {
    if (activeStep === 'exercises' && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [activeStep]);

  // TanStack Query: Cached exercise list
  const queryMuscleParam = useMemo(() => {
    if (activeShortcut) return undefined;
    if (selectedMuscle === 'FULL_BODY') return 'FULL_BODY';
    return selectedMuscle || undefined;
  }, [activeShortcut, selectedMuscle]);

  const {
    data: fetchedExercises = [],
    isLoading,
    isError,
  } = useQuery<Exercise[]>({
    queryKey: [
      'exercises',
      {
        muscle: queryMuscleParam,
        shortcut: activeShortcut,
        equipment: selectedEquipment,
        difficulty: selectedDifficulty,
        includeSecondary,
        q: searchQuery,
      },
    ],
    queryFn: async () => {
      // Normal search query
      const list = await exerciseService.searchExercises(
        searchQuery,
        queryMuscleParam,
        selectedEquipment,
        selectedDifficulty,
        includeSecondary
      );
      return list;
    },
    enabled: isOpen && activeStep === 'exercises',
  });

  // Filter according to shortcut if applicable
  const displayExercises = useMemo(() => {
    if (!activeShortcut) return fetchedExercises;

    if (activeShortcut === 'recent') {
      const recentIds = getRecentExerciseIds();
      return fetchedExercises.filter((e) => recentIds.includes(e.id));
    }

    if (activeShortcut === 'favorites') {
      const favIds = getFavoriteExerciseIds();
      return fetchedExercises.filter((e) => favIds.includes(e.id));
    }

    return fetchedExercises;
  }, [fetchedExercises, activeShortcut]);

  // Handlers
  const handleSelectMuscle = (muscleId: string) => {
    setSelectedMuscle(muscleId);
    setActiveShortcut(null);
    setActiveStep('exercises');
    setSearchQuery('');
  };

  const handleSelectShortcut = (shortcut: 'recent' | 'favorites') => {
    setActiveShortcut(shortcut);
    setSelectedMuscle(null);
    setActiveStep('exercises');
    setSearchQuery('');
  };

  const toggleExerciseSelection = (exercise: Exercise) => {
    if (alreadySelectedIds.includes(exercise.id)) return;

    setSelectedExercisesMap((prev) => {
      const next = new Map(prev);
      if (next.has(exercise.id)) {
        next.delete(exercise.id);
      } else {
        next.set(exercise.id, exercise);
        addRecentExerciseId(exercise.id);
      }
      return next;
    });
  };

  const handleFavoriteToggle = (e: React.MouseEvent, exerciseId: number) => {
    e.stopPropagation();
    toggleFavoriteExerciseId(exerciseId);
    // Force re-render if in favorites view
    if (activeShortcut === 'favorites') {
      setSelectedExercisesMap((prev) => new Map(prev));
    }
  };

  const handleCustomExerciseCreated = (newExercise: Exercise) => {
    setShowCustomModal(false);
    // Automatically select the newly created exercise
    setSelectedExercisesMap((prev) => {
      const next = new Map(prev);
      next.set(newExercise.id, newExercise);
      return next;
    });
    addRecentExerciseId(newExercise.id);
  };

  const handleConfirmAdd = () => {
    const chosenList = Array.from(selectedExercisesMap.values());
    if (chosenList.length === 0) return;

    // Record recents
    chosenList.forEach((ex) => addRecentExerciseId(ex.id));

    onSelectExercises(chosenList);
    onClose();
  };

  const selectedCount = selectedExercisesMap.size;

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center p-0 sm:p-4 overflow-hidden animate-in fade-in duration-200"
      role="dialog"
      aria-modal="true"
      aria-labelledby="exercise-picker-title"
    >
      {/* Modal / Bottom Sheet Box */}
      <div
        ref={dialogRef}
        className="w-full h-[92vh] sm:h-[86vh] sm:max-w-3xl bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-3xl flex flex-col shadow-2xl overflow-hidden focus:outline-none"
      >
        {/* Top Header */}
        <div className="px-5 py-4 border-b border-slate-800/80 bg-slate-950/70 flex items-center justify-between shrink-0">
          <div className="flex items-center gap-3">
            {activeStep === 'exercises' && (
              <button
                type="button"
                onClick={() => setActiveStep('muscles')}
                aria-label="Back to muscle groups"
                className="w-10 h-10 -ml-1 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
            )}

            <div>
              <h2 id="exercise-picker-title" className="text-base sm:text-lg font-black text-white">
                {activeStep === 'muscles'
                  ? title
                  : activeShortcut === 'recent'
                  ? 'Recent Exercises'
                  : activeShortcut === 'favorites'
                  ? 'Favorite Exercises'
                  : `${MUSCLE_GRID_ITEMS.find((m) => m.id === selectedMuscle)?.name || selectedMuscle} Exercises`}
              </h2>
              <p className="text-[11px] text-slate-400">
                {activeStep === 'muscles'
                  ? 'Choose a muscle group first to browse movements'
                  : 'Select movements to add into this routine day'}
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="w-10 h-10 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* STEP 1: MUSCLE GROUP GRID & SHORTCUTS */}
        {activeStep === 'muscles' && (
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {/* Shortcuts Row: Recent & Favorites */}
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => handleSelectShortcut('recent')}
                className="min-h-[52px] p-3.5 rounded-2xl bg-gradient-to-r from-slate-800/90 to-slate-800/50 border border-slate-700/60 hover:border-emerald-500/50 flex items-center justify-between text-left transition-all btn-press focus-visible:ring-2 focus-visible:ring-emerald-500"
                aria-label="View recently used exercises"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">Recent</span>
                    <span className="block text-[10px] text-slate-400">Recently logged</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                  {getRecentExerciseIds().length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectShortcut('favorites')}
                className="min-h-[52px] p-3.5 rounded-2xl bg-gradient-to-r from-slate-800/90 to-slate-800/50 border border-slate-700/60 hover:border-amber-500/50 flex items-center justify-between text-left transition-all btn-press focus-visible:ring-2 focus-visible:ring-amber-500"
                aria-label="View favorite exercises"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
                    <Star className="w-5 h-5 fill-amber-400/30" />
                  </div>
                  <div>
                    <span className="block text-xs font-bold text-white">Favorites</span>
                    <span className="block text-[10px] text-slate-400">Starred moves</span>
                  </div>
                </div>
                <span className="text-[10px] font-semibold text-slate-400 px-2 py-0.5 rounded-full bg-slate-900 border border-slate-700">
                  {getFavoriteExerciseIds().length}
                </span>
              </button>
            </div>

            {/* Muscle Groups Section Header */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-emerald-400" />
                Target Muscle Groups
              </span>
              <span className="text-[11px] text-slate-500">14 anatomical targets</span>
            </div>

            {/* 14 Muscle Target Cards Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {MUSCLE_GRID_ITEMS.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => handleSelectMuscle(item.id)}
                  className={`min-h-[82px] p-3.5 rounded-2xl bg-gradient-to-br ${item.bgGradient} bg-slate-950/80 border border-slate-800 hover:border-emerald-500/60 hover:shadow-lg transition-all text-left flex flex-col justify-between group btn-press focus-visible:ring-2 focus-visible:ring-emerald-500`}
                  aria-label={`Select ${item.name} muscle group`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-white group-hover:text-emerald-300 transition-colors">
                      {item.name}
                    </span>
                    <span className={`w-2 h-2 rounded-full ${item.accentColor.replace('text-', 'bg-')} opacity-80`} />
                  </div>
                  <span className="text-[10px] text-slate-400 font-medium leading-tight">
                    {item.subtitle}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* STEP 2: EXERCISE LIST WITH SEARCH & FILTERS */}
        {activeStep === 'exercises' && (
          <div className="flex-1 flex flex-col overflow-hidden">
            {/* Search & Filter Bar */}
            <div className="p-4 bg-slate-950/90 border-b border-slate-800 space-y-3 shrink-0">
              {/* Search Input */}
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search exercise by name or keyword..."
                  className="w-full pl-10 pr-9 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
                  aria-label="Search exercises"
                />
                {searchQuery && (
                  <button
                    type="button"
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white"
                    aria-label="Clear search query"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Filter Chips Scrollable Row */}
              <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar text-xs">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider shrink-0 flex items-center gap-1">
                  <SlidersHorizontal className="w-3 h-3" /> Filter:
                </span>

                {EQUIPMENT_FILTERS.map((ef) => (
                  <button
                    key={ef.value}
                    type="button"
                    onClick={() => setSelectedEquipment(ef.value)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors btn-press ${
                      selectedEquipment === ef.value
                        ? 'bg-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {ef.label}
                  </button>
                ))}

                <span className="text-slate-700">|</span>

                {DIFFICULTY_FILTERS.map((df) => (
                  <button
                    key={df.value}
                    type="button"
                    onClick={() => setSelectedDifficulty(df.value)}
                    className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-colors btn-press ${
                      selectedDifficulty === df.value
                        ? 'bg-amber-500 text-slate-950 shadow-sm shadow-amber-500/20'
                        : 'bg-slate-900 text-slate-400 border border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    {df.label}
                  </button>
                ))}
              </div>

              {/* Include Secondary Muscles Toggle */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] text-slate-400 font-semibold">
                  Include secondary muscle matches
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={includeSecondary}
                  onClick={() => setIncludeSecondary((prev) => !prev)}
                  className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                    includeSecondary ? 'bg-emerald-500' : 'bg-slate-700'
                  }`}
                >
                  <span
                    className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-lg ring-0 transition duration-200 ease-in-out ${
                      includeSecondary ? 'translate-x-4' : 'translate-x-0'
                    }`}
                  />
                </button>
              </div>
            </div>

            {/* List Results Container */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
              {isLoading ? (
                <div className="space-y-3">
                  {[1, 2, 3, 4, 5].map((n) => (
                    <div
                      key={n}
                      className="h-20 bg-slate-950/70 border border-slate-800 rounded-2xl animate-pulse flex items-center p-3 gap-3"
                    >
                      <div className="w-14 h-14 rounded-xl bg-slate-800" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-slate-800 rounded w-1/3" />
                        <div className="h-3 bg-slate-800 rounded w-1/2" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : isError ? (
                <div className="text-center py-12 space-y-3">
                  <AlertCircle className="w-10 h-10 text-rose-400 mx-auto" />
                  <p className="text-sm font-bold text-white">Failed to load exercises</p>
                  <p className="text-xs text-slate-400">Please check your network and try again.</p>
                </div>
              ) : displayExercises.length === 0 ? (
                <div className="text-center py-12 px-4 space-y-3 bg-slate-950/50 rounded-2xl border border-slate-800/60">
                  <Sparkles className="w-10 h-10 text-slate-600 mx-auto" />
                  <h3 className="text-sm font-bold text-white">No exercises found</h3>
                  <p className="text-xs text-slate-400 max-w-sm mx-auto">
                    No exercises match the selected filters or search terms. Try clearing filters or create a custom exercise.
                  </p>
                  <button
                    type="button"
                    onClick={() => {
                      setSearchQuery('');
                      setSelectedEquipment('ALL');
                      setSelectedDifficulty('ALL');
                    }}
                    className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl"
                  >
                    Reset Filters
                  </button>
                </div>
              ) : (
                displayExercises.map((exercise) => {
                  const isAlreadyInRoutine = alreadySelectedIds.includes(exercise.id);
                  const isChecked = selectedExercisesMap.has(exercise.id);
                  const isFav = isFavoriteExerciseId(exercise.id);

                  return (
                    <div
                      key={exercise.id}
                      onClick={() => !isAlreadyInRoutine && toggleExerciseSelection(exercise)}
                      className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                        isAlreadyInRoutine
                          ? 'bg-slate-950/40 border-slate-800/50 opacity-60 cursor-not-allowed'
                          : isChecked
                          ? 'bg-emerald-950/20 border-emerald-500/60 shadow-md shadow-emerald-500/10 cursor-pointer'
                          : 'bg-slate-950/80 border-slate-800/80 hover:border-slate-700 cursor-pointer'
                      }`}
                    >
                      {/* Left: Thumbnail & Info */}
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        {/* Media Thumbnail */}
                        <div className="relative w-14 h-14 rounded-xl bg-slate-900 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center">
                          <ExerciseMedia
                            key={exercise.id}
                            exercise={exercise}
                            showControls={false}
                            className="w-full h-full"
                          />
                        </div>

                        {/* Title & Badges */}
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="text-xs sm:text-sm font-black text-white truncate">
                              {exercise.name}
                            </h4>
                            {exercise.isCustom && (
                              <span className="text-[9px] font-bold text-amber-400 bg-amber-950/80 px-1.5 py-0.5 rounded border border-amber-800">
                                CUSTOM
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap items-center gap-1.5 mt-1">
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300">
                              {exercise.primaryMuscle}
                            </span>
                            {includeSecondary && selectedMuscle && exercise.primaryMuscle !== selectedMuscle && (
                              <span className="text-[9px] font-bold uppercase px-1.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40">
                                Secondary
                              </span>
                            )}
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-900 text-slate-400 border border-slate-800">
                              {exercise.equipment}
                            </span>
                            {exercise.difficulty && (
                              <span className="text-[10px] font-medium text-slate-500">
                                • {exercise.difficulty}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Right: Quick Preview & Checkbox */}
                      <div className="flex items-center gap-2 shrink-0">
                        {/* Favorite Button */}
                        <button
                          type="button"
                          onClick={(e) => handleFavoriteToggle(e, exercise.id)}
                          aria-label={isFav ? 'Remove favorite' : 'Add favorite'}
                          className="w-9 h-9 rounded-xl hover:bg-slate-800 text-slate-400 hover:text-amber-400 flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-amber-500"
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>

                        {/* Quick Preview Button */}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewExercise(exercise);
                          }}
                          aria-label={`Preview details and muscle map for ${exercise.name}`}
                          className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500"
                        >
                          <Eye className="w-4 h-4" />
                        </button>

                        {/* Checkbox / Added Status */}
                        {isAlreadyInRoutine ? (
                          <span className="px-2.5 py-1 rounded-xl bg-slate-800 text-slate-400 text-[10px] font-bold border border-slate-700">
                            Added
                          </span>
                        ) : (
                          <div
                            className={`w-7 h-7 rounded-xl border flex items-center justify-center transition-colors ${
                              isChecked
                                ? 'bg-emerald-500 border-emerald-500 text-slate-950 shadow-sm shadow-emerald-500/20'
                                : 'bg-slate-900 border-slate-700 hover:border-slate-500'
                            }`}
                          >
                            {isChecked && <Check className="w-4 h-4 stroke-[3]" />}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              )}

              {/* Bottom option: Create Custom Exercise */}
              <div className="pt-3 pb-6">
                <button
                  type="button"
                  onClick={() => setShowCustomModal(true)}
                  className="w-full py-3 px-4 rounded-2xl bg-slate-950/60 hover:bg-slate-900 border border-dashed border-slate-700 hover:border-emerald-500 text-slate-300 hover:text-emerald-400 text-xs font-bold flex items-center justify-center gap-2 transition-all btn-press"
                >
                  <Plus className="w-4 h-4 text-emerald-400" />
                  <span>Create Custom Exercise</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sticky Footer: Multi-Select Counter & Add Button */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-2">
            <span
              className={`text-xs font-black px-2.5 py-1 rounded-xl border ${
                selectedCount > 0
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40'
                  : 'bg-slate-800 text-slate-400 border-slate-700'
              }`}
            >
              {selectedCount} selected
            </span>
            {selectedCount > 0 && (
              <button
                type="button"
                onClick={() => setSelectedExercisesMap(new Map())}
                className="text-[11px] text-slate-400 hover:text-rose-400 underline"
              >
                Clear
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 font-bold text-xs border border-slate-800"
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={selectedCount === 0}
              onClick={handleConfirmAdd}
              className={`px-5 py-2.5 rounded-xl font-black text-xs flex items-center gap-2 transition-all btn-press ${
                selectedCount > 0
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg shadow-emerald-500/20 hover:from-emerald-400 hover:to-teal-400'
                  : 'bg-slate-800 text-slate-500 cursor-not-allowed'
              }`}
            >
              <Check className="w-4 h-4 stroke-[2.5]" />
              <span>
                {selectedCount > 1 ? `${submitButtonText} (${selectedCount})` : submitButtonText}
              </span>
            </button>
          </div>
        </div>
      </div>

      {/* QUICK PREVIEW DRAWER / MODAL */}
      {previewExercise && (
        <div
          className="fixed inset-0 z-60 bg-black/85 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-150"
          role="dialog"
          aria-modal="true"
          aria-labelledby="preview-exercise-title"
        >
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            {/* Preview Header */}
            <div className="p-4 border-b border-slate-800 bg-slate-950 flex items-center justify-between">
              <div>
                <h3 id="preview-exercise-title" className="text-base font-black text-white">
                  {previewExercise.name}
                </h3>
                <div className="text-[11px] text-slate-400 font-semibold mt-0.5">
                  {previewExercise.primaryMuscle} • {previewExercise.equipment} • {previewExercise.difficulty}
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPreviewExercise(null)}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center"
                aria-label="Close preview"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Preview Body */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Universal Exercise Media (4:3 Dark Container with Builtin Muscular Fallback) */}
              <div className="w-full">
                <ExerciseMedia
                  key={previewExercise.id}
                  exercise={previewExercise}
                  showControls={true}
                />
              </div>

              {/* Tabs: Muscle Activation Diagram vs Steps */}
              <div className="flex items-center gap-2 p-1 bg-slate-950 border border-slate-800 rounded-xl text-xs font-bold">
                <button
                  type="button"
                  onClick={() => setPreviewActiveTab('diagram')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                    previewActiveTab === 'diagram'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Muscle Activation Diagram
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewActiveTab('instructions')}
                  className={`flex-1 py-1.5 rounded-lg text-center transition-colors ${
                    previewActiveTab === 'instructions'
                      ? 'bg-emerald-500 text-slate-950 shadow-sm'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Execution Steps & Form
                </button>
              </div>

              {previewActiveTab === 'diagram' ? (
                <div className="p-3 bg-slate-950 rounded-2xl border border-slate-850">
                  <MuscleDiagram
                    primary={previewExercise.primaryMuscles && previewExercise.primaryMuscles.length > 0 ? previewExercise.primaryMuscles : [previewExercise.primaryMuscle]}
                    secondary={
                      previewExercise.secondaryMusclesList && previewExercise.secondaryMusclesList.length > 0
                        ? previewExercise.secondaryMusclesList
                        : (previewExercise.secondaryMuscles ? previewExercise.secondaryMuscles.split(',') : [])
                    }
                    chestRegion={previewExercise.chestRegion}
                    className="max-w-[340px] mx-auto"
                  />
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800/80 space-y-2">
                    <h5 className="text-xs font-bold text-white uppercase tracking-wider">Instructions</h5>
                    <ol className="list-decimal list-inside space-y-1.5 text-xs text-slate-300 leading-relaxed">
                      {previewExercise.steps && previewExercise.steps.length > 0 ? (
                        previewExercise.steps.map((st, i) => <li key={i}>{st}</li>)
                      ) : (
                        <li>Perform controlled repetitions through a complete range of motion.</li>
                      )}
                    </ol>
                  </div>

                  {previewExercise.mistakes && previewExercise.mistakes.length > 0 && (
                    <div className="p-3.5 bg-rose-950/20 border border-rose-900/40 rounded-2xl space-y-1.5">
                      <h5 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5" /> Common Mistakes
                      </h5>
                      <ul className="list-disc list-inside space-y-1 text-xs text-rose-200/90">
                        {previewExercise.mistakes.map((m, i) => <li key={i}>{m}</li>)}
                      </ul>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Preview Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between">
              <span className="text-xs text-slate-400">
                Default: <strong>{previewExercise.defaultSets || 3} sets</strong> × <strong>{previewExercise.defaultReps || '8-12'} reps</strong>
              </span>

              <button
                type="button"
                onClick={() => {
                  toggleExerciseSelection(previewExercise);
                  setPreviewExercise(null);
                }}
                className={`px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 btn-press ${
                  selectedExercisesMap.has(previewExercise.id)
                    ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40 hover:bg-rose-500/30'
                    : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400 shadow-md shadow-emerald-500/20'
                }`}
              >
                {selectedExercisesMap.has(previewExercise.id) ? (
                  <>
                    <X className="w-4 h-4" /> Remove Selection
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 stroke-[3]" /> Add to Selection
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE CUSTOM EXERCISE MODAL */}
      <CreateCustomExerciseModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onExerciseCreated={handleCustomExerciseCreated}
      />
    </div>
  );
};
