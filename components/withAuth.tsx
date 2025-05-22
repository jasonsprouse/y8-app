"use client";

import React, { useEffect } from 'react';
import { useAuth } from '../context/AuthContext'; // Adjust path as needed
import { useRouter } from 'next/navigation';
import Loading from './LitAuth/Loading'; // Adjust path as needed

export default function withAuth<P extends object>(WrappedComponent: React.ComponentType<P>) {
  const WithAuthComponent = (props: P) => {
    const { isAuthenticated, isLoading, error } = useAuth();
    const router = useRouter();

    useEffect(() => {
      // Redirect if not loading, not authenticated, and no significant auth error preventing redirect
      if (!isLoading && !isAuthenticated) {
        // If there's an error specifically related to auth failure, it's fine to redirect.
        // If the error is something else, this check might need refinement.
        router.replace('/auth');
      }
    }, [isAuthenticated, isLoading, router, error]); // Added error to dependency array

    if (isLoading) {
      return <Loading copy="Authenticating..." />;
    }

    // If not authenticated and useEffect is about to redirect, show loading.
    // This covers the state between the initial check and the redirect completion.
    if (!isAuthenticated) {
      return <Loading copy="Redirecting to login..." />; // Or return null;
    }
    
    // If there was an error during auth loading but user is somehow authenticated,
    // it's better to show the component than to block access.
    // Specific error handling (e.g. showing an error message) can be done within WrappedComponent
    // or by enhancing this HOC further if needed.

    // If authenticated, render the wrapped component
    return <WrappedComponent {...props} />;
  };

  // Set a display name for easier debugging
  WithAuthComponent.displayName = `WithAuth(${WrappedComponent.displayName || WrappedComponent.name || 'Component'})`;

  return WithAuthComponent;
}
