"use client";

import React from 'react';
import { SessionProvider } from 'next-auth/react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { wagmiConfig } from '../config/wagmi';
import { AuthProvider } from '../context/AuthContext';

/**
 * Providers - Root provider hierarchy for Web3 and authentication
 * 
 * Provider stack:
 * 1. SessionProvider - NextAuth session management (required for useSession hook)
 * 2. WagmiProvider - Wallet state management (Coinbase Smart Wallet)
 * 3. QueryClientProvider - React Query for async state
 * 4. AuthProvider - Custom auth context wrapper for SIWE authentication
 */

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </SessionProvider>
  );
}
