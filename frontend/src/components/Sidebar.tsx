import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  Dumbbell,
  BookOpen,
  LineChart,
  User,
  PlusCircle,
  LogOut,
  Flame,
  Utensils,
  Zap,
  History,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user, profile, logout } = useAuth();

  const navItems = [
    { to: '/', label: 'Today (Coach)', icon: Zap },
    { to: '/routines', label: 'Workouts & Splits', icon: Dumbbell },
    { to: '/workout/history', label: 'Workout History', icon: History },
    { to: '/exercises', label: 'Exercise Library', icon: BookOpen },
    { to: '/diet', label: 'Diet Coach', icon: Utensils },
    { to: '/progress', label: 'Analytics & PRs', icon: LineChart },
    { to: '/profile', label: 'Profile & Goals', icon: User },
  ];

  return (
    <aside className="hidden md:flex flex-col w-[240px] shrink-0 border-r border-slate-200 dark:border-slate-800/80 bg-white dark:bg-[#0b0f19] h-screen sticky top-0 p-4 justify-between z-20">
      <div className="space-y-6">
        {/* Top Logo */}
        <Link
          to="/"
          className="flex items-center gap-2.5 px-2 py-1 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-400 flex items-center justify-center text-slate-950 font-black shadow-md shadow-orange-500/20">
            <Flame className="w-5 h-5 fill-current" aria-hidden="true" />
          </div>
          <div className="flex items-center gap-1.5">
            <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
              FitTrack
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-orange-500/15 text-orange-600 dark:text-orange-400 border border-orange-500/30">
              PRO
            </span>
          </div>
        </Link>

        {/* Navigation Section */}
        <nav aria-label="Main Navigation" className="space-y-1">
          <div className="px-2 text-[11px] font-bold tracking-wider text-slate-400 dark:text-slate-500 uppercase mb-2">
            Menu
          </div>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 ${
                    isActive
                      ? 'bg-orange-500/10 text-orange-600 dark:text-orange-400 border border-orange-500/20 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-slate-100 dark:hover:bg-slate-900/60'
                  }`
                }
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* New Routine CTA */}
        <div className="pt-2">
          <Link
            to="/routines/new"
            className="flex items-center justify-center gap-2 w-full py-2.5 bg-slate-100 dark:bg-slate-900 hover:bg-slate-200 dark:hover:bg-slate-800 text-orange-600 dark:text-orange-400 border border-orange-500/30 rounded-xl font-bold text-xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
          >
            <PlusCircle className="w-4 h-4" aria-hidden="true" />
            <span>New Custom Routine</span>
          </Link>
        </div>
      </div>

      {/* User Card at Bottom */}
      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80">
        <div className="flex items-center justify-between p-2.5 rounded-2xl bg-slate-50 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800">
          <div className="min-w-0 flex-1 pr-2">
            <div className="text-xs font-bold text-slate-900 dark:text-white truncate">
              {user?.fullName || 'Alex Rivera'}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-orange-500/20 text-orange-600 dark:text-orange-400">
                {profile?.fitnessGoal || 'BULK'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={logout}
            aria-label="Log out of account"
            title="Log out"
            className="p-2 text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 rounded-xl hover:bg-rose-500/10 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 shrink-0"
          >
            <LogOut className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </aside>
  );
};
