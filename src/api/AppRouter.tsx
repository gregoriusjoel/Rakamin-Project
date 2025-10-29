"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import LoginPage from '../pages/Login/LoginPage';
import RegisterPage from '../pages/Register/RegisterPage';
import DashboardComponent from '../pages/user/DashboardUser';
import FirebaseSetupNotice from '../contexts/FirebaseSetupNotice';
import { useAuth } from '../hooks/useAuth';
import { isConfigured } from '../lib/firebase';

export type PageType = 'login' | 'register' | 'dashboard';

interface AppRouterProps {
  initialPage?: PageType;
}

export default function AppRouter({ initialPage = 'login' }: AppRouterProps) {
  const [currentPage, setCurrentPage] = useState<PageType>(initialPage);
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  if (!isConfigured) {
    return <FirebaseSetupNotice />;
  }

  useEffect(() => {
    if (!loading) {
      if (user && currentPage !== 'dashboard') {
        setCurrentPage('dashboard');
      } else if (!user && currentPage === 'dashboard') {
        setCurrentPage('login');
      }
    }
  }, [user, loading, currentPage]);

  useEffect(() => {
    if (!loading && user && userProfile) {
      const role = (userProfile as any).role || 'user';
      if (role === 'admin') {
        router.push('/admin');
      } else {
        router.push('/user');
      }
    }
  }, [loading, user, userProfile, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  const navigateToLogin = () => setCurrentPage('login');
  const navigateToRegister = () => setCurrentPage('register');

  switch (currentPage) {
    case 'login':
      return <LoginPageWrapper onNavigateToRegister={navigateToRegister} />;
    case 'register':
      return <RegisterPageWrapper onNavigateToLogin={navigateToLogin} />;
    case 'dashboard':
      return <DashboardComponent onLogout={navigateToLogin} />;
    default:
      return <LoginPageWrapper onNavigateToRegister={navigateToRegister} />;
  }
}

function LoginPageWrapper({ onNavigateToRegister }: { onNavigateToRegister: () => void }) {
  return <LoginPage onNavigateToRegister={onNavigateToRegister} />;
}  
function RegisterPageWrapper({ onNavigateToLogin }: { onNavigateToLogin: () => void }) {
  return <RegisterPage onNavigateToLogin={onNavigateToLogin} />;
}