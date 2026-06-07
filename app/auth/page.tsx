"use client";

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../context/AuthContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function AuthPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    // If user becomes authenticated, redirect them to the home page
    if (!isLoading && isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, router]);

  return (
    <div className="flex flex-col items-center justify-center min-vh-50 py-20">
      <div className="max-w-md w-full p-8 bg-white rounded-xl shadow-lg text-center">
        <h1 className="text-3xl font-bold mb-6 text-gray-800">Authentication Required</h1>
        <p className="text-gray-600 mb-8">
          Please connect your wallet and sign the message to access protected features.
        </p>
        
        <div className="flex justify-center">
          <ConnectButton 
            label="Sign In with Wallet"
            showBalance={false}
            accountStatus="address"
          />
        </div>

        <button 
          onClick={() => router.push('/')}
          className="mt-8 text-sm text-gray-500 hover:text-blue-600 transition-colors"
        >
          ← Back to Home
        </button>
      </div>
    </div>
  );
}
