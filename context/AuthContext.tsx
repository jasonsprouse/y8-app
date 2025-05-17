"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  AuthMethod, 
  IRelayPKP, 
  SessionSigs 
} from '@lit-protocol/types';
import { litNodeClient, getSessionSigs, signInWithGoogle, signInWithDiscord } from '../utils/lit';

// Define context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: AuthMethod | null;
  pkp: IRelayPKP | null;
  sessionSigs: SessionSigs | null;
  error: Error | null;
  
  // Auth methods
  loginWithGoogle: () => Promise<void>;
  loginWithDiscord: () => Promise<void>;
  loginWithWebAuthn: () => Promise<void>;
  logOut: () => void;
  setPKP: (pkp: IRelayPKP) => void;
  setSessionSigs: (sessionSigs: SessionSigs) => void;
}

// Create context with default values
const AuthContext = createContext<AuthContextType>({
  isAuthenticated: false,
  isLoading: true,
  authMethod: null,
  pkp: null,
  sessionSigs: null,
  error: null,
  
  loginWithGoogle: async () => {},
  loginWithDiscord: async () => {},
  loginWithWebAuthn: async () => {},
  logOut: () => {},
  setPKP: () => {},
  setSessionSigs: () => {},
});

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [pkp, setPKP] = useState<IRelayPKP | null>(null);
  const [sessionSigs, setSessionSigs] = useState<SessionSigs | null>(null);
  const [error, setError] = useState<Error | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from localStorage
  useEffect(() => {
    const loadAuth = async () => {
      try {
        setIsLoading(true);
        
        // Try to restore auth from localStorage
        const storedAuthMethod = localStorage.getItem('lit-auth-method');
        const storedPKP = localStorage.getItem('lit-pkp');
        const storedSessionSigs = localStorage.getItem('lit-session-sigs');
        
        if (storedAuthMethod && storedPKP && storedSessionSigs) {
          setAuthMethod(JSON.parse(storedAuthMethod));
          setPKP(JSON.parse(storedPKP));
          setSessionSigs(JSON.parse(storedSessionSigs));
          setIsAuthenticated(true);
          
          // Validate session sigs - you might want to check if they're expired
          // and refresh them if needed
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error loading auth state:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };
    
    loadAuth();
  }, []);

  // Handle redirect callback after social login
  useEffect(() => {
    const handleRedirectCallback = async () => {
      // Check if we're on a callback URL
      if (typeof window !== 'undefined' && window.location.search.includes('code=')) {
        // Handle the auth callback
        setIsLoading(true);
        try {
          // Logic to handle redirect would be here
          // This would be based on the current path and search params
          // to determine which provider to use for authentication
          
          // This is placeholder logic - actual implementation depends on your routes
          if (pathname?.includes('/auth/google')) {
            // Google auth logic
          } else if (pathname?.includes('/auth/discord')) {
            // Discord auth logic
          }
        } catch (err) {
          console.error('Error handling redirect:', err);
          setError(err instanceof Error ? err : new Error(String(err)));
        } finally {
          setIsLoading(false);
        }
      }
    };
    
    handleRedirectCallback();
  }, [pathname]);

  // Auth methods
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the redirect URI dynamically
      const redirectUri = `${window.location.origin}/auth/callback/google`;
      
      // Redirect to Google OAuth flow
      await signInWithGoogle(redirectUri);
      
      // Note: The rest of the auth flow will happen when redirected back
    } catch (err) {
      console.error('Error logging in with Google:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const loginWithDiscord = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Get the redirect URI dynamically
      const redirectUri = `${window.location.origin}/auth/callback/discord`;
      
      // Redirect to Discord OAuth flow
      await signInWithDiscord(redirectUri);
      
      // Note: The rest of the auth flow will happen when redirected back
    } catch (err) {
      console.error('Error logging in with Discord:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const loginWithWebAuthn = useCallback(async () => {
    // Implement WebAuthn login
    try {
      setIsLoading(true);
      setError(null);
      
      // WebAuthn login logic would be implemented here
      // This depends on the Lit Protocol WebAuthn provider
      
    } catch (err) {
      console.error('Error logging in with WebAuthn:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Update session
  const updateSession = useCallback(async (newPKP: IRelayPKP, newAuthMethod: AuthMethod) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate session signatures
      const sessionSigs = await getSessionSigs({
        pkpPublicKey: newPKP.publicKey,
        authMethod: newAuthMethod,
        sessionSigsParams: {
          chain: "ethereum",
          expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        },
      });
      
      // Update state
      setPKP(newPKP);
      setAuthMethod(newAuthMethod);
      setSessionSigs(sessionSigs);
      setIsAuthenticated(true);
      
      // Store in localStorage
      localStorage.setItem('lit-auth-method', JSON.stringify(newAuthMethod));
      localStorage.setItem('lit-pkp', JSON.stringify(newPKP));
      localStorage.setItem('lit-session-sigs', JSON.stringify(sessionSigs));
      
      return { pkp: newPKP, sessionSigs };
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  // Logout
  const logOut = useCallback(() => {
    setAuthMethod(null);
    setPKP(null);
    setSessionSigs(null);
    setIsAuthenticated(false);
    
    // Clear localStorage
    localStorage.removeItem('lit-auth-method');
    localStorage.removeItem('lit-pkp');
    localStorage.removeItem('lit-session-sigs');
    
    // Redirect to login page
    router.push('/login');
  }, [router]);

  // Context value
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    authMethod,
    pkp,
    sessionSigs,
    error,
    
    loginWithGoogle,
    loginWithDiscord,
    loginWithWebAuthn,
    logOut,
    setPKP,
    setSessionSigs,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};