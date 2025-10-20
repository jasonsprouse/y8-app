"use client";

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from '../context/AuthContext';
import { wagmiConfig } from '../config/wagmi';

// Web3Modal imports - initialize once so useWeb3Modal hook works
import { createWeb3Modal, Web3ModalProvider } from '@web3modal/react';

const queryClient = new QueryClient();

// Create the Web3Modal instance at module initialization so it exists before any hook usage
// Ensure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set in env when using WalletConnect; leave undefined otherwise
const web3Modal = createWeb3Modal({
  wagmiConfig,
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
});

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <Web3ModalProvider web3modal={web3Modal}>
        <QueryClientProvider client={queryClient}>
          <AuthProvider>{children}</AuthProvider>
        </QueryClientProvider>
      </Web3ModalProvider>
    </WagmiProvider>
  );
}
