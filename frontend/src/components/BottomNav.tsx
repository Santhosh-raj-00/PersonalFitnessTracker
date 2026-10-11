import React from 'react';
import { NavLink } from 'react-router-dom';
import { Zap, Dumbbell, BookOpen, Utensils, User } from 'lucide-react';

export const BottomNav: React.FC = () => {
  const navItems = [
    { to: '/', label: 'Today', icon: Zap },
    { to: '/routines', label: 'Workouts', icon: Dumbbell },
    { to: '/exercises', label: 'Library', icon: BookOpen },
    { to: '/diet', label: 'Diet', icon: Utensils },
    { to: '/profile', label: 'Profile', icon: User },
  ];

  return (
    <nav
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#090d16]/95 border-t border-slate-200 dark:border-slate-800/80 backdrop-blur-md px-1 py-1 shadow-2xl pb-[max(8px,env(safe-area-inset-bottom,4px))]"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center min-w-[58px] min-h-[48px] py-1 px-1 rounded-2xl transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500 active:scale-95 ${
                  isActive
                    ? 'text-orange-600 dark:text-orange-400 font-black'
                    : 'text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 font-medium'
                }`
              }
            >
              <div
                className={`p-1 rounded-xl transition-all ${
                  item.to === '/' ? '' : ''
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" aria-hidden="true" />
              </div>
              <span className="text-[10px] tracking-tight leading-none mt-0.5">
                {item.label}
              </span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
