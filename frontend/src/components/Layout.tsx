import React from 'react';
import { Sidebar } from './Sidebar';
import { BottomNav } from './BottomNav';
import { Header } from './Header';
import { OfflineIndicator } from './OfflineIndicator';

interface LayoutProps {
  children: React.ReactNode;
}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 flex flex-col md:flex-row antialiased overflow-x-hidden selection:bg-orange-500 selection:text-slate-950">
      <OfflineIndicator />
      
      {/* Desktop Fixed Left Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        <Header />
        
        <main
          id="main-content"
          tabIndex={-1}
          className="flex-1 p-4 sm:p-6 md:p-8 max-w-7xl w-full mx-auto pb-24 md:pb-8 focus:outline-none"
        >
          {children}
        </main>
      </div>

      {/* Mobile Fixed Bottom Nav */}
      <BottomNav />
    </div>
  );
};
