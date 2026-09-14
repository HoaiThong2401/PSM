import { supabase, isSupabaseConfigured } from './supabaseClient';
import type { UserProfile } from '../types/auth';
import { mockAuthService } from './mockAuthService';

export const supabaseAuthService = {
  async getCurrentUser(): Promise<UserProfile | null> {
    if (!isSupabaseConfigured() || !supabase) {
      return mockAuthService.getCurrentUser();
    }

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.user_metadata?.name || user.email?.split('@')[0] || 'User',
      avatarUrl:
        user.user_metadata?.avatar_url ||
        user.user_metadata?.picture ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
      role: 'User',
    };
  },

  async loginWithOAuth(provider: 'google' | 'github'): Promise<void> {
    if (!isSupabaseConfigured() || !supabase) {
      await mockAuthService.loginWithGoogle();
      return;
    }

    const { error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: window.location.origin,
      },
    });

    if (error) throw error;
  },

  async loginWithPassword(email: string, password: string): Promise<UserProfile> {
    if (!isSupabaseConfigured() || !supabase) {
      return mockAuthService.loginWithGoogle();
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;

    const user = data.user;
    return {
      id: user.id,
      email: user.email || '',
      name: user.user_metadata?.full_name || user.email?.split('@')[0] || 'User',
      avatarUrl:
        user.user_metadata?.avatar_url ||
        `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
    };
  },

  async signUpWithPassword(email: string, password: string, name?: string): Promise<UserProfile> {
    if (!isSupabaseConfigured() || !supabase) {
      return mockAuthService.loginWithGoogle();
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name || email.split('@')[0] },
      },
    });
    if (error) throw error;

    const user = data.user;
    if (!user) throw new Error('Đăng ký không thành công');

    return {
      id: user.id,
      email: user.email || '',
      name: name || user.email?.split('@')[0] || 'User',
      avatarUrl: `https://api.dicebear.com/7.x/bottts/svg?seed=${user.id}`,
    };
  },

  async logout(): Promise<void> {
    if (isSupabaseConfigured() && supabase) {
      await supabase.auth.signOut();
    }
    await mockAuthService.logout();
  },
};
