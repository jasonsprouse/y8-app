"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  AuthMethod, 
  IRelayPKP, 
  SessionSigs 
} from '@lit-protocol/types';
import { AuthMethodType } from '@lit-protocol/constants';
import { LitResourceAbilityRequest } from '@lit-protocol/auth-helpers';
import { 
  litNodeClient, 
  getSessionSigs, 
  signInWithGoogle, 
  signInWithDiscord, 
  authenticateWithGoogle, 
  authenticateWithDiscord,
  authenticateWithEthWallet,
  authenticateWithWebAuthn,
  authenticateWithStytch,
  registerWebAuthn as litRegisterWebAuthn,
  getPKPs,
  mintPKP
} from '../utils/lit';

// Define context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: AuthMethod | null;
  pkp: IRelayPKP | null;
  sessionSigs: SessionSigs | null;
  error: Error | null;
  pendingPkpSelection: boolean;
  availablePkps: IRelayPKP[] | null;
  currentAuthMethodForPkpSelection: AuthMethod | null;
  
  // Auth methods
  loginWithGoogle: () => Promise<void>;
  loginWithDiscord: () => Promise<void>;
  loginWithWebAuthn: () => Promise<void>;
  loginWithEthWallet: () => Promise<void>;
  loginWithStytchOtp: (method: 'email' | 'phone') => Promise<void>;
  registerWebAuthn: () => Promise<void>;
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
  pendingPkpSelection: false,
  availablePkps: null,
  currentAuthMethodForPkpSelection: null,
  
  loginWithGoogle: async () => {},
  loginWithDiscord: async () => {},
  loginWithWebAuthn: async () => {},
  loginWithEthWallet: async () => {},
  loginWithStytchOtp: async () => {},
  registerWebAuthn: async () => {},
  logOut: () => {},
  setPKP: () => {},
  setSessionSigs: () => {},
});

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [pkp, setPKPState] = useState<IRelayPKP | null>(null);
  const [sessionSigs, setSessionSigsState] = useState<SessionSigs | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [pendingPkpSelection, setPendingPkpSelection] = useState<boolean>(false);
  const [availablePkps, setAvailablePkps] = useState<IRelayPKP[] | null>(null);
  const [currentAuthMethodForPkpSelection, setCurrentAuthMethodForPkpSelection] = useState<AuthMethod | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();

  // Initialize auth state from localStorage
  useEffect(() => {
    const loadAuth = async () => {
      try {
        setIsLoading(true);
        
        const storedAuthMethod = localStorage.getItem('lit-auth-method');
        const storedPKP = localStorage.getItem('lit-pkp');
        const storedSessionSigs = localStorage.getItem('lit-session-sigs');
        
        if (storedAuthMethod && storedPKP && storedSessionSigs) {
          setAuthMethod(JSON.parse(storedAuthMethod));
          setPKPState(JSON.parse(storedPKP));
          setSessionSigsState(JSON.parse(storedSessionSigs));
          setIsAuthenticated(true);
        } else {
          setIsAuthenticated(false);
        }
      } catch (err) {
        console.error('Error loading auth:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    loadAuth();
  }, []);

  // Update session with PKP and auth method
  const updateSession = useCallback(async (newPKP: IRelayPKP, newAuthMethod: AuthMethod) => {
    try {
      setIsLoading(true);
      setError(null);
      
      const sessionSigsResult = await getSessionSigs({
        pkpPublicKey: newPKP.publicKey,
        authMethod: newAuthMethod,
        sessionSigsParams: {
          chain: "ethereum",
          resourceAbilityRequests: [
            {
              resource: { resource: "*", resourcePrefix: "lit-litaction" },
              ability: "lit-action-execution",
            } as LitResourceAbilityRequest,
          ],
          authNeededCallback: async () => {
            return {
              sig: "",
              derivedVia: "web3.eth.personal.sign",
              signedMessage: `Authentication at ${Date.now()}`,
              address: newPKP.ethAddress,
            };
          },
        },
      });
      
      setPKPState(newPKP);
      setAuthMethod(newAuthMethod);
      setSessionSigsState(sessionSigsResult);
      setIsAuthenticated(true);
      setPendingPkpSelection(false);
      setAvailablePkps(null);
      setCurrentAuthMethodForPkpSelection(null);
      
      localStorage.setItem('lit-auth-method', JSON.stringify(newAuthMethod));
      localStorage.setItem('lit-pkp', JSON.stringify(newPKP));
      localStorage.setItem('lit-session-sigs', JSON.stringify(sessionSigsResult));
      
      return { pkp: newPKP, sessionSigs: sessionSigsResult };
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Set PKP (handles selection from multiple PKPs)
  const setPKP = useCallback(async (selectedPkp: IRelayPKP) => {
    if (!currentAuthMethodForPkpSelection) {
      setError(new Error('No auth method available for PKP selection'));
      return;
    }

    try {
      setIsLoading(true);
      await updateSession(selectedPkp, currentAuthMethodForPkpSelection);
    } catch (err) {
      console.error('Error selecting PKP:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    }
  }, [currentAuthMethodForPkpSelection, updateSession]);

  // Login with Google
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const redirectUri = `${window.location.origin}/auth/callback/google`;
      const result = await signInWithGoogle(redirectUri);
      
      const pkps = await getPKPs(result);
      
      if (pkps.length === 0) {
        setError(new Error('No PKP found. Please sign up first.'));
        return;
      } else if (pkps.length === 1) {
        await updateSession(pkps[0], result);
      } else {
        setAvailablePkps(pkps);
        setCurrentAuthMethodForPkpSelection(result);
        setPendingPkpSelection(true);
      }
    } catch (err) {
      console.error('Error logging in with Google:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [updateSession]);

  // Login with Discord
  const loginWithDiscord = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const redirectUri = `${window.location.origin}/auth/callback/discord`;
      const result = await signInWithDiscord(redirectUri);
      
      const pkps = await getPKPs(result);
      
      if (pkps.length === 0) {
        setError(new Error('No PKP found. Please sign up first.'));
        return;
      } else if (pkps.length === 1) {
        await updateSession(pkps[0], result);
      } else {
        setAvailablePkps(pkps);
        setCurrentAuthMethodForPkpSelection(result);
        setPendingPkpSelection(true);
      }
    } catch (err) {
      console.error('Error logging in with Discord:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [updateSession]);

  // Login with WebAuthn
  const loginWithWebAuthn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authenticateWithWebAuthn();
      const pkps = await getPKPs(result);
      
      if (pkps.length === 0) {
        setError(new Error('No PKP found. Please register first.'));
        return;
      } else if (pkps.length === 1) {
        await updateSession(pkps[0], result);
      } else {
        setAvailablePkps(pkps);
        setCurrentAuthMethodForPkpSelection(result);
        setPendingPkpSelection(true);
      }
    } catch (err) {
      console.error('Error logging in with WebAuthn:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [updateSession]);

  // Login with Ethereum Wallet
  const loginWithEthWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authenticateWithEthWallet();
      const pkps = await getPKPs(result);
      
      if (pkps.length === 0) {
        setError(new Error('No PKP found. Please sign up first.'));
        return;
      } else if (pkps.length === 1) {
        await updateSession(pkps[0], result);
      } else {
        setAvailablePkps(pkps);
        setCurrentAuthMethodForPkpSelection(result);
        setPendingPkpSelection(true);
      }
    } catch (err) {
      console.error('Error logging in with wallet:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [updateSession]);

  // Login with Stytch OTP
  const loginWithStytchOtp = useCallback(async (method: 'email' | 'phone') => {
    try {
      setIsLoading(true);
      setError(null);
      
      const result = await authenticateWithStytch(method);
      const pkps = await getPKPs(result);
      
      if (pkps.length === 0) {
        setError(new Error('No PKP found. Please sign up first.'));
        return;
      } else if (pkps.length === 1) {
        await updateSession(pkps[0], result);
      } else {
        setAvailablePkps(pkps);
        setCurrentAuthMethodForPkpSelection(result);
        setPendingPkpSelection(true);
      }
    } catch (err) {
      console.error('Error logging in with Stytch:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [updateSession]);

  // Register with WebAuthn
  const registerWebAuthn = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const authMethodResult = await litRegisterWebAuthn();
      const newPKP = await mintPKP(authMethodResult);
      await updateSession(newPKP, authMethodResult);
    } catch (err) {
      console.error('Error registering with WebAuthn:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsLoading(false);
    }
  }, [updateSession]);

  // Logout
  const logOut = useCallback(() => {
    setIsAuthenticated(false);
    setAuthMethod(null);
    setPKPState(null);
    setSessionSigsState(null);
    setError(null);
    setPendingPkpSelection(false);
    setAvailablePkps(null);
    setCurrentAuthMethodForPkpSelection(null);
    
    localStorage.removeItem('lit-auth-method');
    localStorage.removeItem('lit-pkp');
    localStorage.removeItem('lit-session-sigs');
    
    router.push('/');
  }, [router]);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        authMethod,
        pkp,
        sessionSigs,
        error,
        pendingPkpSelection,
        availablePkps,
        currentAuthMethodForPkpSelection,
        loginWithGoogle,
        loginWithDiscord,
        loginWithWebAuthn,
        loginWithEthWallet,
        loginWithStytchOtp,
        registerWebAuthn,
        logOut,
        setPKP,
        setSessionSigs: setSessionSigsState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};