import type { UserProfile } from '../types/auth';
import { INITIAL_USER } from '../constants/mockData';

const AUTH_USER_KEY = 'daily_income_auth_user_v1';

export const mockAuthService = {
  getCurrentUser(): UserProfile | null {
    try {
      const data = localStorage.getItem(AUTH_USER_KEY);
      if (!data) return null;
      return JSON.parse(data);
    } catch {
      return null;
    }
  },

  async loginWithGoogle(): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 800));
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(INITIAL_USER));
    return INITIAL_USER;
  },

  async switchUser(user: UserProfile): Promise<UserProfile> {
    await new Promise((resolve) => setTimeout(resolve, 300));
    localStorage.setItem(AUTH_USER_KEY, JSON.stringify(user));
    return user;
  },

  async logout(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve, 400));
    localStorage.removeItem(AUTH_USER_KEY);
  },
};
