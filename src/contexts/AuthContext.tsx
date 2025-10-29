"use client";

import React, { createContext, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth, AuthState } from '../hooks/useAuth';
import { AuthService } from '../lib/authService';

interface AuthContextType extends AuthState {
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext must be used within an AuthProvider');
  }
  return context;
};

interface AuthProviderProps {
  children: ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const authState = useAuth();
  const router = useRouter();

  const logout = async () => {
    try {
      await AuthService.logout();
      try {
        router.push('/login');
      } catch (e) {
        // ignore navigation errors in environments where router isn't available
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const value: AuthContextType = {
    ...authState,
    logout
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};