"use client";

import React, { createContext, useContext } from 'react';
import { useSession, signOut } from 'next-auth/react';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  logOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  logOut: async () => {},
});

/**
 * AuthProvider - Wraps NextAuth session context for application-wide authentication state
 * 
 * Provides isAuthenticated, isLoading, and logOut functionality based on NextAuth.js
 * JWT session strategy (30-day maxAge, 24-hour updateAge)
 */
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { status } = useSession();

  const logOut = async () => {
    await signOut({ redirect: false });
  };

  const value: AuthContextType = {
    isAuthenticated: status === 'authenticated',
    isLoading: status === 'loading',
    logOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * useAuth - Hook to access authentication context
 * 
 * Returns:
 * - isAuthenticated: true if user has valid NextAuth session
 * - isLoading: true while session is loading
 * - logOut: Function to sign out and clear session
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
