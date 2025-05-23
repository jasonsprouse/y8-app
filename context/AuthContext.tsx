"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { 
  AuthMethod, 
  IRelayPKP, 
  AuthMethodType, // Added for AuthMethodType.WebAuthn comparison if needed
  SessionSigs 
} from '@lit-protocol/types';
import { 
  litNodeClient, 
  getSessionSigs, 
  signInWithGoogle, 
  signInWithDiscord, 
  authenticateWithGoogle, 
  authenticateWithDiscord,
  authenticateWithEthWallet,
  authenticateWithWebAuthn, // Will be used for login
  authenticateWithStytch,
  registerWebAuthn as litRegisterWebAuthn // Aliased to avoid naming conflict
} from '../utils/lit';
import { useAccounts } from '../hooks/useAccounts';
import { useConnect } from 'wagmi';
// For wagmi v1+, ensure config is correctly passed or accessible for these actions
import { getAccount, getWalletClient } from '@wagmi/core'; 
import { wagmiClientConfig } from '../app/auth/page'; // Updated import

// Define context type
interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  authMethod: AuthMethod | null;
  pkp: IRelayPKP | null;
  sessionSigs: SessionSigs | null;
  error: Error | null;
  pendingPkpSelection: boolean;
  availablePkps: IRelayPKP[];
  
  // Auth methods
  loginWithGoogle: () => Promise<void>;
  loginWithDiscord: () => Promise<void>;
  loginWithEthWallet: (connector: any) => Promise<void>; // New
  loginWithWebAuthn: () => Promise<void>; // Will be fully implemented
  loginWithStytchOtp: (token: string, userId?: string, method?: string) => Promise<void>; // New
  registerWithWebAuthn: () => Promise<void>; // New
  logOut: () => void;
  setPKP: (pkp: IRelayPKP) => void; 
  setSessionSigs: (sessionSigs: SessionSigs) => void;
  processAuthMethod: (authMethod: AuthMethod) => Promise<void>; 
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
  availablePkps: [],
  
  loginWithGoogle: async () => {},
  loginWithDiscord: async () => {},
  loginWithEthWallet: async () => {},
  loginWithWebAuthn: async () => {},
  loginWithStytchOtp: async () => {},
  registerWithWebAuthn: async () => {},
  logOut: () => {},
  setPKP: () => {},
  setSessionSigs: () => {},
  processAuthMethod: async () => {},
});

