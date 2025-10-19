"use client";

import { useConnect, useAccount } from 'wagmi';
import { useIsMounted } from '../../hooks/useIsMounted';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useEffect, useRef } from 'react';
import Image from 'next/image';

interface WalletMethodsProps {
  authWithEthWallet: () => Promise<void>;
  setView: React.Dispatch<React.SetStateAction<string>>;
}

const WalletMethods = ({ authWithEthWallet, setView }: WalletMethodsProps) => {
  const isMounted = useIsMounted();
  const { connectors, connect } = useConnect();
  const { isConnected, connector: activeConnector } = useAccount();
  const { open } = useWeb3Modal();
  const authenticationAttempted = useRef(false);

  // When wallet connects via Web3Modal, authenticate with Lit
  useEffect(() => {
    if (isConnected && activeConnector && !authenticationAttempted.current) {
      // Trigger authentication with the connected wallet
      // The authenticateWithEthWallet function will use window.ethereum automatically
      authenticationAttempted.current = true;
      authWithEthWallet();
    }
  }, [isConnected, activeConnector, authWithEthWallet]);

  if (!isMounted) return null;

  const handleWeb3ModalOpen = async () => {
    await open();
  };

  return (
    <>
      <h1>Connect your web3 wallet</h1>
      <p>
        Connect your wallet then sign a message to verify you&apos;re the owner
        of the address.
      </p>
      <div className="buttons-container">
        {/* Web3Modal Button - Primary method */}
        <button
          type="button"
          className="btn btn--primary"
          onClick={handleWeb3ModalOpen}
        >
          <div className="btn__icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={1.5}
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M21 12a2.25 2.25 0 00-2.25-2.25H15a3 3 0 11-6 0H5.25A2.25 2.25 0 003 12m18 0v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6m18 0V9M3 12V9m18 0a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 9m18 0V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v3"
              />
            </svg>
          </div>
          <span className="btn__label">Connect Wallet</span>
        </button>

        {/* Fallback direct connector buttons */}
        {connectors.map(connector => (
          <button
            type="button"
            className="btn btn--outline"
            disabled={!connector.ready}
            key={connector.id}
            onClick={() => connect({ connector })}
          >
            {connector.name.toLowerCase() === 'metamask' && (
              <div className="btn__icon">
                <Image
                  src="/metamask.png"
                  alt="MetaMask logo"
                  fill={true}
                ></Image>
              </div>
            )}
            {connector.name.toLowerCase() === 'coinbase wallet' && (
              <div className="btn__icon">
                <Image
                  src="/coinbase.png"
                  alt="Coinbase logo"
                  fill={true}
                ></Image>
              </div>
            )}
            <span className="btn__label">Continue with {connector.name}</span>
          </button>
        ))}
        <button onClick={() => setView('default')} className="btn btn--link">
          Back
        </button>
      </div>
    </>
  );
};

export default WalletMethods;