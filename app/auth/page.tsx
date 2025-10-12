"use client"; // Add this line at the very top

import { WagmiProvider, createConfig, http } from 'wagmi';
import { goerli, mainnet, optimism } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// import { StytchProvider } from '@stytch/nextjs';
// import { createStytchUIClient } from '@stytch/nextjs/ui';

import Image from 'next/image';

// 1. Initialize a QueryClient
const queryClient = new QueryClient();

// 2. Define your chains
const chains = [mainnet, goerli, optimism] as const; // `as const` for better type inference

// 3. Create the Wagmi config
export const config = createConfig({
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
  return (
    // 4. Wrap your app with QueryClientProvider and WagmiProvider
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <div className="auth-page">
          <h1>Authenticate</h1>
          <p>Choose your authentication method</p>
          <div className="buttons-container">
            <button type="button" className="btn btn--outline">
              <div className="btn__icon">
                <Image
                  src="/google.png"
                  alt="Google logo"
                  fill={true}
                ></Image>
              </div>
              <span className="btn__label">Continue with Google</span>
            </button>
            <button type="button" className="btn btn--outline">
              <div className="btn__icon">
                <Image
                  src="/discord.png"
                  alt="Discord logo"
                  fill={true}
                ></Image>
              </div>
              <span className="btn__label">Continue with Discord</span>
            </button>
            <button type="button" className="btn btn--outline">
              <div className="btn__icon">
                <Image
                  src="/webauthn.png"
                  alt="WebAuthn logo"
                  fill={true}
                ></Image>
              </div>
              <span className="btn__label">Continue with WebAuthn</span>
            </button>
            {/* Uncomment when Stytch is ready */}
            {/* <StytchProvider stytch={stytch}>
              {({ login }) => (
                <>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => login('email')}
                  >
                    Continue with Stytch Email
                  </button>
                  <button
                    type="button"
                    className="btn btn--outline"
                    onClick={() => login('sms')}
                  >
                    Continue with Stytch SMS
                  </button>
                </>
              )}
            </StytchProvider> */}
          </div>
          {/* Example of how to use connect buttons (you'll need to implement the actual connection logic) */}
          {/* <ConnectButtons /> */}
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

/*
// Example component to demonstrate connection (you would typically place this elsewhere)
// and use hooks like useConnect, useAccount, useDisconnect from 'wagmi'

import { useConnect, useAccount, useDisconnect } from 'wagmi';

function ConnectButtons() {
  const { connectors, connect } = useConnect();
  const { address, isConnected } = useAccount();
  const { disconnect } = useDisconnect();

  if (isConnected) {
    return (
      <div>
        <p>Connected as: {address}</p>
        <button onClick={() => disconnect()} className="btn">Disconnect</button>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
      {connectors.filter(c => c.ready).map((connector) => (
        <button
          key={connector.id}
          onClick={() => connect({ connector })}
          className="btn btn--primary"
        >
          Connect with {connector.name}
        </button>
      ))}
    </div>
  );
}
*/