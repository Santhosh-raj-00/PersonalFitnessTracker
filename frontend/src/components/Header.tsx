import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ThemeToggle } from './ThemeToggle';
import { Flame, Play, History } from 'lucide-react';

export const Header: React.FC = () => {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-[#090d16]/80 border-b border-slate-200 dark:border-slate-800/80 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Mobile Logo */}
        <Link
          to="/"
          className="md:hidden flex items-center gap-2 font-black text-slate-900 dark:text-white text-lg focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-slate-950 shadow-sm">
            <Flame className="w-4 h-4 fill-current" aria-hidden="true" />
          </div>
          <span>FitTrack</span>
          <span className="text-[10px] font-bold uppercase px-1 py-0.5 rounded bg-orange-500/20 text-orange-600 dark:text-orange-400 border border-orange-500/30">
            PRO
          </span>
        </Link>

        <div className="hidden md:block text-xs font-semibold text-slate-500 dark:text-slate-400">
          Smart Gym Workout & Fitness Tracker
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-2 sm:gap-3 ml-auto">
          <button
            type="button"
            onClick={() => navigate('/workout/history')}
            title="Workout History"
            aria-label="View Workout History"
            className="p-2 text-slate-500 hover:text-orange-600 dark:text-slate-400 dark:hover:text-orange-400 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <History className="w-4 h-4" aria-hidden="true" />
          </button>

          <button
            type="button"
            onClick={() => navigate('/workout/active')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-400 hover:to-amber-400 text-slate-950 font-black text-xs rounded-xl shadow-md shadow-orange-500/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 transition-all active:scale-95 min-h-[38px]"
          >
            <Play className="w-3.5 h-3.5 fill-current" aria-hidden="true" />
            <span>Start Workout</span>
          </button>

          <ThemeToggle />
        </div>
      </div>
    </header>
  );
};
