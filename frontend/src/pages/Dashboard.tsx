import React, { useState, useEffect } from 'react';
import { progressService } from '../services/progressService';
import { workoutService } from '../services/workoutService';
import type { DashboardSummary } from '../types';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Flame,
  Play,
  Trophy,
  TrendingUp,
  ArrowRight,
  BarChart,
  Plus,
  Zap,
  History,
} from 'lucide-react';
import { BarChart as ReBarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

export const Dashboard: React.FC = () => {
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { user, profile } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    setIsLoading(true);
    try {
      const data = await progressService.getDashboardSummary();
      setSummary(data);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuickWorkout = async (routineDayId?: number, name?: string) => {
    try {
      await workoutService.startWorkout(routineDayId, name || 'Quick Workout');
      navigate('/workout/active');
    } catch (err) {
      navigate('/workout/active');
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Loading your workout stats...</span>
        </div>
      </div>
    );
  }

  const streakDays = summary?.activeStreakDays || 0;
  const totalVolume = summary?.totalVolumeThisWeekKg || 0;
  const totalWorkouts = summary?.totalWorkoutsCompleted || 0;
  const recentPRs = summary?.recentPRs || [];
  const recommendedRoutines = summary?.recommendedRoutines || [];

  return (
    <div className="space-y-6">
      {/* Hero Card */}
      <section
        aria-label="Dashboard Welcome Banner"
        className="relative overflow-hidden bg-gradient-to-r from-slate-900 via-slate-900 to-orange-950/60 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl"
      >
        <div className="absolute right-0 top-0 bottom-0 w-1/2 bg-gradient-to-l from-orange-500/10 to-transparent pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-400 bg-orange-950/90 px-3 py-1 rounded-full border border-orange-800/80">
                Welcome back, {user?.fullName?.split(' ')[0] || 'Athlete'}
              </span>
              <span className="text-xs text-slate-300 font-semibold bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                Goal: <strong className="text-orange-400">{profile?.fitnessGoal || 'BULK'}</strong>
              </span>
            </div>

            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-white tracking-tight leading-tight">
              Ready to crush today's workout?
            </h1>

            <p className="text-sm text-slate-300 leading-relaxed font-medium">
              Log sets in 1 tap, auto-detect PRs, and track your progressive overload history.
            </p>
          </div>

          <div className="shrink-0 flex items-center gap-2.5 flex-wrap">
            <button
              type="button"
              onClick={() => handleStartQuickWorkout()}
              className="flex items-center gap-2.5 px-6 py-3.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl shadow-orange-500/25 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-95"
            >
              <Play className="w-4 h-4 fill-current" aria-hidden="true" />
              <span>Start Workout Now</span>
            </button>
            <button
              type="button"
              onClick={() => navigate('/workout/history')}
              className="flex items-center gap-2 px-4 py-3.5 bg-slate-800/90 hover:bg-slate-700/90 text-white font-bold text-sm rounded-2xl border border-slate-700 shadow-md transition-all active:scale-95"
            >
              <History className="w-4 h-4 text-orange-400" aria-hidden="true" />
              <span>Workout History</span>
            </button>
          </div>
        </div>
      </section>

      {/* Grid of Rounded Cards (subtle border, p-5) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Today's Workout Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Workout</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
              <Zap className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="text-lg font-bold text-slate-900 dark:text-white truncate">
            {recommendedRoutines[0]?.days?.[0]?.dayName || 'Push - Chest & Triceps'}
          </div>
          <button
            type="button"
            onClick={() => handleStartQuickWorkout(recommendedRoutines[0]?.days?.[0]?.id, recommendedRoutines[0]?.days?.[0]?.dayName)}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 pt-1"
          >
            Start Day 1 <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>

        {/* Workout Streak Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Streak</span>
            <div className="w-9 h-9 rounded-xl bg-orange-500/15 text-orange-500 flex items-center justify-center">
              <Flame className="w-5 h-5 fill-current" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {streakDays} <span className="text-xs font-normal text-slate-400">Days</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Keep lifting to build streak</div>
        </div>

        {/* Recent PRs Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Recent PRs</span>
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-500 flex items-center justify-center">
              <Trophy className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {recentPRs.length} <span className="text-xs font-normal text-slate-400">Records</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium truncate">
            {recentPRs[0] ? `${recentPRs[0].exerciseName}: ${recentPRs[0].recordValue}kg` : 'No PRs yet'}
          </div>
        </div>

        {/* Total Volume Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">7-Day Volume</span>
            <div className="w-9 h-9 rounded-xl bg-slate-500/15 text-slate-400 flex items-center justify-center">
              <TrendingUp className="w-5 h-5" aria-hidden="true" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900 dark:text-white">
            {totalVolume.toLocaleString()} <span className="text-xs font-normal text-slate-400">kg</span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">Across {totalWorkouts} sessions</div>
          <button
            type="button"
            onClick={() => navigate('/workout/history')}
            className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 pt-1"
          >
            <span>View Full History</span>
            <ArrowRight className="w-3.5 h-3.5" aria-hidden="true" />
          </button>
        </div>
      </div>

      {/* Analytics & Weekly Volume Chart Card */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Weekly Volume Chart Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <BarChart className="w-5 h-5 text-orange-500" aria-hidden="true" />
                Weekly Volume Breakdown
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Total weight lifted per day (kg)</p>
            </div>
            <span className="text-xs font-semibold text-orange-600 dark:text-orange-400 bg-orange-500/10 px-2.5 py-1 rounded-lg border border-orange-500/20">
              7 Days
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <ReBarChart data={summary?.weeklyVolumeChart || []}>
                <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                  formatter={(val: any) => [`${val} kg`, 'Volume']}
                />
                <Bar dataKey="value" fill="#f97316" radius={[6, 6, 0, 0]} />
              </ReBarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Body Weight Progress Chart Card */}
        <div className="bg-white dark:bg-[#111827] border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-amber-500" aria-hidden="true" />
                Body Weight Trend
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">Tracked weight over time (kg)</p>
            </div>
            <button
              type="button"
              onClick={() => navigate('/progress')}
              className="text-xs font-bold text-orange-600 dark:text-orange-400 hover:underline flex items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
            >
              Log Weight <Plus className="w-3.5 h-3.5" aria-hidden="true" />
            </button>
          </div>

          <div className="h-56 w-full">
            {summary?.bodyWeightChart && summary.bodyWeightChart.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={summary.bodyWeightChart}>
                  <XAxis dataKey="date" stroke="#64748b" fontSize={11} tickLine={false} />
                  <YAxis domain={['dataMin - 2', 'dataMax + 2']} stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff' }}
                    formatter={(val: any) => [`${val} kg`, 'Weight']}
                  />
                  <Line type="monotone" dataKey="value" stroke="#f59e0b" strokeWidth={3} dot={{ fill: '#f59e0b', r: 4 }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-center p-4">
                <span className="text-xs text-slate-500 mb-2">No weight measurements logged yet</span>
                <button
                  type="button"
                  onClick={() => navigate('/progress')}
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 text-xs font-semibold text-orange-600 dark:text-orange-400 rounded-xl"
                >
                  Log Body Weight
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
