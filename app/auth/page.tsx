"use client"; // Add this line at the very top

import { WagmiProvider, createConfig, http } from 'wagmi';
import { goerli, mainnet, optimism } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// import { StytchProvider } from '@stytch/nextjs';
// import { createStytchUIClient } from '@stytch/nextjs/ui';

// import Image from 'next/image';
import { useEffect, useState } from 'react'; // Added useState
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext'; 
import LoginMethods from '../../components/LitAuth/LoginMethods'; 
import SignUpMethods from '../../components/LitAuth/SignUpMethods'; // Added
import AccountSelection from '../../components/LitAuth/AccountSelection'; 
import Loading from '../../components/LitAuth/Loading'; 

// 1. Initialize a QueryClient
const queryClient = new QueryClient();

// 2. Define your chains
const chains = [mainnet, goerli, optimism] as const; // `as const` for better type inference

// 3. Create the Wagmi config
export const wagmiClientConfig = createConfig({
  chains: chains,
  connectors: [
    metaMask({
      // Consider adding dappMetadata for a better user experience in MetaMask
      // dappMetadata: {
      //   name: 'My Awesome DApp',
      //   url: typeof window !== 'undefined' ? window.location.host : 'https://example.com',
      // },
    }),
    coinbaseWallet({
      appName: 'wagmi (Coinbase Wallet Example)', // Recommended to set your app name
      // appLogoUrl: 'YOUR_APP_LOGO_URL', // Optional: provide a logo URL
    }),
    // Add other connectors here if needed, e.g., walletConnect
    // walletConnect({ projectId: 'YOUR_WALLETCONNECT_PROJECT_ID' }),
  ],
  transports: {
    // Configure an HTTP transport for each chain
    // It's highly recommended to use your own RPC URLs for production
    [mainnet.id]: http(), // Uses public RPC by default, or provide your URL: http('https://your-mainnet-rpc.com')
    [goerli.id]: http(),  // Uses public RPC by default, or provide your URL: http('https://your-goerli-rpc.com')
    [optimism.id]: http(),// Uses public RPC by default, or provide your URL: http('https://your-optimism-rpc.com')
  },
  // ssr: true, // Enable if using SSR/SSG for proper hydration, especially with Next.js
  // reconnectOnMount: true, // Optional: manage reconnection behavior
});

//   const stytch = createStytchUIClient(
//     process.env.NEXT_PUBLIC_STYTCH_PUBLIC_TOKEN || ''
//   );

export default function AuthPage() {
  const router = useRouter();
  const {
    isAuthenticated,
    isLoading,
    error,
    pendingPkpSelection,
    availablePkps,
    setPKP,
    loginWithGoogle,
    loginWithDiscord,
    loginWithEthWallet,    // New
    loginWithWebAuthn,    
    loginWithStytchOtp,   // New
    registerWithWebAuthn // New
    // processAuthMethod, // Not directly called by page, but by context
  } = useAuth();

  const [showSignUp, setShowSignUp] = useState(false); // Added state for view toggle

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/space');
    }
  }, [isAuthenticated, router]);

  // The WagmiProvider and QueryClientProvider should wrap the conditional rendering logic
  // to ensure context is available to all components that might need it (e.g., WalletMethods inside LoginMethods).
  let content;

  if (isLoading) {
    content = <Loading copy="Initializing authentication..." />;
  } else if (error) {
    // Render error within the layout provided by LoginMethods or AccountSelection if desired,
    // or a generic error display if the error is fatal for the page.
    // For simplicity, a generic error display here.
    // If specific components should display the error, pass it as a prop.
    content = (
      <div className="container">
        <div className="wrapper">
          <div className="alert alert--error">
            <p>Error: {error.message}</p>
          </div>
        </div>
      </div>
    );
  } else if (pendingPkpSelection && availablePkps && availablePkps.length > 0) {
    content = (
      <AccountSelection
        accounts={availablePkps}
        setCurrentAccount={setPKP}
        error={error} // Pass error if it's relevant to account selection stage
      />
    );
  } else if (!isAuthenticated) {
    if (showSignUp) {
      content = (
        <SignUpMethods
          handleGoogleLogin={loginWithGoogle}
          handleDiscordLogin={loginWithDiscord}
          authWithEthWallet={loginWithEthWallet}
          registerWithWebAuthn={registerWithWebAuthn}
          authWithWebAuthn={loginWithWebAuthn} // For "already have account" or similar flows
          authWithStytch={loginWithStytchOtp}
          goToLogin={() => setShowSignUp(false)}
          error={error}
        />
      );
    } else {
      content = (
        <LoginMethods
          handleGoogleLogin={loginWithGoogle}
          handleDiscordLogin={loginWithDiscord}
          authWithWebAuthn={loginWithWebAuthn}
          authWithEthWallet={loginWithEthWallet}
          authWithStytch={loginWithStytchOtp}
          signUp={() => setShowSignUp(true)}
          error={error}
        />
      );
    }
  } else {
    // Should be redirected by useEffect, but as a fallback:
    content = <Loading copy="Redirecting..." />;
  }
  
  return (
    // 4. Wrap your app with QueryClientProvider and WagmiProvider
    <WagmiProvider config={wagmiClientConfig}>
      <QueryClientProvider client={queryClient}>
        {content}
      </QueryClientProvider>
    </WagmiProvider>
  );
}

/* 
// Removed the static buttons and ConnectButtons example as AuthPage will now dynamically render based on auth state.
// Ensure that AuthProvider is wrapping this page at a higher level (e.g., in layout.tsx).
*/