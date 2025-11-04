"use client";

import React, { useEffect, useRef } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createAppKit } from '@reown/appkit/react';
import { wagmiAdapter, wagmiConfig, networks, projectId, metadata } from '../config/wagmi';
import { AuthProvider } from '../context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

export default function Providers({ children }: { children: React.ReactNode }) {
  const appKitInitialized = useRef(false);

  useEffect(() => {
    if (typeof window !== 'undefined' && !appKitInitialized.current) {
      createAppKit({
        adapters: [wagmiAdapter],
        networks: [...networks],
        projectId,
        metadata,
        themeMode: 'dark',
      });
      appKitInitialized.current = true;
    }
  }, []);

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
