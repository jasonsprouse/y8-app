"use client";

import React, { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi';
import { AuthProvider } from '../context/AuthContext';
import { wagmiConfig, projectId, metadata } from '../config/wagmi';

const queryClient = new QueryClient();

// Initialize Web3Modal outside of component to avoid re-initialization
let web3modalInitialized = false;

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    
    // Initialize Web3Modal only once on client side
    if (!web3modalInitialized && typeof window !== 'undefined') {
      createWeb3Modal({
        wagmiConfig,
        projectId,
        themeMode: 'light',
        themeVariables: {
          '--w3m-accent': '#000000',
        },
        enableAnalytics: false,
      });
      web3modalInitialized = true;
    }
  }, []);

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}