import React from 'react';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { Flame, Sun, Moon, LogOut, Play } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-gray-950/80 border-b border-gray-800/80 backdrop-blur-md px-4 py-3">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-emerald-500 via-teal-500 to-cyan-400 flex items-center justify-center text-gray-950 font-black shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
            <Flame className="w-5 h-5 fill-current" />
          </div>
          <div>
            <span className="text-xl font-black tracking-tight text-white group-hover:text-emerald-400 transition-colors">
              FitTrack
            </span>
            <span className="hidden sm:inline-block ml-2 text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              PRO
            </span>
          </div>
        </Link>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            onClick={() => navigate('/workout/active')}
            className="flex items-center gap-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-gray-950 font-black text-xs rounded-xl shadow-md shadow-emerald-500/15 btn-press"
          >
            <Play className="w-3.5 h-3.5 fill-current" />
            <span>Workout</span>
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 text-gray-400 hover:text-white bg-gray-900 border border-gray-800 rounded-xl transition-colors"
            title="Toggle theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-cyan-400" />}
          </button>

          {user && (
            <div className="flex items-center gap-2 pl-2 border-l border-gray-800">
              <div className="hidden sm:block text-right">
                <div className="text-xs font-bold text-white truncate max-w-[120px]">
                  {user.fullName}
                </div>
                <div className="text-[10px] text-emerald-400 font-semibold uppercase">
                  {user.profile?.fitnessGoal || 'FITNESS'}
                </div>
              </div>

              <button
                onClick={logout}
                className="p-2 text-gray-400 hover:text-rose-400 bg-gray-900 border border-gray-800 rounded-xl transition-colors"
                title="Logout"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
