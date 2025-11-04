import { createConfig, http } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum, base } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet, metaMask } from 'wagmi/connectors';
import type { Chain } from 'viem';

export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set');
}

export const metadata = {
  name: 'Y8 App',
  description: 'Premier lifestyle services for everyone.',
  url: typeof window !== 'undefined' ? window.location.origin : `https://${process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost:3000'}`,
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

/**
 * Type alias for AppKit network configuration.
 * Used for type-safe network definitions with @web3modal/wagmi (Reown AppKit).
 */
export type AppKitNetwork = Chain;

/**
 * Networks supported by AppKit (Web3Modal).
 * Exported as a tuple with at least one network to ensure type safety.
 * This array includes additional networks (like base) that may not be in the wagmiConfig chains.
 */
export const networks = [mainnet, polygon, arbitrum, optimism, base] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

// Directly define chains array as a tuple
export const chains = [mainnet, polygon, optimism, arbitrum] as const;

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    walletConnect({ 
      projectId,
      metadata,
      showQrModal: false,
    }),
    injected({ shimDisconnect: true }),
    metaMask(),
    coinbaseWallet({
      appName: metadata.name,
      appLogoUrl: metadata.icons[0],
    }),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
    [arbitrum.id]: http(),
  },
  ssr: true,
});
