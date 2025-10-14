"use client";

import { useEffect, useState, Suspense } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';
import {
  isSignInRedirect,
  getProviderFromUrl,
} from '@lit-protocol/lit-auth-client';

function GoogleCallbackContent() {
  const router = useRouter();
  const pathname = usePathname();
  const { loginWithGoogle, isAuthenticated, needsToCreateAccount, error } = useAuth();
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
        if (provider !== 'google') {
          setAuthError('Invalid provider');
          setIsProcessing(false);
          return;
        }

        // Authenticate with Google
        await loginWithGoogle();
        
      } catch (err) {
        console.error('Error during Google callback:', err);
        setAuthError(err instanceof Error ? err.message : 'Authentication failed');
        setIsProcessing(false);
      }
    };

    handleCallback();
  }, [hasAttemptedAuth, loginWithGoogle]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/space');
    } else if (needsToCreateAccount && !isProcessing) {
      // Redirect to home page to show create account flow
      router.push('/');
    }
  }, [isAuthenticated, needsToCreateAccount, isProcessing, router]);

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

  if (!isProcessing) {
    // Show a spinner/message while redirecting after authentication
    return (
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <h2>Redirecting...</h2>
          <p>You are being redirected to your space.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        <h2>Authenticating with Google...</h2>
        <p>Please wait while we complete your sign in.</p>
      </div>
    </div>
  );
}

export default function GoogleCallbackPage() {
  return (
    <Suspense fallback={
      <div className="container" style={{ padding: '2rem', textAlign: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
          <h2>Authenticating with Google...</h2>
          <p>Please wait while we complete your sign in.</p>
        </div>
      </div>
    }>
      <GoogleCallbackContent />
    </Suspense>
  );
}
