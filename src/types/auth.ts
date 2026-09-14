export interface UserProfile {
  id: string;
  email: string;
  name: string;
  avatarUrl: string;
  role?: string;
}

export interface AuthState {
  user: UserProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}
