"use client";

import React from 'react';
import dynamic from 'next/dynamic';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { wagmiConfig} from '../config/wagmi';

const AiAgent = dynamic(() => import('./AiAgent'), { ssr: false });

const queryClient = new QueryClient();

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>
          {children}
          <AiAgent />
        </AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}