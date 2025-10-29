import { useState, useEffect } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../lib/firebase';
import { AuthService, UserProfile } from '../lib/authService';

export interface AuthState {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    userProfile: null,
    loading: true,
    error: null
  });

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          const userProfile = await AuthService.getUserProfile(user.uid);
          setAuthState({
            user,
            userProfile,
            loading: false,
            error: null
          });
        } catch (error) {
          setAuthState({
            user,
            userProfile: null,
            loading: false,
            error: 'Failed to load user profile'
          });
        }
      } else {
        setAuthState({
          user: null,
          userProfile: null,
          loading: false,
          error: null
        });
      }
    });

    return () => unsubscribe();
  }, []);

  return authState;
};