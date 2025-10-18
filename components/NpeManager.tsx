"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { IRelayPKP } from '@lit-protocol/types';
import { getPKPs } from '../utils/lit';

// NOTE: The schema data is currently stored in the client-side state and will not persist.
// A proper implementation would require a backend to store and retrieve this data.

interface NpeSchema {
  [key: string]: string;
}

const NpeManager = () => {
  const { registerWebAuthn, authMethod } = useAuth();
  const [newPkp, setNewPkp] = useState<IRelayPKP | null>(null);
  const [allPkps, setAllPkps] = useState<IRelayPKP[]>([]);
  const [schemas, setSchemas] = useState<{ [ethAddress: string]: NpeSchema }>({});
  const [newSchemaField, setNewSchemaField] = useState<{ [ethAddress: string]: string }>({});
  const [error, setError] = useState<Error | null>(null);
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  const handleMint = async () => {
    setIsMinting(true);
    setError(null);
    try {
      const pkp = await registerWebAuthn();
      if (pkp) {
        setNewPkp(pkp);
        setSchemas((prev) => ({
          ...prev,
          [pkp.ethAddress]: {
            agentInteractions: '',
            litActions: '',
            gblEnvironments: '',
            xrNetworking: '',
          },
        }));
      } else {
        setError(new Error('Failed to mint PKP: No PKP returned'));
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsMinting(false);
    }
  };

  const fetchPkps = async () => {
    if (!authMethod) {
      setError(new Error('You must be logged in to fetch PKPs.'));
      return;
    }
    setIsFetching(true);
    setError(null);
    try {
      const pkps = await getPKPs(authMethod);
      setAllPkps(pkps);
      const initialSchemas = pkps.reduce((acc, pkp) => {
        acc[pkp.ethAddress] = {
          agentInteractions: '',
          litActions: '',
          gblEnvironments: '',
          xrNetworking: '',
        };
        return acc;
      }, {} as { [ethAddress: string]: NpeSchema });
      setSchemas(initialSchemas);
    } catch (err) {
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setIsFetching(false);
    }
  };

  const handleSchemaChange = (ethAddress: string, field: string, value: string) => {
    setSchemas((prev) => ({
      ...prev,
      [ethAddress]: {
        ...prev[ethAddress],
        [field]: value,
      },
    }));
  };

  const handleAddSchemaField = (ethAddress: string) => {
    const fieldName = newSchemaField[ethAddress];
    if (fieldName && !schemas[ethAddress][fieldName]) {
      handleSchemaChange(ethAddress, fieldName, '');
      setNewSchemaField((prev) => ({ ...prev, [ethAddress]: '' }));
    }
  };

  useEffect(() => {
    if (authMethod) {
      fetchPkps();
    }
  }, [authMethod]);

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4">NPE Manager</h2>
      <div className="flex space-x-4 mb-4">
        <button
          onClick={handleMint}
          disabled={isMinting}
          className="btn btn-primary"
        >
          {isMinting ? 'Minting...' : 'Generate NPE'}
        </button>
        <button
          onClick={fetchPkps}
          disabled={isFetching}
          className="btn btn-secondary"
        >
          {isFetching ? 'Fetching...' : 'Refresh PKPs'}
        </button>
      </div>
      {newPkp && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">New PKP Created</h3>
          <pre className="bg-gray-100 p-2 rounded">
            {JSON.stringify(newPkp, null, 2)}
          </pre>
        </div>
      )}
      {allPkps.length > 0 && (
        <div className="mt-4">
          <h3 className="text-xl font-bold">Your PKPs</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allPkps.map((pkp) => (
              <div key={pkp.ethAddress} className="border rounded-lg p-4">
                <p className="font-bold">PKP Address:</p>
                <p className="break-all">{pkp.ethAddress}</p>
                <p className="font-bold mt-2">Public Key:</p>
                <p className="break-all">{pkp.publicKey}</p>
                <div className="mt-4">
                  <h4 className="font-bold">Schema</h4>
                  {Object.keys(schemas[pkp.ethAddress] || {}).map((key) => (
                    <div key={key} className="mt-2">
                      <label className="block text-sm font-medium text-gray-700">{key}</label>
                      <input
                        type="text"
                        value={schemas[pkp.ethAddress][key]}
                        onChange={(e) => handleSchemaChange(pkp.ethAddress, key, e.target.value)}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                  ))}
                  <div className="mt-2">
                    <input
                      type="text"
                      placeholder="New field name"
                      value={newSchemaField[pkp.ethAddress] || ''}
                      onChange={(e) => setNewSchemaField((prev) => ({ ...prev, [pkp.ethAddress]: e.target.value }))}
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    />
                    <button
                      onClick={() => handleAddSchemaField(pkp.ethAddress)}
                      className="btn btn-secondary mt-2"
                    >
                      Add Field
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {error && (
        <div className="mt-4 text-red-500">
          <h3 className="text-xl font-bold">Error</h3>
          <pre>{error.message}</pre>
        </div>
      )}
    </div>
  );
};

export default NpeManager;