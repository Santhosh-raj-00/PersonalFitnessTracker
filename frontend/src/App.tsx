import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Layout } from './components/Layout';

import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { Exercises } from './pages/Exercises';
import { ExerciseDetail } from './pages/ExerciseDetail';
import { Routines } from './pages/Routines';
import { RoutineDetail } from './pages/RoutineDetail';
import { CreateRoutine } from './pages/CreateRoutine';
import { ActiveWorkout } from './pages/ActiveWorkout';
import { WorkoutHistory } from './pages/WorkoutHistory';
import { Progress } from './pages/Progress';
import { Diet } from './pages/Diet';
import { Profile } from './pages/Profile';

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-orange-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        {/* Navigation & Exercise Library (Phase 1) */}
        <Route path="/library" element={<Exercises />} />
        <Route path="/exercises" element={<Exercises />} />
        <Route path="/exercises/:id" element={<ExerciseDetail />} />
        {/* Workouts & Routines */}
        <Route path="/workouts" element={<Routines />} />
        <Route path="/routines" element={<Routines />} />
        <Route path="/routines/new" element={<CreateRoutine />} />
        <Route path="/routines/:id" element={<RoutineDetail />} />
        <Route path="/workout/active" element={<ActiveWorkout />} />
        <Route path="/workout/history" element={<WorkoutHistory />} />
        <Route path="/workouts/history" element={<WorkoutHistory />} />
        <Route path="/history" element={<WorkoutHistory />} />
        {/* Diet Coach */}
        <Route path="/diet" element={<Diet />} />
        {/* Analytics & Profile */}
        <Route path="/progress" element={<Progress />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
};

export default App;
