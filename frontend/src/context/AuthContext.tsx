import React, { createContext, useContext, useState, useEffect } from 'react';
import type { User, UserProfile } from '../types';
import { authService } from '../services/authService';
import { getAuthToken } from '../services/api';

interface AuthContextType {
  user: User | null;
  profile: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (payload: any) => Promise<void>;
  logout: () => void;
  updateProfile: (profile: Partial<UserProfile>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const initAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          const prof = await authService.getProfile();
          setProfile(prof);
          setUser({
            userId: prof.id,
            email: 'user@fittrack.com',
            fullName: 'FitTrack Gym Goer',
            role: 'ROLE_USER',
            token,
            profile: prof,
          });
        } catch (e) {
          authService.logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, []);

  const login = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const data = await authService.login(email, pass);
      setUser(data);
      if (data.profile) setProfile(data.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (payload: any) => {
    setIsLoading(true);
    try {
      const data = await authService.register(payload);
      setUser(data);
      if (data.profile) setProfile(data.profile);
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async (updated: Partial<UserProfile>) => {
    const newProf = await authService.updateProfile(updated);
    setProfile(newProf);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isAuthenticated: !!user,
        isLoading,
        login,
        register,
        logout,
        updateProfile,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
