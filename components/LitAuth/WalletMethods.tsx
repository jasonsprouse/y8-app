"use client";

import { useConnect, useAccount, useDisconnect, useSignMessage } from 'wagmi';
import { useIsMounted } from '../../hooks/useIsMounted';
import { useWeb3Modal, useWeb3ModalState, useWalletInfo } from '@web3modal/wagmi/react';
import { useEffect, useRef } from 'react';
import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';
import type { AuthView } from '../../types/AuthView';


interface WalletMethodsProps {
  authWithEthWallet: (address?: string, signMessage?: (message: string) => Promise<string>) => Promise<void>;
  setView: React.Dispatch<React.SetStateAction<AuthView>>;
}

const WalletMethods = ({ setView }: WalletMethodsProps) => {
  const isMounted = useIsMounted();
  const { connectors, connect } = useConnect();
  const { isConnected, connector: activeConnector, address } = useAccount();
  const { disconnect } = useDisconnect();
  const { signMessageAsync } = useSignMessage();
  const { loginWithEthWallet } = useAuth(); // Use AuthContext
  
  // Use all available Web3Modal hooks for full compliance
  // Hooks must be called unconditionally at the top level
  const { open: web3ModalOpen, close: web3ModalClose } = useWeb3Modal();
  const modalState = useWeb3ModalState();
  const walletInfo = useWalletInfo();
  
  const authenticationAttempted = useRef(false);

  // When wallet connects via Web3Modal, authenticate with Lit using AuthContext
  useEffect(() => {
    if (isConnected && activeConnector && address && !authenticationAttempted.current) {
      // Trigger authentication with the connected wallet
      authenticationAttempted.current = true;
      
      // Create a signMessage function using wagmi's signMessageAsync
      (async () => {
        try {
          const signMessage = async (message: string) => {
            const sig = await signMessageAsync({ 
              message,
              account: address
            });
            return sig;
          };
          
          // Call AuthContext's loginWithEthWallet with address and signMessage
          await loginWithEthWallet(address, signMessage);
        } catch (error) {
          console.error('Error authenticating with wallet:', error);
          // Reset the flag if authentication fails, so it can be retried
          authenticationAttempted.current = false;
        }
      })();
    }
  }, [isConnected, activeConnector, address, loginWithEthWallet, signMessageAsync]);

  if (!isMounted) return null;

  // Handler to open Web3Modal with Connect view
  const handleWeb3ModalConnect = async () => {
    if (web3ModalOpen) {
      await web3ModalOpen({ view: 'Connect' });
    } else {
      console.error('Web3Modal is not available. Please set NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID environment variable.');
      alert('Web3Modal is not configured. Please use one of the direct wallet connection options below.');
    }
  };

  // Handler to open Web3Modal with Account view
  const handleWeb3ModalAccount = async () => {
    if (web3ModalOpen) {
      await web3ModalOpen({ view: 'Account' });
    } else {
      console.error('Web3Modal is not available.');
    }
  };

  // Handler to open Web3Modal with Networks view
  const handleWeb3ModalNetworks = async () => {
    if (web3ModalOpen) {
      await web3ModalOpen({ view: 'Networks' });
    } else {
      console.error('Web3Modal is not available.');
    }
  };

  // Handler to close Web3Modal
  const handleWeb3ModalClose = async () => {
    if (web3ModalClose) {
      await web3ModalClose();
    }
  };

  // Handler to disconnect wallet
  const handleDisconnect = async () => {
    disconnect();
    // Close modal if open
    if (modalState.open && web3ModalClose) {
      await web3ModalClose();
    }
  };

  return (
    <>
      <h1>Connect your web3 wallet</h1>
      <p>
        Connect your wallet then sign a message to verify you&apos;re the owner
        of the address.
      </p>
      
      {/* Display connected wallet info if available */}
      {isConnected && address && (
        <div className="wallet-info" style={{ 
          padding: '1rem', 
          marginBottom: '1rem', 
          backgroundColor: '#f5f5f5', 
          borderRadius: '8px',
          border: '1px solid #ddd'
        }}>
          <h3 style={{ marginTop: 0 }}>Connected Wallet</h3>
          <p style={{ marginBottom: '0.5rem' }}>
            <strong>Address:</strong> {address.slice(0, 6)}...{address.slice(-4)}
          </p>
          {walletInfo.walletInfo && (
            <p style={{ marginBottom: '0.5rem' }}>
              <strong>Wallet:</strong> {walletInfo.walletInfo.name || 'Unknown'}
            </p>
          )}
          {activeConnector && (
            <p style={{ marginBottom: 0 }}>
              <strong>Connector:</strong> {activeConnector.name}
            </p>
          )}
        </div>
      )}

      <div className="buttons-container">
        {/* Web3Modal Connect Button - Primary method for connecting */}
        {!isConnected && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleWeb3ModalConnect}
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
        )}

        {/* Web3Modal Account Button - Opens account view when connected */}
        {isConnected && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={handleWeb3ModalAccount}
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
                  d="M17.982 18.725A7.488 7.488 0 0012 15.75a7.488 7.488 0 00-5.982 2.975m11.963 0a9 9 0 10-11.963 0m11.963 0A8.966 8.966 0 0112 21a8.966 8.966 0 01-5.982-2.275M15 9.75a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
            </div>
            <span className="btn__label">View Account</span>
          </button>
        )}

        {/* Web3Modal Networks Button - Opens network selection */}
        {isConnected && (
          <button
            type="button"
            className="btn btn--outline"
            onClick={handleWeb3ModalNetworks}
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
                  d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418"
                />
              </svg>
            </div>
            <span className="btn__label">Switch Network</span>
          </button>
        )}

        {/* Disconnect Button - Disconnects the wallet */}
        {isConnected && (
          <button
            type="button"
            className="btn btn--outline"
            onClick={handleDisconnect}
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
                  d="M5.636 5.636a9 9 0 1012.728 0M12 3v9"
                />
              </svg>
            </div>
            <span className="btn__label">Disconnect</span>
          </button>
        )}

        {/* Close Modal Button - Closes Web3Modal if it's open */}
        {modalState.open && (
          <button
            type="button"
            className="btn btn--outline"
            onClick={handleWeb3ModalClose}
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
                  d="M6 18L18 6M6 6l12 12"
                />
              </svg>
            </div>
            <span className="btn__label">Close Modal</span>
          </button>
        )}

        {/* Fallback direct connector buttons - shown when not connected */}
        {!isConnected && connectors.map(connector => (
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
        
        <button onClick={() => setView('login')} className="btn btn--link">
          Back
        </button>
      </div>
    </>
  );
};

export default WalletMethods;