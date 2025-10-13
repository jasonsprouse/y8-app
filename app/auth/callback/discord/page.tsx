"use client";

import { useEffect, useCallback } from 'react';
import { useAuth } from '../../../../context/AuthContext';
import { useRouter } from 'next/navigation';

export default function DiscordCallbackPage() {
  const { handleDiscordCallback, isAuthenticated, isLoading, error } = useAuth();
  const router = useRouter();

  const handleAuth = useCallback(async () => {
    await handleDiscordCallback();
  }, [handleDiscordCallback]);

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