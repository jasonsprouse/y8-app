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

import React from 'react';
import { WagmiProvider } from 'wagmi';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { createWeb3Modal } from '@web3modal/wagmi/react';
import { wagmiConfig, projectId } from '../config/wagmi';
import { AuthProvider } from '../context/AuthContext';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: { refetchOnWindowFocus: false, retry: 1 },
  },
});

// Initialize Web3Modal at module level so it's available before any components mount
// This is critical for production builds where timing matters
// The window check is necessary because this module is evaluated during Next.js build (SSR)
// even though it's marked as "use client"
// We always initialize the modal, even without projectId, to ensure hooks work properly
// Without projectId, it will only support injected wallets (MetaMask, etc.)
if (typeof window !== 'undefined') {
  createWeb3Modal({
    wagmiConfig,
    projectId: projectId || undefined, // Pass undefined instead of empty string
  });
}

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <AuthProvider>{children}</AuthProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
