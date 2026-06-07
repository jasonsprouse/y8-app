"use client";

import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useSession, signOut } from 'next-auth/react';

type UserProfile = {
  address: string;
  role?: 'admin' | 'user';
};

type AuthContextType = {
  user: UserProfile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  sessionToken: string | null;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status, update: updateSession } = useSession();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  
  const isLoading = status === 'loading'; 

  // Watch for session changes
  useEffect(() => {
    if (status === 'authenticated' && session?.address) {
      const userProfile: UserProfile = { 
        address: session.address as string,
        role: (session as any)?.role || 'user'
      };
      setUser(userProfile);
      // Store session token if available
      if ((session as any)?.token) {
        setSessionToken((session as any).token);
      }
    } else if (status === 'unauthenticated') {
      setUser(null);
      setSessionToken(null);
    }
  }, [session, status]);

  // Optional: Refetch session on app focus to keep it fresh
  useEffect(() => {
    const handleFocus = () => {
      updateSession();
    };

    window.addEventListener('focus', handleFocus);
    return () => window.removeEventListener('focus', handleFocus);
  }, [updateSession]);

  const isAuthenticated = status === 'authenticated' && user !== null;

  // Logout function
  const logout = async () => {
    setUser(null);
    setSessionToken(null);
    await signOut({ redirect: true, callbackUrl: '/auth' });
  };

  return (
    <AuthContext.Provider value={{ 
        user, 
        isLoading, 
        isAuthenticated,
        sessionToken,
        logout
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
