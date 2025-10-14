"use client";

import { useEffect, useState } from 'react';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../../context/AuthContext';

export default function GoogleCallbackPage() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const { loginWithGoogle, isAuthenticated, error } = useAuth();
  const [isProcessing, setIsProcessing] = useState(true);
  const [authError, setAuthError] = useState<string | null>(null);
  const [hasAttemptedAuth, setHasAttemptedAuth] = useState(false);

  useEffect(() => {
    if (pathname !== '/auth/callback/google') return;
    if (hasAttemptedAuth || isAuthenticated) return;

    const code = params.get('code');
    const err = params.get('error');

    if (err) {
      setAuthError('Google authentication was cancelled.');
      setIsProcessing(false);
      return;
    }

    if (!code) {
      setAuthError('Missing authorization code.');
      setIsProcessing(false);
      return;
    }

    setHasAttemptedAuth(true);

    loginWithGoogle().catch((caught) => {
      console.error('Error during Google callback:', caught);
      setAuthError(caught instanceof Error ? caught.message : 'Authentication failed');
      setIsProcessing(false);
    });
  }, [pathname, params, isAuthenticated, hasAttemptedAuth, loginWithGoogle]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/space');
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

  if (!isProcessing) {
    return null;
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
