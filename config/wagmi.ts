import { WagmiAdapter } from '@reown/appkit-adapter-wagmi';
import { mainnet, polygon, arbitrum, optimism, base, AppKitNetwork } from '@reown/appkit/networks';

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

// All networks
export const networks = [mainnet, polygon, arbitrum, optimism, base] as [
  AppKitNetwork,
  ...AppKitNetwork[],
];

// Single unified wagmi configuration using WagmiAdapter
export const wagmiAdapter = new WagmiAdapter({
  projectId,
  networks,
});

export const wagmiConfig = wagmiAdapter.wagmiConfig;
