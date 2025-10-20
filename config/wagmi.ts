import { createConfig, http } from 'wagmi';
import { mainnet, polygon, optimism } from 'wagmi/chains';
import { metaMask, walletConnect, coinbaseWallet, injected } from 'wagmi/connectors';

export const wagmiConfig = createConfig({
  autoConnect: true,
  chains: [mainnet, polygon, optimism],
  connectors: [
    metaMask(),
    walletConnect({
      projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || 'your-project-id',
    }),
    coinbaseWallet({
      appName: 'Y8 App',
    }),
    injected(),
  ],
  transports: {
    [mainnet.id]: http(),
    [polygon.id]: http(),
    [optimism.id]: http(),
  },
});