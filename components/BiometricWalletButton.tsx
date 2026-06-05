'use client';

import { useState } from 'react';
import { useConnect } from 'wagmi';
import { useAccount } from 'wagmi';
import toast from 'react-hot-toast';

/**
 * BiometricWalletButton
 * 
 * Initiates connection via Coinbase Smart Wallet with Passkey (Fingerprint) flow.
 * Uses Account Abstraction (ERC-4337) for sponsored transactions on Base.
 * The Coinbase Smart Wallet automatically sponsors the deployment gas via Paymaster.
 */
export default function BiometricWalletButton() {
  const [isLoading, setIsLoading] = useState(false);
  const { connect, connectors } = useConnect();
  const { isConnected, address } = useAccount();

  const handleBiometricConnect = async () => {
    try {
      setIsLoading(true);

      // Find the Coinbase connector in the available connectors
      const coinbaseConnector = connectors.find(
        (c) => c.name.toLowerCase().includes('coinbase')
      );

      if (!coinbaseConnector) {
        toast.error('Coinbase Smart Wallet connector not available');
        return;
      }

      // Trigger the Passkey (Face ID) flow
      connect({ connector: coinbaseConnector });
      toast.success('Initiating biometric authentication...');
    } catch (error) {
      console.error('Biometric connection error:', error);
      toast.error('Failed to initiate biometric connection');
    } finally {
      setIsLoading(false);
    }
  };

  // Show connected state if wallet is already connected
  if (isConnected && address) {
    return (
      <button
        disabled
        className="px-4 py-2 bg-green-600 text-white rounded-lg font-semibold"
      >
        ✓ Connected: {address.slice(0, 6)}...{address.slice(-4)}
      </button>
    );
  }

  return (
    <button
      onClick={handleBiometricConnect}
      disabled={isLoading}
      className="px-6 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg font-semibold transition-colors duration-200"
    >
      {isLoading ? 'Connecting...' : '� Connect with Fingerprint'}
    </button>
  );
}
