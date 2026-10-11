import React, { useState } from 'react';
import { routineService } from '../services/routineService';
import type { Exercise } from '../types';
import { ExercisePicker } from '../components/exercise/ExercisePicker';
import { useNavigate } from 'react-router-dom';
import {
  Plus,
  Trash2,
  Save,
  ArrowLeft,
  Dumbbell,
  Clock,
  GripVertical,
  ChevronUp,
  ChevronDown,
  Layers,
  Sparkles,
  Minus,
} from 'lucide-react';

interface DayExerciseForm {
  exerciseId: number;
  exerciseName: string;
  primaryMuscle?: string;
  equipment?: string;
  thumbnailUrl?: string;
  targetSets: number;
  targetRepRange: string;
  restSeconds: number;
}

interface DayForm {
  dayName: string;
  exercises: DayExerciseForm[];
}

export const CreateRoutine: React.FC = () => {

  const [name, setName] = useState<string>('');
  const [description, setDescription] = useState<string>('');
  const splitType = 'CUSTOM';
  const [days, setDays] = useState<DayForm[]>([
    { dayName: 'Day 1: Push / Upper', exercises: [] },
  ]);

  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(0);
  const [showExercisePicker, setShowExercisePicker] = useState<boolean>(false);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [draggedExIdx, setDraggedExIdx] = useState<number | null>(null);

  const navigate = useNavigate();

  // Day Management
  const addDay = () => {
    setDays((prev) => [
      ...prev,
      { dayName: `Day ${prev.length + 1}: Custom`, exercises: [] },
    ]);
    setSelectedDayIdx(days.length);
  };

  const removeDay = (index: number) => {
    if (days.length <= 1) return;
    setDays((prev) => prev.filter((_, i) => i !== index));
    if (selectedDayIdx >= index) {
      setSelectedDayIdx((prev) => Math.max(0, prev - 1));
    }
  };

  // Add Multi-selected Exercises to Routine Day
  const handleAddExercisesToDay = (selectedList: Exercise[]) => {
    const updated = [...days];
    const currentDay = updated[selectedDayIdx];
    const existingIds = new Set(currentDay.exercises.map((e) => e.exerciseId));

    selectedList.forEach((ex) => {
      if (!existingIds.has(ex.id)) {
        currentDay.exercises.push({
          exerciseId: ex.id,
          exerciseName: ex.name,
          primaryMuscle: ex.primaryMuscle,
          equipment: ex.equipment,
          thumbnailUrl: ex.thumbnailUrl || ex.demoImageUrl,
          targetSets: ex.defaultSets && ex.defaultSets > 0 ? ex.defaultSets : 3,
          targetRepRange: ex.defaultReps && ex.defaultReps.trim() ? ex.defaultReps : '8-12',
          restSeconds: 90,
        });
      }
    });

    setDays(updated);
  };

  // Update Exercise Parameters
  const updateExercise = (
    dayIdx: number,
    exIdx: number,
    field: keyof DayExerciseForm,
    val: any
  ) => {
    const updated = [...days];
    updated[dayIdx].exercises[exIdx] = {
      ...updated[dayIdx].exercises[exIdx],
      [field]: val,
    };
    setDays(updated);
  };

  // Remove Exercise
  const removeExerciseFromDay = (dayIdx: number, exIdx: number) => {
    const updated = [...days];
    updated[dayIdx].exercises.splice(exIdx, 1);
    setDays(updated);
  };

  // Reordering (Up / Down & Drag-to-reorder)
  const moveExercise = (dayIdx: number, fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= days[dayIdx].exercises.length) return;
    const updated = [...days];
    const item = updated[dayIdx].exercises.splice(fromIdx, 1)[0];
    updated[dayIdx].exercises.splice(toIdx, 0, item);
    setDays(updated);
  };

  // Drag and drop handlers
  const handleDragStart = (idx: number) => {
    setDraggedExIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (targetIdx: number) => {
    if (draggedExIdx === null || draggedExIdx === targetIdx) return;
    moveExercise(selectedDayIdx, draggedExIdx, targetIdx);
    setDraggedExIdx(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    setIsSubmitting(true);
    try {
      await routineService.createRoutine({
        name,
        description,
        splitType,
        days: days.map((d, dIdx) => ({
          dayName: d.dayName,
          dayOrder: dIdx + 1,
          exercises: d.exercises.map((ex, exIdx) => ({
            exerciseId: ex.exerciseId,
            exerciseOrder: exIdx + 1,
            targetSets: ex.targetSets,
            targetRepRange: ex.targetRepRange,
            restSeconds: ex.restSeconds,
          })),
        })),
      });
      navigate('/routines');
    } catch (err) {
      alert('Failed to save routine');
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentDay = days[selectedDayIdx] || days[0];
  const alreadySelectedIds = currentDay.exercises.map((e) => e.exerciseId);

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-24 md:pb-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/routines')}
          className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Routines</span>
        </button>
        <h1 className="text-xl font-black text-white flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-emerald-400" />
          Create Custom Routine
        </h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title & Notes Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-4 shadow-xl">
          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Routine Title *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. 4-Day Power Hypertrophy Split"
              className="w-full px-4 py-3 bg-slate-950 border border-slate-800 rounded-2xl text-white text-sm focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5">
              Description & Coaching Focus
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Focus on progressive overload, compound movements and double progression..."
              rows={2}
              className="w-full px-4 py-2.5 bg-slate-950 border border-slate-800 rounded-2xl text-white text-xs focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-colors"
            />
          </div>
        </div>

        {/* Workout Days & Exercises Manager */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-5 shadow-xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-black text-white flex items-center gap-2">
                <Dumbbell className="w-5 h-5 text-emerald-400" />
                Routine Days & Split Structure
              </h2>
              <p className="text-[11px] text-slate-400 mt-0.5">
                Organize your weekly schedule and assign muscle-targeted movements
              </p>
            </div>

            <button
              type="button"
              onClick={addDay}
              className="min-h-[44px] flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-bold text-emerald-400 rounded-xl border border-slate-700 btn-press"
            >
              <Plus className="w-4 h-4" />
              <span>Add Day</span>
            </button>
          </div>

          {/* Days Tabs (Thumb-friendly scroll) */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
            {days.map((day, idx) => (
              <div
                key={idx}
                className={`min-h-[44px] px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 cursor-pointer border ${
                  selectedDayIdx === idx
                    ? 'bg-emerald-500 text-slate-950 border-emerald-400 shadow-md shadow-emerald-500/20'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700'
                }`}
                onClick={() => setSelectedDayIdx(idx)}
              >
                <span>{day.dayName || `Day ${idx + 1}`}</span>
                {days.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeDay(idx);
                    }}
                    aria-label={`Delete Day ${idx + 1}`}
                    className={`p-1 rounded-lg hover:bg-black/20 ${
                      selectedDayIdx === idx ? 'text-slate-950' : 'text-slate-500 hover:text-rose-400'
                    }`}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Active Day Configuration Panel */}
          {currentDay && (
            <div className="p-4 sm:p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-5">
              {/* Day Name Field */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex-1">
                  <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                    Day Name
                  </label>
                  <input
                    type="text"
                    value={currentDay.dayName}
                    onChange={(e) => {
                      const updated = [...days];
                      updated[selectedDayIdx].dayName = e.target.value;
                      setDays(updated);
                    }}
                    className="w-full px-3.5 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white text-xs font-bold focus:outline-none focus:border-emerald-500"
                  />
                </div>

                <div className="self-end sm:self-center">
                  {/* + Add Exercise Primary Action */}
                  <button
                    type="button"
                    onClick={() => setShowExercisePicker(true)}
                    className="min-h-[44px] flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black rounded-xl shadow-md shadow-emerald-500/20 btn-press"
                  >
                    <Plus className="w-4 h-4 stroke-[3]" />
                    <span>Add Exercise</span>
                  </button>
                </div>
              </div>

              {/* Exercises in This Day */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    Exercises ({currentDay.exercises.length})
                  </span>
                  <span className="text-[10px] text-slate-500">
                    Drag handle or use arrows to reorder
                  </span>
                </div>

                {currentDay.exercises.length === 0 ? (
                  <div className="p-8 text-center border border-dashed border-slate-800 rounded-2xl space-y-3 bg-slate-900/30">
                    <Dumbbell className="w-8 h-8 text-slate-600 mx-auto" />
                    <p className="text-xs font-bold text-slate-300">No exercises added to this day yet</p>
                    <p className="text-[11px] text-slate-500 max-w-xs mx-auto">
                      Tap "+ Add Exercise" above to open the muscle-first picker and choose movements.
                    </p>
                    <button
                      type="button"
                      onClick={() => setShowExercisePicker(true)}
                      className="inline-flex items-center gap-1.5 px-4 py-2 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 text-xs font-bold rounded-xl hover:bg-emerald-500/30"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Pick Exercises
                    </button>
                  </div>
                ) : (
                  currentDay.exercises.map((ex, exIdx) => (
                    <div
                      key={`${ex.exerciseId}-${exIdx}`}
                      draggable
                      onDragStart={() => handleDragStart(exIdx)}
                      onDragOver={handleDragOver}
                      onDrop={() => handleDrop(exIdx)}
                      className="p-3.5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 transition-all hover:border-slate-700"
                    >
                      {/* Top Row: Reorder Handle, Exercise Title, Muscle Tag, Remove Button */}
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 min-w-0">
                          {/* Drag Handle */}
                          <div
                            className="cursor-grab active:cursor-grabbing text-slate-500 hover:text-slate-300 p-1"
                            title="Drag to reorder"
                          >
                            <GripVertical className="w-4 h-4" />
                          </div>

                          {/* Exercise Number */}
                          <span className="w-5 h-5 rounded-md bg-slate-800 text-slate-300 text-[10px] font-black flex items-center justify-center shrink-0">
                            {exIdx + 1}
                          </span>

                          <div className="min-w-0">
                            <h4 className="text-xs sm:text-sm font-black text-white truncate">
                              {ex.exerciseName}
                            </h4>
                            <div className="flex items-center gap-1.5 text-[10px] text-slate-400 font-semibold">
                              <span className="text-emerald-400">{ex.primaryMuscle}</span>
                              {ex.equipment && <span>• {ex.equipment}</span>}
                            </div>
                          </div>
                        </div>

                        {/* Order Buttons & Delete */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            type="button"
                            onClick={() => moveExercise(selectedDayIdx, exIdx, exIdx - 1)}
                            disabled={exIdx === 0}
                            aria-label="Move exercise up"
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-400 flex items-center justify-center"
                          >
                            <ChevronUp className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => moveExercise(selectedDayIdx, exIdx, exIdx + 1)}
                            disabled={exIdx === currentDay.exercises.length - 1}
                            aria-label="Move exercise down"
                            className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-30 disabled:hover:bg-slate-800 text-slate-400 flex items-center justify-center"
                          >
                            <ChevronDown className="w-4 h-4" />
                          </button>
                          <button
                            type="button"
                            onClick={() => removeExerciseFromDay(selectedDayIdx, exIdx)}
                            aria-label={`Remove ${ex.exerciseName}`}
                            className="w-8 h-8 rounded-lg hover:bg-rose-500/20 text-slate-500 hover:text-rose-400 flex items-center justify-center transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      {/* Bottom Row: Editable Sets, Reps, Rest Steppers */}
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-slate-800/80">
                        {/* Sets Stepper */}
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                            Sets
                          </span>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() =>
                                updateExercise(
                                  selectedDayIdx,
                                  exIdx,
                                  'targetSets',
                                  Math.max(1, ex.targetSets - 1)
                                )
                              }
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center btn-press"
                              aria-label="Decrease sets"
                            >
                              <Minus className="w-3.5 h-3.5" />
                            </button>
                            <span className="text-xs font-black text-white w-6 text-center">
                              {ex.targetSets}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                updateExercise(
                                  selectedDayIdx,
                                  exIdx,
                                  'targetSets',
                                  ex.targetSets + 1
                                )
                              }
                              className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-white flex items-center justify-center btn-press"
                              aria-label="Increase sets"
                            >
                              <Plus className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        {/* Reps Selector / Input */}
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                            Reps
                          </span>
                          <input
                            type="text"
                            value={ex.targetRepRange}
                            onChange={(e) =>
                              updateExercise(selectedDayIdx, exIdx, 'targetRepRange', e.target.value)
                            }
                            placeholder="8-12"
                            className="w-20 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-white text-xs font-black text-center focus:outline-none focus:border-emerald-500"
                          />
                        </div>

                        {/* Rest Timer Selector */}
                        <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between gap-2">
                          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1 shrink-0">
                            <Clock className="w-3 h-3 text-emerald-400" /> Rest
                          </span>
                          <select
                            value={ex.restSeconds}
                            onChange={(e) =>
                              updateExercise(
                                selectedDayIdx,
                                exIdx,
                                'restSeconds',
                                Number(e.target.value)
                              )
                            }
                            className="bg-slate-900 border border-slate-800 text-white text-xs font-bold rounded-lg px-2 py-1 focus:outline-none focus:border-emerald-500"
                          >
                            <option value={45}>45s</option>
                            <option value={60}>60s</option>
                            <option value={90}>90s</option>
                            <option value={120}>2 min</option>
                            <option value={180}>3 min</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !name.trim()}
          className="w-full py-4 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-emerald-500/20 flex items-center justify-center gap-2 btn-press disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>Save Routine</span>
        </button>
      </form>

      {/* REUSABLE EXERCISE PICKER BOTTOM SHEET */}
      <ExercisePicker
        isOpen={showExercisePicker}
        onClose={() => setShowExercisePicker(false)}
        onSelectExercises={handleAddExercisesToDay}
        alreadySelectedIds={alreadySelectedIds}
        title={`Add to ${currentDay.dayName || 'Routine Day'}`}
        submitButtonText="Add to Routine Day"
      />
    </div>
  );
};
