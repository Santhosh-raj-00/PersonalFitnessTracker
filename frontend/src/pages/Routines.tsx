import React, { useState, useEffect } from 'react';
import { routineService } from '../services/routineService';
import { workoutService } from '../services/workoutService';
import type { Routine } from '../types';
import { useNavigate } from 'react-router-dom';
import { Dumbbell, PlusCircle, Play, ChevronRight, Layers, Sparkles, History } from 'lucide-react';

export const Routines: React.FC = () => {
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    setIsLoading(true);
    try {
      const data = await routineService.getRoutines();
      setRoutines(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartDay = async (routineDayId: number, dayName: string) => {
    try {
      await workoutService.startWorkout(routineDayId, dayName);
      navigate('/workout/active');
    } catch (err) {
      navigate('/workout/active');
    }
  };

  return (
    <div className="space-y-6 pb-20 md:pb-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Dumbbell className="w-6 h-6 text-orange-500" />
            Routines & Workout Splits
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Choose a proven template or build your custom split
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => navigate('/workout/history')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            <History className="w-4 h-4 text-orange-500" />
            <span>Workout History</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/routines/new')}
            className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create Routine</span>
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div key={n} className="h-44 bg-gray-900/60 rounded-3xl border border-gray-800 animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-6">
          {routines.map((routine) => (
            <div
              key={routine.id}
              className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-xl transition-all hover:border-gray-700"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-800">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
                      {routine.splitType}
                    </span>
                    {routine.isTemplate && (
                      <span className="text-[10px] font-semibold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded-full border border-amber-800 flex items-center gap-1">
                        <Sparkles className="w-3 h-3" /> Template
                      </span>
                    )}
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1.5">{routine.name}</h2>
                  <p className="text-xs text-gray-400 mt-0.5">{routine.description}</p>
                </div>

                <button
                  onClick={() => navigate(`/routines/${routine.id}`)}
                  className="self-start sm:self-center px-3 py-1.5 bg-gray-800 hover:bg-gray-700 text-gray-200 font-semibold text-xs rounded-xl border border-gray-700 flex items-center gap-1 transition-colors"
                >
                  <span>Edit / Details</span>
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>

              {/* Days List */}
              <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                {routine.days?.map((day) => (
                  <div
                    key={day.id}
                    className="bg-gray-950 border border-gray-800/80 p-3.5 rounded-2xl flex flex-col justify-between hover:border-emerald-500/30 transition-colors"
                  >
                    <div>
                      <div className="text-xs font-bold text-white flex items-center gap-1.5">
                        <Layers className="w-3.5 h-3.5 text-emerald-400" />
                        {day.dayName}
                      </div>
                      <div className="text-[11px] text-gray-400 mt-1">
                        {day.exercises?.length || 0} exercises ({day.exercises?.map((e) => e.exerciseName).slice(0, 3).join(', ')}...)
                      </div>
                    </div>

                    <button
                      onClick={() => handleStartDay(day.id, day.dayName)}
                      className="mt-3 w-full py-2 bg-emerald-600/90 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-md flex items-center justify-center gap-1.5 btn-press transition-colors"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Workout</span>
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
