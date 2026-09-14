import React, { createContext, useContext, useState, useEffect } from 'react';
import type { UserProfile, AuthState } from '../types/auth';
import { supabaseAuthService } from '../services/supabaseAuthService';
import { mockAuthService } from '../services/mockAuthService';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

interface AuthContextType extends AuthState {
  loginWithGoogle: () => Promise<void>;
  loginWithPassword: (email: string, pass: string) => Promise<void>;
  signUpWithPassword: (email: string, pass: string, name?: string) => Promise<void>;
  loginWithDemo: () => Promise<void>;
  logout: () => Promise<void>;
  switchUser: (user: UserProfile) => Promise<void>;
  isSupabaseLive: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const isSupabaseLive = isSupabaseConfigured();

  useEffect(() => {
    let isMounted = true;

    async function initAuth() {
      try {
        const currentUser = await supabaseAuthService.getCurrentUser();
        if (isMounted) setUser(currentUser);
      } catch (err) {
        console.error('Lỗi khởi tạo Auth:', err);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    }

    initAuth();

    if (isSupabaseLive && supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
        if (!isMounted) return;
        if (session?.user) {
          const authUser: UserProfile = {
            id: session.user.id,
            email: session.user.email || '',
            name:
              session.user.user_metadata?.full_name ||
              session.user.user_metadata?.name ||
              session.user.email?.split('@')[0] ||
              'User',
            avatarUrl:
              session.user.user_metadata?.avatar_url ||
              session.user.user_metadata?.picture ||
              `https://api.dicebear.com/7.x/bottts/svg?seed=${session.user.id}`,
            role: 'User',
          };
          setUser(authUser);
        } else {
          setUser(null);
        }
        setIsLoading(false);
      });

      return () => {
        isMounted = false;
        subscription.unsubscribe();
      };
    }

    return () => {
      isMounted = false;
    };
  }, [isSupabaseLive]);

  const loginWithGoogle = async () => {
    setIsLoading(true);
    try {
      await supabaseAuthService.loginWithOAuth('google');
      if (!isSupabaseLive) {
        const loggedUser = await supabaseAuthService.getCurrentUser();
        setUser(loggedUser);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithPassword = async (email: string, pass: string) => {
    setIsLoading(true);
    try {
      const loggedUser = await supabaseAuthService.loginWithPassword(email, pass);
      setUser(loggedUser);
    } finally {
      setIsLoading(false);
    }
  };

  const signUpWithPassword = async (email: string, pass: string, name?: string) => {
    setIsLoading(true);
    try {
      const newUser = await supabaseAuthService.signUpWithPassword(email, pass, name);
      setUser(newUser);
    } finally {
      setIsLoading(false);
    }
  };

  const loginWithDemo = async () => {
    setIsLoading(true);
    try {
      const demoUser = await mockAuthService.loginWithGoogle();
      setUser(demoUser);
    } finally {
      setIsLoading(false);
    }
  };

  const switchUser = async (newUser: UserProfile) => {
    setUser(newUser);
  };

  const logout = async () => {
    setIsLoading(true);
    try {
      await supabaseAuthService.logout();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isLoading,
        loginWithGoogle,
        loginWithPassword,
        signUpWithPassword,
        loginWithDemo,
        logout,
        switchUser,
        isSupabaseLive,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
