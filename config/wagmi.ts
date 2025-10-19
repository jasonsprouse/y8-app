import { createConfig, http } from 'wagmi';
import { mainnet, polygon, optimism } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet, metaMask } from 'wagmi/connectors';

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

const chains = [mainnet, polygon, optimism] as const;

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    walletConnect({ 
      projectId,
      metadata,
      showQrModal: false, // Web3Modal will handle the QR modal
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
  },
  ssr: true,
});