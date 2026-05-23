
import { create } from "zustand";
import { persist } from "zustand/middleware";

export interface User {
  id: number;
  email: string;
  name: string;
  role: string;
  phone?: string;
  drivers_license?: string;
  address?: string;
  is_verified: boolean;
  created_at?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: User, token: string) => void;
  logout: () => void;
  updateUser: (user: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      setAuth: (user, token) => {
        if (typeof window !== "undefined") {
          localStorage.setItem("token", token);
          localStorage.setItem("user", JSON.stringify(user));
        }
        set({ user, token, isAuthenticated: true });
      },
      logout: () => {
        if (typeof window !== "undefined") {
          localStorage.removeItem("token");
          localStorage.removeItem("user");
        }
        set({ user: null, token: null, isAuthenticated: false });
      },
      updateUser: (userData) => {
        set((state) => {
          const newUser = state.user ? { ...state.user, ...userData } : null;
          if (newUser && typeof window !== "undefined") {
            localStorage.setItem("user", JSON.stringify(newUser));
          }
          return { user: newUser };
        });
      },
    }),
    {
      name: "auth-storage",
    }
  )
);
