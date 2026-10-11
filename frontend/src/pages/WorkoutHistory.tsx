import React, { useState, useEffect } from 'react';
import { workoutService } from '../services/workoutService';
import type { WorkoutSession } from '../types';
import { useNavigate } from 'react-router-dom';
import {
  History,
  Calendar,
  Dumbbell,
  Play,
  Trophy,
  ArrowRight,
  Clock,
} from 'lucide-react';

export const WorkoutHistory: React.FC = () => {
  const [history, setHistory] = useState<WorkoutSession[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadHistory();
  }, []);

  const loadHistory = async () => {
    setIsLoading(true);
    try {
      const data = await workoutService.getWorkoutHistory();
      setHistory(data);
    } catch (err) {
      console.error('Failed to load workout history:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (isoStr?: string) => {
    if (!isoStr) return 'Recent';
    const date = new Date(isoStr);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatTime = (isoStr?: string) => {
    if (!isoStr) return '';
    const date = new Date(isoStr);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  const totalVolumeAllTime = history.reduce((sum, s) => sum + (s.totalVolumeKg || 0), 0);
  const totalSetsAllTime = history.reduce((sum, s) => sum + (s.sets?.length || 0), 0);
  const totalPrsAllTime = history.reduce(
    (sum, s) => sum + (s.sets?.filter((set) => set.isPr)?.length || 0),
    0
  );

  return (
    <div className="space-y-6 pb-20 md:pb-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              Activity Log
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white flex items-center gap-2.5 mt-1">
            <History className="w-7 h-7 text-orange-500" aria-hidden="true" />
            Workout History
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Complete archive of your past workout sessions, volume achievements, and personal records.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => navigate('/routines')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 font-bold text-xs rounded-xl transition-colors"
          >
            <Dumbbell className="w-4 h-4 text-orange-500" aria-hidden="true" />
            <span>Routines & Splits</span>
          </button>

          <button
            type="button"
            onClick={() => navigate('/workout/active')}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>Active Workout</span>
          </button>
        </div>
      </div>

      {/* Aggregate Stats Overview Cards */}
      {!isLoading && history.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Workouts</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {history.length}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Sessions logged</div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Total Volume</div>
            <div className="text-2xl font-black text-orange-600 dark:text-orange-400 mt-1">
              {Math.round(totalVolumeAllTime).toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Cumulative load</div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Sets Completed</div>
            <div className="text-2xl font-black text-slate-900 dark:text-white mt-1">
              {totalSetsAllTime}
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Total sets tracked</div>
          </div>

          <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-4 shadow-sm">
            <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">PRs Achieved</div>
            <div className="text-2xl font-black text-amber-500 mt-1 flex items-center gap-1.5">
              <Trophy className="w-5 h-5 text-amber-500 shrink-0" aria-hidden="true" />
              <span>{totalPrsAllTime}</span>
            </div>
            <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Personal records</div>
          </div>
        </div>
      )}

      {/* Main List */}
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((n) => (
            <div
              key={n}
              className="h-32 bg-white dark:bg-[#111827] rounded-3xl border border-slate-200 dark:border-slate-800 animate-pulse"
            />
          ))}
        </div>
      ) : history.length > 0 ? (
        <div className="space-y-4">
          {history.map((session) => {
            const isCompleted = session.status === 'COMPLETED';
            const sessionPrs = session.sets?.filter((s) => s.isPr) || [];

            return (
              <div
                key={session.id}
                className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800/90 hover:border-orange-500/40 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all space-y-4"
              >
                {/* Header Row */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${
                          isCompleted
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 animate-pulse'
                        }`}
                      >
                        {session.status}
                      </span>

                      <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" aria-hidden="true" />
                        {formatDate(session.startTime)}
                      </span>

                      {session.startTime && (
                        <span className="text-xs text-slate-400 flex items-center gap-1">
                          <Clock className="w-3 h-3 text-slate-400" aria-hidden="true" />
                          {formatTime(session.startTime)}
                        </span>
                      )}

                      {sessionPrs.length > 0 && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30 flex items-center gap-1">
                          <Trophy className="w-3 h-3" aria-hidden="true" />
                          {sessionPrs.length} PR{sessionPrs.length > 1 ? 's' : ''}
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-slate-900 dark:text-white">
                      {session.sessionName || 'Workout Session'}
                    </h2>

                    {session.routineName && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        Split: <span className="text-slate-700 dark:text-slate-300 font-semibold">{session.routineName}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center gap-1">
                    <div className="text-right">
                      <div className="text-xl font-black text-orange-600 dark:text-orange-400">
                        {Math.round(session.totalVolumeKg || 0).toLocaleString()}{' '}
                        <span className="text-xs text-slate-400 font-normal">kg volume</span>
                      </div>
                      <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                        {session.sets?.length || 0} total sets logged
                      </div>
                    </div>

                    {!isCompleted && (
                      <button
                        type="button"
                        onClick={() => navigate('/workout/active')}
                        className="mt-1 flex items-center gap-1 text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline"
                      >
                        <span>Resume session</span>
                        <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Session Notes if any */}
                {session.notes && (
                  <p className="text-xs text-slate-600 dark:text-slate-300 italic bg-slate-50 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-200 dark:border-slate-800">
                    "{session.notes}"
                  </p>
                )}

                {/* Sets Pill Highlights */}
                {session.sets && session.sets.length > 0 ? (
                  <div>
                    <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                      Logged Sets
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {session.sets.map((set, sIdx) => (
                        <span
                          key={sIdx}
                          className={`text-xs font-semibold px-2.5 py-1.5 rounded-xl border flex items-center gap-1.5 ${
                            set.isPr
                              ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/30'
                              : 'bg-slate-100 dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800'
                          }`}
                        >
                          <span className="font-bold">{set.exerciseName}:</span>
                          <span>
                            {set.weightKg}kg × {set.reps}
                          </span>
                          {set.isPr && (
                            <span className="text-[10px] px-1 py-0.2 rounded bg-orange-500 text-slate-950 font-black">
                              PR
                            </span>
                          )}
                        </span>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-xs text-slate-400 italic">
                    No sets logged for this session.
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ) : (
        <div className="py-16 text-center bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-3xl p-8 space-y-4 shadow-sm">
          <div className="w-16 h-16 rounded-2xl bg-orange-500/10 text-orange-500 flex items-center justify-center mx-auto">
            <History className="w-8 h-8" aria-hidden="true" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900 dark:text-white">
              No workout history found
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
              You haven't logged any workouts yet. Start an active workout or select a split routine to record your first session!
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('/workout/active')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow-md shadow-orange-500/20 active:scale-95 transition-all"
          >
            <Play className="w-4 h-4 fill-current" aria-hidden="true" />
            <span>Start Your First Workout</span>
          </button>
        </div>
      )}
    </div>
  );
};
