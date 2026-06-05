"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Mark as dynamic to prevent static prerendering
export const dynamic = 'force-dynamic';

/**
 * Discord OAuth Callback - Deprecated
 * 
 * OAuth callbacks are no longer used as we've migrated to Coinbase Smart Wallet
 * with SIWE (Sign In With Ethereum) authentication.
 */
export default function DiscordCallbackPage() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to home page
    router.push('/');
  }, [router]);

  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <p>Redirecting...</p>
    </div>
  );
}
