// "use client";

// import React from 'react';
// import { WagmiProvider } from 'wagmi';
// import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
// import { AuthProvider } from '../context/AuthContext';
// import { wagmiConfig } from '../config/wagmi';

// // Web3Modal imports - initialize once so useWeb3Modal hook works
// import { createWeb3Modal, Web3ModalProvider } from '@web3modal/react';

// const queryClient = new QueryClient();

// // Create the Web3Modal instance at module initialization so it exists before any hook usage
// // Ensure NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is set in env when using WalletConnect; leave undefined otherwise
// const web3Modal = createWeb3Modal({
//   wagmiConfig,
//   projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID,
// });

// export default function Providers({ children }: { children: React.ReactNode }) {
//   return (
//     <WagmiProvider config={wagmiConfig}>
//       <Web3ModalProvider web3modal={web3Modal}>
//         <QueryClientProvider client={queryClient}>
//           <AuthProvider>{children}</AuthProvider>
//         </QueryClientProvider>
//       </Web3ModalProvider>
//     </WagmiProvider>
//   );
// }

"use client";

import React, { useEffect, useState } from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi';
import { AuthProvider } from '../context/AuthContext';
import { wagmiConfig, projectId, metadata } from '../config/wagmi';

const queryClient = new QueryClient();

// Global flag to ensure Web3Modal is only initialized once
let web3ModalInitialized = false;

// Initialize Web3Modal only if projectId is available
// This prevents errors when NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set
if (typeof window !== 'undefined' && projectId && !web3ModalInitialized) {
  try {
    createWeb3Modal({
      wagmiConfig,
      projectId,
      themeMode: 'light',
      themeVariables: {
        '--w3m-accent': '#000000',
      },
      enableAnalytics: false,
    });
    web3ModalInitialized = true;
  } catch (error) {
    console.error('Failed to initialize Web3Modal:', error);
  }
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