// Auth Provider component
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [authMethod, setAuthMethod] = useState<AuthMethod | null>(null);
  const [pkp, setPKPState] = useState<IRelayPKP | null>(null); // Renamed to avoid conflict with setPKP context method
  const [sessionSigs, setSessionSigsState] = useState<SessionSigs | null>(null); // Renamed
  const [error, setError] = useState<Error | null>(null);
  const [pendingPkpSelection, setPendingPkpSelection] = useState<boolean>(false);
  const [availablePkps, setAvailablePkps] = useState<IRelayPKP[]>([]);
  const [currentAuthMethodForPkpSelection, setCurrentAuthMethodForPkpSelection] = useState<AuthMethod | null>(null);
  
  const router = useRouter();
  const pathname = usePathname();
  const { fetchAccounts, createAccount } = useAccounts();
  const { connectAsync } = useConnect(); // Removed 'connectors' as it's passed to loginWithEthWallet

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
          setPKPState(JSON.parse(storedPKP)); // Use renamed state setter
          setSessionSigsState(JSON.parse(storedSessionSigs)); // Use renamed state setter
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


  const updateSession = useCallback(async (newPKP: IRelayPKP, newAuthMethod: AuthMethod) => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Generate session signatures
      const sessionSigsResult = await getSessionSigs({ // Renamed to avoid conflict
        pkpPublicKey: newPKP.publicKey,
        authMethod: newAuthMethod,
        sessionSigsParams: {
          chain: "ethereum", // Make sure this is the correct chain
          expiration: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(), // 24 hours
        },
      });
      
      // Update state
      setPKPState(newPKP);
      setAuthMethod(newAuthMethod);
      setSessionSigsState(sessionSigsResult);
      setIsAuthenticated(true);
      setPendingPkpSelection(false);
      setAvailablePkps([]);
      setCurrentAuthMethodForPkpSelection(null);
      
      // Store in localStorage
      localStorage.setItem('lit-auth-method', JSON.stringify(newAuthMethod));
      localStorage.setItem('lit-pkp', JSON.stringify(newPKP));
      localStorage.setItem('lit-session-sigs', JSON.stringify(sessionSigsResult));
      
      router.push('/space'); // Redirect to a protected area
      
      return { pkp: newPKP, sessionSigs: sessionSigsResult };
    } catch (err) {
      console.error('Error updating session:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsAuthenticated(false); // Ensure auth status is false on error
      // Clear potentially inconsistent localStorage
      localStorage.removeItem('lit-auth-method');
      localStorage.removeItem('lit-pkp');
      localStorage.removeItem('lit-session-sigs');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [router]);


  const processAuthMethod = useCallback(async (authMethodToProcess: AuthMethod) => {
    setIsLoading(true);
    setError(null);
    try {
      const accounts = await fetchAccounts(authMethodToProcess);

      if (accounts.length === 0) {
        const newPkp = await createAccount(authMethodToProcess);
        if (newPkp) {
          await updateSession(newPkp, authMethodToProcess);
        } else {
          throw new Error('Failed to create a new PKP.');
        }
      } else if (accounts.length === 1) {
        await updateSession(accounts[0], authMethodToProcess);
      } else {
        // Multiple PKPs found, prompt user for selection
        setAvailablePkps(accounts);
        setCurrentAuthMethodForPkpSelection(authMethodToProcess);
        setPendingPkpSelection(true);
        // UI will handle rendering account selection
      }
    } catch (err) {
      console.error('Error processing auth method:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsAuthenticated(false);
    } finally {
      setIsLoading(false);
    }
  }, [fetchAccounts, createAccount, updateSession]);

  // Handle redirect callback after social login
  useEffect(() => {
    const handleRedirect = async () => {
      setIsLoading(true);
      setError(null);
      try {
        let receivedAuthMethod: AuthMethod | null = null;
        const redirectUriBase = window.location.origin;

        if (pathname === '/auth/callback/google') {
          const googleRedirectUri = `${redirectUriBase}/auth/callback/google`;
          receivedAuthMethod = await authenticateWithGoogle(googleRedirectUri);
        } else if (pathname === '/auth/callback/discord') {
          const discordRedirectUri = `${redirectUriBase}/auth/callback/discord`;
          receivedAuthMethod = await authenticateWithDiscord(discordRedirectUri);
        }

        if (receivedAuthMethod) {
          await processAuthMethod(receivedAuthMethod);
        } else if (pathname?.startsWith('/auth/callback/')) {
          // Only set loading to false if it's a known callback path but no auth method was processed yet.
          // This avoids race conditions with other effects.
          setIsLoading(false);
        } else {
           // If not a callback path, just ensure loading is false.
          setIsLoading(false);
        }
      } catch (err) {
        console.error('Error handling redirect callback:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        setIsAuthenticated(false);
        setIsLoading(false);
      }
      // No finally here, isLoading is managed per path.
    };

    // Only run if not already authenticated and on a potential callback path
    if (!isAuthenticated && typeof window !== 'undefined' && pathname?.startsWith('/auth/callback/')) {
       // Check for code or access_token to ensure it's a valid redirect
       const hasCode = window.location.search.includes('code=');
       const hasAccessToken = window.location.search.includes('access_token='); // For Discord or others
       if (hasCode || hasAccessToken) {
        handleRedirect();
       } else {
        setIsLoading(false); // Not a valid redirect from OAuth provider
       }
    } else if (isLoading) {
      // If it's not a callback path but still loading (e.g. from initial load effect)
      // ensure loading is eventually set to false if not handled by other effects.
      // This handles the case where the initial localStorage load is the only thing setting isLoading to true.
      const stillLoadingFromInitialEffect = !pathname?.startsWith('/auth/callback/');
      if (stillLoadingFromInitialEffect) {
        setIsLoading(false);
      }
    }
  }, [pathname, processAuthMethod, isAuthenticated, isLoading]);


  // Auth methods
  const loginWithGoogle = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const redirectUri = `${window.location.origin}/auth/callback/google`;
      await signInWithGoogle(redirectUri);
      // User will be redirected, callback will handle the rest.
    } catch (err) {
      console.error('Error logging in with Google:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false); // Set loading false only on error, otherwise page redirects
    }
  }, []);
  
  const loginWithDiscord = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const redirectUri = `${window.location.origin}/auth/callback/discord`;
      await signInWithDiscord(redirectUri);
      // User will be redirected, callback will handle the rest.
    } catch (err) {
      console.error('Error logging in with Discord:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false); // Set loading false only on error, otherwise page redirects
    }
  }, []);
  
  const loginWithWebAuthn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const authMethodResponse = await authenticateWithWebAuthn(); // Corrected: Call the imported function
      await processAuthMethod(authMethodResponse);
    } catch (err) {
      console.error('Error logging in with WebAuthn:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false); // Ensure loading is false on error
    }
    // No finally here, processAuthMethod or error handling will set isLoading
  }, [processAuthMethod]);
  
  const loginWithEthWallet = useCallback(async (connector: any) => { // connector is passed from UI
    setIsLoading(true);
    setError(null);
    try {
      await connectAsync({ connector });
      // Ensure wagmiClientConfig is correctly sourced and passed if getAccount/getWalletClient need it explicitly
      // For wagmi v1+, config is often implicitly handled by @wagmi/core if provider is setup
      const account = getAccount(wagmiClientConfig); 
      if (!account.address || !account.chainId) { 
        throw new Error('Wallet not connected or address/chainId unavailable.');
      }
      const walletClient = await getWalletClient(wagmiClientConfig, { chainId: account.chainId });
      if (!walletClient) {
        throw new Error('Wallet client not found.');
      }

      const signMessage = async (messageToSign: string) => { // Renamed to avoid conflict
        return walletClient.signMessage({ account: account.address!, message: messageToSign });
      };

      const authMethodResponse = await authenticateWithEthWallet(account.address, signMessage);
      await processAuthMethod(authMethodResponse);
    } catch (err) {
      console.error('Error logging in with Eth Wallet:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }, [connectAsync, processAuthMethod, wagmiConfig]); // Added wagmiConfig to dependency array

  const loginWithStytchOtp = useCallback(async (token: string, userId?: string, methodType?: string) => { // Renamed 'method' to 'methodType'
    setIsLoading(true);
    setError(null);
    try {
      const authMethodResponse = await authenticateWithStytch(token, userId, methodType);
      await processAuthMethod(authMethodResponse);
    } catch (err) {
      console.error('Error logging in with Stytch OTP:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }, [processAuthMethod]);

  const registerWithWebAuthn = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newPkp = await litRegisterWebAuthn(); // Uses aliased import
      const authMethodForNewPkp = await authenticateWithWebAuthn();
      await updateSession(newPkp, authMethodForNewPkp);
    } catch (err) {
      console.error('Error registering with WebAuthn:', err);
      setError(err instanceof Error ? err : new Error(String(err)));
      setIsLoading(false);
    }
  }, [updateSession]); // Depends on updateSession
  
  // Logout
  const logOut = useCallback(() => {
    setAuthMethod(null);
    setPKPState(null); // Use renamed state setter
    setSessionSigsState(null); // Use renamed state setter
    setIsAuthenticated(false);
    setPendingPkpSelection(false);
    setAvailablePkps([]);
    setCurrentAuthMethodForPkpSelection(null);
    
    // Clear localStorage
    localStorage.removeItem('lit-auth-method');
    localStorage.removeItem('lit-pkp');
    localStorage.removeItem('lit-session-sigs');
    
    // Redirect to login page
    router.push('/login');
  }, [router]);

  // This setPKP is called by UI components, potentially the AccountSelection component
  const setPKP = useCallback(async (selectedPkp: IRelayPKP) => {
    if (pendingPkpSelection && currentAuthMethodForPkpSelection) {
      try {
        setIsLoading(true);
        await updateSession(selectedPkp, currentAuthMethodForPkpSelection);
        // updateSession now handles clearing pending states and redirecting
      } catch (err) {
        console.error('Error setting PKP after selection:', err);
        setError(err instanceof Error ? err : new Error(String(err)));
        // Reset PKP selection state on error
        setPendingPkpSelection(false);
        setAvailablePkps([]);
        setCurrentAuthMethodForPkpSelection(null);
        setIsAuthenticated(false); // Ensure user is not marked as authenticated
      } finally {
        setIsLoading(false);
      }
    } else {
      // This case might occur if setPKP is called directly, not part of PKP selection flow
      // For now, we'll assume it implies direct PKP setting, though current flow doesn't use this path.
      // If there's an authMethod already, we could try to update the session with it.
      // Or, this could be an error condition if called inappropriately.
      // For safety, let's just update the PKP state and log a warning.
      console.warn("setPKP called outside of pending selection flow. Current authMethod:", authMethod);
      setPKPState(selectedPkp); 
      // If there's a current authMethod, you might want to call updateSession here as well,
      // but ensure this is a desired behavior.
      // if (authMethod) {
      //   await updateSession(selectedPkp, authMethod);
      // }
    }
  }, [pendingPkpSelection, currentAuthMethodForPkpSelection, updateSession, authMethod]);


  // This setSessionSigs is mostly for internal or specific updates, not typical user flow
  const setSessionSigs = useCallback((newSessionSigs: SessionSigs) => {
    setSessionSigsState(newSessionSigs);
    localStorage.setItem('lit-session-sigs', JSON.stringify(newSessionSigs));
  }, []);


  // Context value
  const value: AuthContextType = {
    isAuthenticated,
    isLoading,
    authMethod,
    pkp: pkp, // Use the state variable pkp directly
    sessionSigs: sessionSigs, // Use the state variable sessionSigs directly
    error,
    pendingPkpSelection,
    availablePkps,
    
    loginWithGoogle,
    loginWithDiscord,
    loginWithEthWallet, // Added
    loginWithWebAuthn, // Now fully implemented
    loginWithStytchOtp, // Added
    registerWithWebAuthn, // Added
    logOut,
    setPKP, 
    setSessionSigs, 
    processAuthMethod,
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
