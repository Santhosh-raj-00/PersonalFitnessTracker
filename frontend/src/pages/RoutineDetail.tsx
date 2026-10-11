import React, { useState, useEffect } from 'react';
import { routineService } from '../services/routineService';
import { workoutService } from '../services/workoutService';
import type { Routine } from '../types';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Play, Dumbbell, Clock, Layers } from 'lucide-react';

export const RoutineDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [routine, setRoutine] = useState<Routine | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    if (id) {
      routineService.getRoutineById(Number(id)).then(setRoutine).catch(console.error).finally(() => setIsLoading(false));
    }
  }, [id]);

  const handleStartDay = async (routineDayId: number, dayName: string) => {
    try {
      await workoutService.startWorkout(routineDayId, dayName);
      navigate('/workout/active');
    } catch (err) {
      navigate('/workout/active');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-10 h-10 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!routine) return <div>Routine not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-20 md:pb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/routines')}
          className="flex items-center gap-1.5 text-xs font-semibold text-gray-400 hover:text-white"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Routines</span>
        </button>
        <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-950 text-emerald-400 border border-emerald-800">
          {routine.splitType}
        </span>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-3xl p-6 shadow-xl space-y-3">
        <h1 className="text-2xl font-black text-white">{routine.name}</h1>
        <p className="text-xs text-gray-400 leading-relaxed">{routine.description}</p>
      </div>

      <div className="space-y-4">
        {routine.days?.map((day) => (
          <div key={day.id} className="bg-gray-900/90 border border-gray-800 rounded-3xl p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-800">
              <h2 className="text-base font-bold text-white flex items-center gap-2">
                <Layers className="w-4 h-4 text-emerald-400" />
                {day.dayName}
              </h2>

              <button
                onClick={() => handleStartDay(day.id, day.dayName)}
                className="flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-emerald-500 to-teal-500 text-gray-950 font-black text-xs rounded-xl shadow-md btn-press"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Start Day</span>
              </button>
            </div>

            <div className="space-y-2">
              {day.exercises?.map((re) => (
                <div key={re.id} className="p-3 bg-gray-950 border border-gray-800/80 rounded-2xl flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-gray-800 flex items-center justify-center shrink-0">
                      <Dumbbell className="w-5 h-5 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">{re.exerciseName}</div>
                      <div className="text-[10px] text-gray-400 font-medium">
                        Target: {re.targetSets} sets × {re.targetRepRange} reps
                      </div>
                    </div>
                  </div>

                  <div className="text-right text-[11px] text-gray-400 flex items-center gap-1">
                    <Clock className="w-3 h-3 text-emerald-400" />
                    <span>{re.restSeconds}s rest</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
