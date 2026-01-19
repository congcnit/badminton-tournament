import { create } from 'zustand';

type UserRole = 'guest' | 'admin';

interface AuthState {
  role: UserRole;
  isAuthenticated: boolean;
  _hasHydrated: boolean;
  isLoading: boolean;
  login: (token: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  setHasHydrated: (state: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  role: 'guest',
  isAuthenticated: false,
  _hasHydrated: false,
  isLoading: false,
  setHasHydrated: (state) => {
    set({ _hasHydrated: state });
  },
  login: async (token: string) => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          set({ role: 'admin', isAuthenticated: true, isLoading: false });
          return true;
        }
      }
      set({ isLoading: false });
      return false;
    } catch (error) {
      console.error('Login error:', error);
      set({ isLoading: false });
      return false;
    }
  },
  logout: async () => {
    set({ isLoading: true });
    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
      });
      set({ role: 'guest', isAuthenticated: false, isLoading: false });
    } catch (error) {
      console.error('Logout error:', error);
      set({ isLoading: false });
    }
  },
  checkAuth: async () => {
    if (typeof window === 'undefined') return;
    
    set({ isLoading: true });
    try {
      const response = await fetch('/api/auth/me');
      const data = await response.json();
      
      set({
        role: data.role || 'guest',
        isAuthenticated: data.isAuthenticated || false,
        _hasHydrated: true,
        isLoading: false,
      });
    } catch (error) {
      console.error('Auth check error:', error);
      set({
        role: 'guest',
        isAuthenticated: false,
        _hasHydrated: true,
        isLoading: false,
      });
    }
  },
}));
