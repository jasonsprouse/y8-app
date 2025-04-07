"use client";

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { BrowserProvider } from 'ethers';

// Define Ethereum provider interface for window.ethereum
interface EthereumProvider {
  isMetaMask?: boolean;
  providers?: EthereumProvider[];
  request: (args: { method: string; params?: any[] }) => Promise<any>;
  on: (eventName: string, listener: (...args: any[]) => void) => void;
  removeListener?: (eventName: string, listener: (...args: any[]) => void) => void;
}

// Extend Window interface
declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

// Define the shape of our auth context state
interface AuthContextType {
  status: string;
  address: string;
  ensName: string | null;
  isAuthenticated: boolean;
  isConnected: boolean;
  userSignature: string | null;
  connect: () => Promise<void>;
  requestSignature: () => Promise<void>;
  disconnect: () => void;
}

// Create the context with a default value
const AuthContext = createContext<AuthContextType | null>(null);

// Define props for the provider component
interface AuthProviderProps {
  children: ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  const [status, setStatus] = useState("Disconnected");
  const [address, setAddress] = useState("Not connected");
  const [ensName, setEnsName] = useState<string | null>(null);
  const [userSignature, setUserSignature] = useState<string | null>(null);
  const [isMobileDevice, setIsMobileDevice] = useState(false);

  // Create a unique signature message with timestamp
  const signatureMessage = `Welcome to Y8!\n\nClick to sign in and authenticate with your wallet.\n\nThis request will not trigger a blockchain transaction or cost any gas fees.\n\nTimestamp: ${Date.now()}`;

  // Simple cache for ENS names to reduce provider calls
  const ensCache = new Map<string, string | null>();

  // Check if device is mobile
  const checkIfMobile = () => {
    if (typeof navigator === 'undefined') return false;
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  };

  // Check if MetaMask is installed
  const isMetaMaskInstalled = () => {
    if (typeof window === 'undefined') return false;
    
    const { ethereum } = window;
    return Boolean(ethereum && 
      (ethereum.isMetaMask || 
       (ethereum.providers && 
        ethereum.providers.some((p: any) => p.isMetaMask))));
  };

  // Get the correct provider
  const getProvider = () => {
    if (typeof window === 'undefined') return null;
    
    try {
      const { ethereum } = window;
      if (!ethereum) return null;
      
      // If there are multiple providers, find MetaMask
      if (ethereum.providers) {
        const metaMaskProvider = ethereum.providers.find((p: any) => p.isMetaMask);
        if (metaMaskProvider) return new BrowserProvider(metaMaskProvider);
      }
      
      // Default to the window.ethereum provider
      return new BrowserProvider(ethereum);
    } catch (error) {
      console.error("Error creating provider:", error);
      return null;
    }
  };

  // Function to lookup ENS name for an address
  const lookupEnsName = async (address: string) => {
    try {
      // Check cache first
      if (ensCache.has(address)) {
        return ensCache.get(address);
      }
      
      const provider = getProvider();
      if (!provider) return null;
      
      // Attempt to resolve the ENS name
      const name = await provider.lookupAddress(address);
      
      // Cache the result (even if null)
      ensCache.set(address, name);
      
      return name;
    } catch (error) {
      console.error("Error looking up ENS name:", error);
      return null;
    }
  };

  // Function to open MetaMask on mobile
  const openMetaMaskMobile = () => {
    if (typeof window === 'undefined') return;

    // Store the current message for verification
    sessionStorage.setItem('authMessage', signatureMessage);
    
    // Create deep link that will trigger both connection and signing
    const dappUrl = `${window.location.host}${window.location.pathname}`;
    // The action=sign parameter signals to MetaMask that we want a signature
    const deepLink = `https://metamask.app.link/dapp/${dappUrl}?action=sign`;
    
    // Store a flag in sessionStorage to check if we're returning from MetaMask
    sessionStorage.setItem('metamaskPending', 'true');
    
    // Update status before redirect
    setStatus("Opening MetaMask...");
    
    // Open the deeplink
    window.location.href = deepLink;
  };

