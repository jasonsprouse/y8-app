"use client";

import { useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function GoogleCallbackPage() {
  const { handleGoogleCallback, isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  const handleAuth = useCallback(async () => {
    await handleGoogleCallback();
  }, [handleGoogleCallback]);

  useEffect(() => {
    handleAuth();
  }, [handleAuth]);

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, router]);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error.message}</div>;
  }

  return <div>Authenticating...</div>;
}