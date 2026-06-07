"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

// Define public paths that don't require authentication
const publicPaths = ['/auth'];

// Define protected paths that require authentication
const protectedPaths = ['/', '/space', '/food', '/energy', '/health'];

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isLoading) return;

    // Check if current path is protected
    const isProtectedPath = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
    
    // Redirect to auth if accessing protected path without authentication
    if (isProtectedPath && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Show loading state while checking auth
  if (isLoading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Check if current path is protected
  const isProtectedPath = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));

  // Allow access if: (1) path is public, or (2) path is protected and user is authenticated
  const isAllowed = !isProtectedPath || isAuthenticated;

  if (!isAllowed) {
    return (
      <div className="flex h-screen items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
          <p className="text-gray-600 mb-6">Please sign in to access this page</p>
          <button
            onClick={() => router.push('/')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}