  // Function to request signature only (for retry)
  const requestSignature = async () => {
    try {
      const provider = getProvider();
      if (!provider) throw new Error("No provider available");
      
      const signer = await provider.getSigner();
      const newSignature = await signer.signMessage(signatureMessage);
      setUserSignature(newSignature);
      
      const signerAddress = await signer.getAddress();
      const formattedAddress = signerAddress.substring(0, 6) + "..." + 
        signerAddress.substring(signerAddress.length - 4);
      
      // Check for ENS name
      const name = await lookupEnsName(signerAddress);
      if (name) setEnsName(name);
      
      // Update UI after authentication
      setStatus("Authenticated ✓");
      setAddress(formattedAddress);
      
      // Store connection info but NOT the signature
      try {
        localStorage.setItem('walletAddress', signerAddress);
        localStorage.setItem('authStatus', 'Connected');
        if (name) localStorage.setItem('ensName', name);
      } catch (e) {
        console.error('Error accessing localStorage:', e);
      }
      
      console.log("Signature verified");
    } catch (error) {
      console.error("Signature request failed:", error);
      setStatus("Authentication failed");
    }
  };

  // Function to connect wallet 
  const connect = useCallback(async () => {
    // If on mobile and MetaMask not detected, deep link to MetaMask
    if (isMobileDevice && !isMetaMaskInstalled()) {
      openMetaMaskMobile();
      return;
    }

    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      try {
        // First request accounts to establish connection
        const provider = getProvider();
        if (!provider) throw new Error("No provider available");

        // Request account access - triggers MetaMask popup
        const accounts = await window.ethereum.request({ method: "eth_requestAccounts" });
        
        if (accounts.length === 0) {
          throw new Error("No accounts returned - user may have rejected request");
        }

        // Format the connected address
        const walletAddress = accounts[0];
        const formattedAddress = walletAddress.substring(0, 6) + "..." + 
          walletAddress.substring(walletAddress.length - 4);
        
        // Check for ENS name
        const name = await lookupEnsName(walletAddress);
        if (name) setEnsName(name);
        
        // Update UI to show connection is established but waiting for signature
        setAddress(formattedAddress);
        setStatus("Connected (Signing...)");
        
        try {
          // Now request signature for authentication
          const signer = await provider.getSigner();
          const signature = await signer.signMessage(signatureMessage);
          setUserSignature(signature);
          
          // Update UI after successful authentication
          setStatus("Authenticated ✓");
          
          // Store only connection info in localStorage, NOT the signature
          try {
            console.log("Storing auth info in localStorage");
            localStorage.setItem('walletAddress', walletAddress);
            localStorage.setItem('authStatus', "Authenticated ✓");
            
            // Add an expiration time (optional, 24 hours from now)
            const expiryTime = Date.now() + (24 * 60 * 60 * 1000);
            localStorage.setItem('authExpiry', expiryTime.toString());
            
            if (name) localStorage.setItem('ensName', name);
          } catch (e) {
            console.error('Error accessing localStorage:', e);
          }
          
          console.log("Authentication successful!");
        } catch (signError) {
          console.error("Error during signature:", signError);
          setStatus("Connected (Not Authenticated)");
          
          // Store connection (without auth) info
          try {
            localStorage.setItem('walletAddress', walletAddress);
            localStorage.setItem('authStatus', 'Connected');
            if (name) localStorage.setItem('ensName', name);
          } catch (e) {
            console.error('Error accessing localStorage:', e);
          }
        }
      } catch (error) {
        console.error("Failed to connect wallet:", error);
        
        // Handle specific errors
        if (error.code === -32002) {
          // Connection request already pending
          setStatus("Request Pending");
          setAddress("Check MetaMask");
        } else if (error.code === 4001) {
          // User rejected request
          setStatus("Rejected");
          setAddress("User rejected connection");
        } else {
          setStatus("Error");
          setAddress("Connection failed");
        }
      }
    } else {
      console.log('MetaMask (or other wallet) is not installed!');
      setStatus("No Wallet");
      setAddress("Install MetaMask");
    }
  }, [isMobileDevice]);

  // Function to disconnect wallet
  const disconnect = () => {
    setStatus("Disconnected");
    setAddress("Not connected");
    setEnsName(null);
    setUserSignature(null);
    
    // Clear localStorage
    try {
      console.log("Clearing auth info from localStorage");
      localStorage.removeItem('walletAddress');
      localStorage.removeItem('authStatus');
      localStorage.removeItem('ensName');
    } catch (e) {
      console.error('Error accessing localStorage:', e);
    }
  };

  // Check for existing connection on component mount
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return;
    
    console.log("AuthContext initializing...");
    
    // Safe access of localStorage with try/catch
    const getStoredValue = (key: string) => {
      try {
        const value = localStorage.getItem(key);
        console.log(`Retrieved ${key} from localStorage:`, value);
        return value;
      } catch (e) {
        console.error('Error accessing localStorage:', e);
        return null;
      }
    };
    
    // Check if mobile
    setIsMobileDevice(checkIfMobile());
    
    // Check for existing connection in localStorage
    const storedAddress = getStoredValue('walletAddress');
    const storedStatus = getStoredValue('authStatus');
    const storedEnsName = getStoredValue('ensName');
    
    if (storedAddress) {
      console.log("Found stored address, restoring auth state");
      const formattedAddress = storedAddress.substring(0, 6) + "..." + 
        storedAddress.substring(storedAddress.length - 4);
      setAddress(formattedAddress);
      
      if (storedEnsName) {
        setEnsName(storedEnsName);
      }
      
      // Keep the authenticated status instead of changing to Re-auth needed
      setStatus(storedStatus || "Connected");
    }
    
    // Check if returning from MetaMask mobile
    const isPending = sessionStorage.getItem('metamaskPending') === 'true';
    if (isPending) {
      // Clear the pending flag
      sessionStorage.removeItem('metamaskPending');
      
      // If we have ethereum, try to connect and sign immediately
      if (typeof window !== 'undefined' && window.ethereum) {
        console.log("Returning from MetaMask, attempting authentication...");
        connect();
      }
    }
    
    // Set up account change listener
    if (typeof window !== 'undefined' && typeof window.ethereum !== 'undefined') {
      const handleAccountsChanged = async (accounts: string[]) => {
        if (accounts.length === 0) {
          // Wallet disconnected
          disconnect();
        } else {
          // Account changed, update display
          const walletAddress = accounts[0];
          const formattedAddress = walletAddress.substring(0, 6) + "..." + 
            walletAddress.substring(walletAddress.length - 4);
          setAddress(formattedAddress);
          
          // Check for ENS name
          const name = await lookupEnsName(walletAddress);
          if (name) setEnsName(name);
          
          setStatus("Connected");
          // Clear signature as it's no longer valid for the new account
          setUserSignature(null);
          
          // Update localStorage - but never store signatures
          try {
            localStorage.setItem('walletAddress', walletAddress);
            localStorage.setItem('authStatus', 'Connected');
            if (name) localStorage.setItem('ensName', name);
          } catch (e) {
            console.error('Error accessing localStorage:', e);
          }
        }
      };

      window.ethereum.on('accountsChanged', handleAccountsChanged);

      // Add a visibility change listener to detect returning from MetaMask
      const handleVisibilityChange = () => {
        if (!document.hidden && sessionStorage.getItem('metamaskPending') === 'true') {
          // User has come back from MetaMask, try to connect and authenticate
          connect();
        }
      };
      
      document.addEventListener('visibilitychange', handleVisibilityChange);

      // Cleanup listeners on component unmount
      return () => {
        if (window.ethereum.removeListener) {
          window.ethereum.removeListener('accountsChanged', handleAccountsChanged);
        }
        document.removeEventListener('visibilitychange', handleVisibilityChange);
      };
    }
  }, [connect]);

  // Define computed properties
  const isAuthenticated = status.includes("Authenticated");
  const isConnected = isAuthenticated || status.includes("Connected");

  // Create the auth value object that will be passed to consumers
  const authValue: AuthContextType = {
    status,
    address,
    ensName,
    isAuthenticated,
    isConnected,
    userSignature,
    connect,
    requestSignature,
    disconnect
  };

  return (
    <AuthContext.Provider value={authValue}>
      {children}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};