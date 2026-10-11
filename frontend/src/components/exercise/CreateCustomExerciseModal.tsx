import React, { useState } from 'react';
import type { MuscleGroup, Equipment, Difficulty, Exercise } from '../../types';
import { exerciseService } from '../../services/exerciseService';
import { Plus, X, Loader2, Check } from 'lucide-react';

interface CreateCustomExerciseModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExerciseCreated: (exercise: Exercise) => void;
}

const MUSCLE_OPTIONS: MuscleGroup[] = [
  'CHEST',
  'BACK',
  'SHOULDERS',
  'BICEPS',
  'TRICEPS',
  'FOREARMS',
  'ABS',
  'GLUTES',
  'QUADRICEPS',
  'HAMSTRINGS',
  'CALVES',
  'TRAPS',
  'CARDIO',
];

const EQUIPMENT_OPTIONS: Equipment[] = [
  'BARBELL',
  'DUMBBELL',
  'CABLE',
  'MACHINE',
  'BODYWEIGHT',
  'SMITH_MACHINE',
  'KETTLEBELL',
  'EZ_BAR',
];

const DIFFICULTY_OPTIONS: Difficulty[] = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'];

export const CreateCustomExerciseModal: React.FC<CreateCustomExerciseModalProps> = ({
  isOpen,
  onClose,
  onExerciseCreated,
}) => {
  const [name, setName] = useState<string>('');
  const [primaryMuscle, setPrimaryMuscle] = useState<MuscleGroup>('CHEST');
  const [secondaryMuscles, setSecondaryMuscles] = useState<string>('');
  const [equipment, setEquipment] = useState<Equipment>('BARBELL');
  const [difficulty, setDifficulty] = useState<Difficulty>('INTERMEDIATE');
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [stepsText, setStepsText] = useState<string>('');
  const [mistakesText, setMistakesText] = useState<string>('');
  const [defaultSets, setDefaultSets] = useState<number>(3);
  const [defaultReps, setDefaultReps] = useState<string>('8-12');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setErrorMessage('Please enter an exercise name.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    const stepsArray = stepsText
      .split('\n')
      .map((s) => s.trim())
      .filter(Boolean);

    const mistakesArray = mistakesText
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);

    const secondaryArray = secondaryMuscles
      .split(',')
      .map((s) => s.trim().toUpperCase())
      .filter(Boolean);

    try {
      const created = await exerciseService.createCustomExercise({
        name: name.trim(),
        primaryMuscle,
        secondaryMuscles: secondaryArray,
        equipment,
        difficulty,
        mediaUrl: mediaUrl.trim() || undefined,
        thumbnailUrl: mediaUrl.trim() || undefined,
        steps: stepsArray.length > 0 ? stepsArray : undefined,
        mistakes: mistakesArray.length > 0 ? mistakesArray : undefined,
        defaultSets,
        defaultReps,
      });

      onExerciseCreated(created);
      onClose();
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to create custom exercise.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-slate-900 border border-slate-800 rounded-t-3xl sm:rounded-2xl max-w-md w-full p-5 shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-orange-500/10 border border-orange-500/30 flex items-center justify-center text-orange-400">
              <Plus className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white">Create Custom Exercise</h3>
              <p className="text-[11px] text-slate-400">
                Personal movement customized for your coach
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

        {errorMessage && (
          <div className="p-3 bg-rose-950/40 border border-rose-900/60 rounded-xl text-xs text-rose-300">
            {errorMessage}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Exercise Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Incline Cable Y-Raise"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 min-h-[44px]"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Primary Muscle *
              </label>
              <select
                value={primaryMuscle}
                onChange={(e) => setPrimaryMuscle(e.target.value as MuscleGroup)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 min-h-[44px]"
              >
                {MUSCLE_OPTIONS.map((m) => (
                  <option key={m} value={m}>
                    {m}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Equipment *
              </label>
              <select
                value={equipment}
                onChange={(e) => setEquipment(e.target.value as Equipment)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 min-h-[44px]"
              >
                {EQUIPMENT_OPTIONS.map((eq) => (
                  <option key={eq} value={eq}>
                    {eq}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Difficulty
              </label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value as Difficulty)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 min-h-[44px]"
              >
                {DIFFICULTY_OPTIONS.map((d) => (
                  <option key={d} value={d}>
                    {d}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-300 block mb-1">
                Default Sets & Reps
              </label>
              <div className="flex gap-1.5">
                <input
                  type="number"
                  min="1"
                  max="10"
                  value={defaultSets}
                  onChange={(e) => setDefaultSets(Number(e.target.value))}
                  className="w-16 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs text-center min-h-[44px]"
                  title="Sets"
                />
                <input
                  type="text"
                  value={defaultReps}
                  onChange={(e) => setDefaultReps(e.target.value)}
                  placeholder="8-12"
                  className="flex-1 px-2 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs text-center min-h-[44px]"
                  title="Reps"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Secondary Muscles (comma-separated)
            </label>
            <input
              type="text"
              value={secondaryMuscles}
              onChange={(e) => setSecondaryMuscles(e.target.value)}
              placeholder="e.g. TRAPS, SHOULDERS"
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Media / Image URL (optional)
            </label>
            <input
              type="url"
              value={mediaUrl}
              onChange={(e) => setMediaUrl(e.target.value)}
              placeholder="https://..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500 min-h-[44px]"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Execution Steps (one step per line)
            </label>
            <textarea
              rows={3}
              value={stepsText}
              onChange={(e) => setStepsText(e.target.value)}
              placeholder="1. Set pulley at knee height&#10;2. Drive upwards with elbows flared&#10;3. Squeeze shoulder blades"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-300 block mb-1">
              Common Mistakes (one per line)
            </label>
            <textarea
              rows={2}
              value={mistakesText}
              onChange={(e) => setMistakesText(e.target.value)}
              placeholder="Flaring elbows too high&#10;Using torso swinging momentum"
              className="w-full p-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs focus:outline-none focus:border-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3 bg-orange-500 hover:bg-orange-600 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg shadow-orange-500/20 transition-all min-h-[46px]"
          >
            {isSubmitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Check className="w-4 h-4 stroke-[3]" />
            )}
            <span>Save Custom Exercise</span>
          </button>
        </form>
      </div>
    </div>
  );
};
