import React, { useState, useEffect } from 'react';
import { exerciseService } from '../services/exerciseService';
import type { Exercise, Equipment, Difficulty, MuscleGroupSummary } from '../types';
import { MuscleGrid } from '../components/exercise/MuscleGrid';
import { ExerciseDetailModal } from '../components/exercise/ExerciseDetailModal';
import { CreateCustomExerciseModal } from '../components/exercise/CreateCustomExerciseModal';
import {
  Search,
  Filter,
  BookOpen,
  ArrowLeft,
  Plus,
  Dumbbell,
  ChevronRight,
  X,
  SlidersHorizontal,
} from 'lucide-react';

const EQUIPMENTS: (Equipment | 'ALL')[] = [
  'ALL',
  'BARBELL',
  'DUMBBELL',
  'CABLE',
  'MACHINE',
  'BODYWEIGHT',
  'SMITH_MACHINE',
  'KETTLEBELL',
  'EZ_BAR',
];

const DIFFICULTIES: (Difficulty | 'ALL')[] = ['ALL', 'BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const Exercises: React.FC = () => {
  // Navigation Levels: 'level1' (Muscle Grid), 'level2' (Filtered Exercise List)
  const [currentLevel, setCurrentLevel] = useState<'level1' | 'level2'>('level1');
  const [selectedMuscle, setSelectedMuscle] = useState<string>('ALL');
  const [muscleSummaries, setMuscleSummaries] = useState<MuscleGroupSummary[]>([]);
  const [isSummariesLoading, setIsSummariesLoading] = useState<boolean>(true);

  // Exercises list state
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedEquipment, setSelectedEquipment] = useState<Equipment | 'ALL'>('ALL');
  const [selectedDifficulty, setSelectedDifficulty] = useState<Difficulty | 'ALL'>('ALL');
  const [isExercisesLoading, setIsExercisesLoading] = useState<boolean>(false);

  // Level 3 Modal state
  const [selectedExerciseForModal, setSelectedExerciseForModal] = useState<Exercise | null>(null);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState<boolean>(false);

  // Custom Exercise Modal
  const [isCustomModalOpen, setIsCustomModalOpen] = useState<boolean>(false);

  // Load Muscle Summaries on Mount
  useEffect(() => {
    loadMuscleSummaries();
  }, []);

  // When Level 2 or filters change, load matching exercises
  useEffect(() => {
    if (currentLevel === 'level2' || searchQuery.trim().length > 0) {
      loadExercises();
    }
  }, [selectedMuscle, selectedEquipment, selectedDifficulty, currentLevel]);

  const loadMuscleSummaries = async () => {
    setIsSummariesLoading(true);
    try {
      const data = await exerciseService.getMuscleGroups();
      setMuscleSummaries(data);
    } catch (err) {
      console.error('Failed to load muscle groups:', err);
    } finally {
      setIsSummariesLoading(false);
    }
  };

  const loadExercises = async () => {
    setIsExercisesLoading(true);
    try {
      const muscleParam = currentLevel === 'level2' ? selectedMuscle : undefined;
      const data = await exerciseService.searchExercises(
        searchQuery,
        muscleParam,
        selectedEquipment,
        selectedDifficulty
      );
      setExercises(data);
    } catch (err) {
      console.error('Failed to load exercises:', err);
    } finally {
      setIsExercisesLoading(false);
    }
  };

  const handleSelectMuscleGroup = (muscleId: string) => {
    setSelectedMuscle(muscleId);
    setCurrentLevel('level2');
  };

  const handleBackToMuscles = () => {
    setCurrentLevel('level1');
    setSelectedMuscle('ALL');
    setSelectedEquipment('ALL');
    setSelectedDifficulty('ALL');
  };

  const handleOpenDetail = (exercise: Exercise) => {
    setSelectedExerciseForModal(exercise);
    setIsDetailModalOpen(true);
  };

  const handleCustomExerciseCreated = (newExercise: Exercise) => {
    setExercises((prev) => [newExercise, ...prev]);
    loadMuscleSummaries();
    handleOpenDetail(newExercise);
  };

  const selectedSummary = muscleSummaries.find((m) => m.id === selectedMuscle);

  const getDifficultyBadge = (diff: string) => {
    switch (diff) {
      case 'BEGINNER':
        return 'text-emerald-400 bg-emerald-950/70 border-emerald-800/60';
      case 'INTERMEDIATE':
        return 'text-amber-400 bg-amber-950/70 border-amber-800/60';
      case 'ADVANCED':
        return 'text-rose-400 bg-rose-950/70 border-rose-800/60';
      default:
        return 'text-slate-400 bg-slate-800 border-slate-700';
    }
  };

  return (
    <div className="space-y-5 pb-24 md:pb-8 animate-in fade-in">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-1">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-6 h-6 text-orange-500" />
              <span>Exercise Library</span>
            </h1>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              800+ movements
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Target specific muscle anatomy, learn proper execution, and avoid injuries
          </p>
        </div>

        {/* Create Custom Exercise Trigger */}
        <button
          type="button"
          onClick={() => setIsCustomModalOpen(true)}
          className="self-start sm:self-auto flex items-center gap-1.5 px-3.5 py-2 bg-slate-900 hover:bg-slate-850 text-orange-400 hover:text-orange-300 border border-slate-800 hover:border-orange-500/40 rounded-xl text-xs font-bold transition-all min-h-[44px] shadow-sm active:scale-95"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>New Custom Exercise</span>
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => {
            setSearchQuery(e.target.value);
            if (e.target.value.trim().length > 0 && currentLevel === 'level1') {
              setCurrentLevel('level2');
            }
          }}
          placeholder="Search bench press, deadlift, squat, lateral raise..."
          className="w-full pl-10 pr-9 py-2.5 bg-slate-900/90 border border-slate-800 rounded-2xl text-white text-xs placeholder:text-slate-500 focus:outline-none focus:border-orange-500 focus:ring-1 focus:ring-orange-500/30 transition-all min-h-[46px]"
        />
        {searchQuery && (
          <button
            onClick={() => {
              setSearchQuery('');
              if (selectedMuscle === 'ALL') setCurrentLevel('level1');
            }}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </div>

      {/* LEVEL 1: Muscle Groups Grid */}
      {currentLevel === 'level1' && (
        <MuscleGrid
          summaries={muscleSummaries}
          onSelectMuscle={handleSelectMuscleGroup}
          isLoading={isSummariesLoading}
        />
      )}

      {/* LEVEL 2: Filtered Exercise List */}
      {currentLevel === 'level2' && (
        <div className="space-y-4">
          {/* Level 2 Sub-Header with Back Navigation */}
          <div className="flex items-center justify-between p-3.5 bg-slate-900/90 border border-slate-800 rounded-2xl shadow-sm">
            <button
              type="button"
              onClick={handleBackToMuscles}
              className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-orange-400 transition-colors min-h-[44px] px-2 -ml-2 rounded-xl"
            >
              <ArrowLeft className="w-4 h-4 text-orange-400" />
              <span>All Muscle Groups</span>
            </button>

            <div className="text-right">
              <span className="text-xs font-black text-white">
                {selectedSummary ? selectedSummary.displayName : selectedMuscle !== 'ALL' ? selectedMuscle : 'All Muscles'}
              </span>
              <span className="block text-[10px] text-orange-400 font-semibold">
                {exercises.length} results
              </span>
            </div>
          </div>

          {/* Equipment Filter Chips */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-orange-400" />
              <span>Equipment</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {EQUIPMENTS.map((eq) => (
                <button
                  key={eq}
                  onClick={() => setSelectedEquipment(eq)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[36px] ${
                    selectedEquipment === eq
                      ? 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/90'
                  }`}
                >
                  {eq.replace('_', ' ')}
                </button>
              ))}
            </div>
          </div>

          {/* Difficulty Filter Chips */}
          <div className="space-y-1.5">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Filter className="w-3.5 h-3.5 text-orange-400" />
              <span>Difficulty Level</span>
            </div>
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar -mx-1 px-1">
              {DIFFICULTIES.map((diff) => (
                <button
                  key={diff}
                  onClick={() => setSelectedDifficulty(diff)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all min-h-[36px] ${
                    selectedDifficulty === diff
                      ? 'bg-orange-500 text-slate-950 font-black shadow-md shadow-orange-500/20'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800/90'
                  }`}
                >
                  {diff}
                </button>
              ))}
            </div>
          </div>

          {/* Exercise List Cards Grid */}
          {isExercisesLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-28 rounded-2xl bg-slate-900/60 border border-slate-800 animate-pulse"
                />
              ))}
            </div>
          ) : exercises.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {exercises.map((exercise) => {
                const thumb = exercise.thumbnailUrl || exercise.demoImageUrl || exercise.mediaUrl;
                return (
                  <div
                    key={exercise.id}
                    onClick={() => handleOpenDetail(exercise)}
                    className="group bg-slate-900/90 hover:bg-slate-850 border border-slate-800/90 hover:border-orange-500/40 rounded-2xl p-3.5 flex items-center justify-between gap-3.5 transition-all duration-200 cursor-pointer shadow-sm hover:shadow-lg active:scale-[0.99]"
                  >
                    {/* Left: Thumbnail & Info */}
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-14 rounded-xl bg-slate-950 border border-slate-800 overflow-hidden shrink-0 flex items-center justify-center relative">
                        {thumb ? (
                          <img
                            src={thumb}
                            alt={exercise.name}
                            loading="lazy"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <Dumbbell className="w-6 h-6 text-slate-500" />
                        )}
                      </div>

                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <h3 className="text-sm font-bold text-white truncate group-hover:text-orange-400 transition-colors">
                            {exercise.name}
                          </h3>
                          {exercise.isCustom && (
                            <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-purple-950/80 text-purple-400 border border-purple-800/60">
                              Custom
                            </span>
                          )}
                        </div>

                        <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                          <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-orange-950/80 text-orange-400 border border-orange-800/60">
                            {exercise.primaryMuscle}
                          </span>
                          <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700/60">
                            {exercise.equipment}
                          </span>
                          <span
                            className={`text-[10px] font-semibold px-1.5 py-0.5 rounded-md border ${getDifficultyBadge(
                              exercise.difficulty
                            )}`}
                          >
                            {exercise.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: Chevron Arrow */}
                    <div className="p-1 rounded-lg text-slate-500 group-hover:text-orange-400 transition-all shrink-0">
                      <ChevronRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="py-14 text-center bg-slate-900/60 border border-slate-800 rounded-3xl space-y-3">
              <BookOpen className="w-10 h-10 text-slate-600 mx-auto" />
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-white">No exercises found</h3>
                <p className="text-xs text-slate-400">
                  Try adjusting the filters, clearing search, or create a custom exercise.
                </p>
              </div>
              <div className="flex items-center justify-center gap-2 pt-2">
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedEquipment('ALL');
                    setSelectedDifficulty('ALL');
                  }}
                  className="px-3 py-1.5 bg-slate-800 text-slate-300 text-xs font-semibold rounded-xl"
                >
                  Reset Filters
                </button>
                <button
                  onClick={() => setIsCustomModalOpen(true)}
                  className="px-3 py-1.5 bg-orange-500 text-slate-950 text-xs font-bold rounded-xl"
                >
                  Add Custom Exercise
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Level 3: Exercise Detail Modal */}
      <ExerciseDetailModal
        exercise={selectedExerciseForModal}
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
      />

      {/* Create Custom Exercise Modal */}
      <CreateCustomExerciseModal
        isOpen={isCustomModalOpen}
        onClose={() => setIsCustomModalOpen(false)}
        onExerciseCreated={handleCustomExerciseCreated}
      />
    </div>
  );
};
