import { createConfig, http } from 'wagmi';
import { base, mainnet, polygon, arbitrum, optimism } from 'viem/chains';
import { coinbaseWallet } from 'wagmi/connectors';

/**
 * Wagmi Configuration
 * 
 * Simplified configuration using Coinbase Smart Wallet connector.
 * Removed Reown AppKit as it had version conflicts with wagmi 2.18.1.
 */

const chains = [base, mainnet, polygon, arbitrum, optimism] as const;

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    coinbaseWallet({
      appName: 'Y8 App',
    }),
  ],
  transports: {
    [base.id]: http(),
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [arbitrum.id]: http(),
    [optimism.id]: http(),
  },
});

export const metadata = {
  name: 'Y8 App',
  description: 'Premier lifestyle services for everyone.',
  url: typeof window !== 'undefined' ? window.location.origin : `https://${process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost:3000'}`,
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};
