"use client";

import BiometricWalletButton from "../../components/BiometricWalletButton";

// Mark as dynamic to prevent static prerendering
export const dynamic = 'force-dynamic';

export default function AuthPage() {
  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      gap: '2rem',
      padding: '2rem'
    }}>
      <h1>Authenticate</h1>
      <p>Sign in with your Ethereum wallet using Coinbase Smart Wallet</p>
      <BiometricWalletButton />
    </div>
  );
}
