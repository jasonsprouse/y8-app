import { createConfig, http } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { walletConnect, injected, coinbaseWallet, metaMask } from 'wagmi/connectors';

// projectId must be a string, not undefined, for Web3Modal to work correctly
// When undefined is passed to createWeb3Modal, it doesn't set the x-project-id header
export const projectId = process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '';

if (!projectId) {
  console.warn('NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID is not set. Web3Modal features will be limited.');
}


export const metadata = {
  name: 'Y8 App',
  description: 'Premier lifestyle services for everyone.',
  url: typeof window !== 'undefined' ? window.location.origin : `https://${process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost:3000'}`,
  icons: ['https://avatars.githubusercontent.com/u/37784886'],
};

// Directly define chains array as a tuple
export const chains = [mainnet, polygon, optimism, arbitrum] as const;

export const wagmiConfig = createConfig({
  chains,
  connectors: [
    // Only include WalletConnect connector if projectId is a non-empty string
    ...(projectId !== '' ? [walletConnect({ 
      projectId,
      metadata,
      showQrModal: false,
    })] : []),
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
  ssr: false,
  syncConnectedChain: true
});
