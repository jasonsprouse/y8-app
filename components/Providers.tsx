"use client";

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { wagmiConfig} from '../config/wagmi';

const queryClient = new QueryClient();

import AuthLoader from './AuthLoader';

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          <AuthLoader />
          {children}
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}