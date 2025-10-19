"use client";

import React, { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi';
import { AuthProvider } from '../context/AuthContext';
import { wagmiConfig, projectId, metadata } from '../config/wagmi';

const queryClient = new QueryClient();

// Initialize Web3Modal at module level to ensure it's ready before any component uses it
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig,
    projectId,
    themeMode: 'light',
    themeVariables: {
      '--w3m-accent': '#000000',
    },
    enableAnalytics: false,
  });
}

export default function Providers({ children }: { children: React.ReactNode }) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
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