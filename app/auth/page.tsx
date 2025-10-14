"use client";

import { WagmiProvider, createConfig, http } from 'wagmi';
import { goerli, mainnet, optimism } from 'wagmi/chains';
import { coinbaseWallet, metaMask } from 'wagmi/connectors';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Image from 'next/image';
import { signInWithGoogle, signInWithDiscord } from '../../utils/lit';

// 1. Initialize a QueryClient
const queryClient = new QueryClient();

// 2. Define your chains
const chains = [mainnet, goerli, optimism] as const;

// 3. Create the Wagmi config - RENAMED from 'config' to 'wagmiConfig'
const wagmiConfig = createConfig({
  chains: chains,
  connectors: [
    metaMask(),
    coinbaseWallet({
      appName: 'Y8 App',
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [goerli.id]: http(),
    [optimism.id]: http(),
  },
});

export default function AuthPage() {
  const handleGoogleLogin = async () => {
    const redirectUri = `${window.location.origin}/auth/callback/google`;
    await signInWithGoogle(redirectUri);
  };

  const handleDiscordLogin = async () => {
    const redirectUri = `${window.location.origin}/auth/callback/discord`;
    await signInWithDiscord(redirectUri);
  };

  return (
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <div className="auth-page">
          <h1>Authenticate</h1>
          <p>Choose your authentication method</p>
          <div className="buttons-container">
            <button type="button" className="btn btn--outline" onClick={handleGoogleLogin}>
              <div className="btn__icon">
                <Image
                  src="/google.png"
                  alt="Google logo"
                  fill={true}
                ></Image>
              </div>
              <span className="btn__label">Continue with Google</span>
            </button>
            <button type="button" className="btn btn--outline" onClick={handleDiscordLogin}>
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
          </div>
        </div>
      </QueryClientProvider>
    </WagmiProvider>
  );
}