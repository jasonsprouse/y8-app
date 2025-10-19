import { createConfig } from 'wagmi';
import { mainnet, polygon, optimism } from 'wagmi/chains';
import { http } from 'viem';
import { MetaMaskConnector } from 'wagmi/connectors/metaMask';
import { WalletConnectConnector } from 'wagmi/connectors/walletConnect';
import { CoinbaseWalletConnector } from 'wagmi/connectors/coinbaseWallet';
import { InjectedConnector } from 'wagmi/connectors/injected';

const chains = [mainnet, polygon, optimism];

const transports = Object.fromEntries(
  chains.map((chain) => [chain.id, http()]),
);

export const wagmiConfig = createConfig({
  autoConnect: true,
  ssr: true,
  chains,
  connectors: [
    new MetaMaskConnector({ chains }),
    new WalletConnectConnector({
      chains,
      options: {
        projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || '',
        showQrModal: true,
        metadata: {
          name: 'Y8 App',
          description: 'Premier lifestyle services for everyone.',
          url: `https://${process.env.NEXT_PUBLIC_DOMAIN ?? 'localhost:3000'}`,
          icons: ['https://avatars.githubusercontent.com/u/37784886'],
        },
      },
    }),
    new CoinbaseWalletConnector({
      chains,
      options: {
        appName: 'Y8 App',
        appLogoUrl: 'https://avatars.githubusercontent.com/u/37784886',
      },
    }),
    new InjectedConnector({
      chains,
      options: { shimDisconnect: true },
    }),
  ],
  transports,
});