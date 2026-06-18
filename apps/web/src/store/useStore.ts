import { create } from 'zustand';
import { UserSessionDto } from '@vyapaarai/shared-types';

interface AppState {
  user: UserSessionDto | null;
  token: string | null;
  setUser: (user: UserSessionDto | null, token: string | null) => void;
  logout: () => void;
  hydrate: () => void;
}

export const useStore = create<AppState>((set) => ({
  user: null,
  token: null,
  setUser: (user, token) => {
    if (typeof window !== 'undefined') {
      if (token) {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
      } else {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
      }
    }
    set({ user, token });
  },
  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    set({ user: null, token: null });
  },
  hydrate: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ user, token });
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
        }
      }
    }
  },
}));
