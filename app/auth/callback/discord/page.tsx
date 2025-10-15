"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import {
  isSignInRedirect,
  getProviderFromUrl,
} from '@lit-protocol/lit-auth-client';

export default function DiscordCallbackPage() {
  const router = useRouter();
  const { loginWithDiscord, isAuthenticated, error } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);

  useEffect(() => {
    const handleCallback = async () => {
      // Prevent multiple authentication attempts
      if (hasAttemptedAuth) {
        return;
      }
      
      setHasAttemptedAuth(true);
      
      try {
        // Check if this is a valid OAuth redirect
        const redirectUri = window.location.href;
        
        if (!isSignInRedirect(redirectUri)) {
          setAuthError('Invalid OAuth redirect');
          setIsProcessing(false);
          return;
        }

        const provider = getProviderFromUrl();
        if (provider !== 'discord') {
          setAuthError('Invalid provider');
          setIsProcessing(false);
          return;
        }

        // Authenticate with Discord
        await loginWithDiscord();
        
      } catch (err) {
        console.error('Error during Discord callback:', err);
        setAuthError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [hasAttemptedAuth, loginWithDiscord]);

  useEffect(() => {
    if (isAuthenticated) {
      // Redirect to dashboard or home after successful authentication
      router.push('/');
    }
  }, [isAuthenticated, router]);

  useEffect(() => {
    if (error) {
      setAuthError(error.message);
      setIsProcessing(false);
    }
  }, [error]);

  if (authError) {
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div className="alert alert--error" style={{ marginBottom: '1rem' }}>
          <h2>Authentication Error</h2>
          <p>{authError}</p>
        </div>
        <button 
          onClick={() => router.push('/auth')} 
          className="btn btn--primary"
        >
          Back to Login
        </button>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <h2>Authenticating with Discord...</h2>
        <p>Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}
