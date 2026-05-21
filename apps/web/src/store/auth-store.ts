"use client";

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface User {
  id: string;
  fullName: string;
  email: string;
  role: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  refreshToken: string | null;

  /** Called after a successful login or register API response */
  setAuth: (user: User, token: string, refreshToken: string) => void;

  /** Revokes the refresh token server-side, then clears local state */
  logout: () => Promise<void>;

  /** Checks whether an access token is present in memory */
  isAuthenticated: () => boolean;

  /**
   * Silently exchanges the stored refresh token for a new access + refresh
   * token pair.  Returns true on success, false if the session has expired.
   */
  refreshAccessToken: () => Promise<boolean>;
}

const API = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000/api/v1';

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      refreshToken: null,

      setAuth: (user, token, refreshToken) =>
        set({ user, token, refreshToken }),

      logout: async () => {
        const { refreshToken } = get();
        if (refreshToken) {
          try {
            await fetch(`${API}/auth/logout`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ refreshToken }),
            });
          } catch (e) {
            // Network error during logout — still clear local state
            console.warn('[Auth] Logout API call failed, clearing local state.', e);
          }
        }
        set({ user: null, token: null, refreshToken: null });
      },

      isAuthenticated: () => !!get().token,

      refreshAccessToken: async () => {
        const { refreshToken } = get();
        if (!refreshToken) return false;

        try {
          const res = await fetch(`${API}/auth/refresh`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ refreshToken }),
          });

          if (!res.ok) {
            // Token expired or revoked — force logout
            set({ user: null, token: null, refreshToken: null });
            return false;
          }

          const data = await res.json();
          set({
            token: data.accessToken,
            refreshToken: data.refreshToken,
            user: data.user,
          });
          return true;
        } catch (e) {
          console.warn('[Auth] Token refresh failed.', e);
          set({ user: null, token: null, refreshToken: null });
          return false;
        }
      },
    }),
    {
      name: 'cg-tourism-auth',
      // Only persist non-sensitive fields — token stored for session continuity
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        refreshToken: state.refreshToken,
      }),
    }
  )
);
