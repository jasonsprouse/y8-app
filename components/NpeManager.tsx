"use client";

import React, { useState } from 'react';
import { IRelayPKP } from '@lit-protocol/types';
import { useAuth } from '../context/AuthContext';

const NpeManager = () => {
  const { registerWebAuthn } = useAuth();
  const [newPkp, setNewPkp] = useState<IRelayPKP | null>(null);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [error, setError] = useState<Error | null>(null);

  const handleMintPkp = async () => {
    setIsMinting(true);
    setError(null);
    try {
      const pkp = await registerWebAuthn();
      setNewPkp(pkp);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to mint PKP'));
    } finally {
      setIsMinting(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h2 className="text-xl font-bold mb-4">NPE Manager</h2>
      <button
        onClick={handleMintPkp}
        disabled={isMinting}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-gray-400"
      >
        {isMinting ? 'Minting PKP...' : 'Create New NPE'}
      </button>

      {newPkp && (
        <div className="mt-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          <h3 className="font-bold">New PKP Created!</h3>
          <p><strong>Token ID:</strong> {newPkp.tokenId}</p>
          <p><strong>Public Key:</strong> {newPkp.publicKey}</p>
          <p><strong>ETH Address:</strong> {newPkp.ethAddress}</p>
        </div>
      )}

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          <h3 className="font-bold">Error</h3>
          <p>{error.message}</p>
        </div>
      )}
    </div>
  );
};

export default NpeManager;