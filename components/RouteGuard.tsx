"use client";

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

// Define public paths that don't require authentication
const publicPaths = ['/', '/about-us', '/shop', '/blog', '/calendar' ];

// Helper function to check if a path is public or an auth path
const isPublicOrAuthPath = (pathname: string): boolean => {
  // Check exact public paths
  if (publicPaths.includes(pathname)) {
    return true;
  }
  
  // Check if it's an auth path (starts with /auth)
  if (pathname.startsWith('/auth')) {
    return true;
  }
  
  return false;
};

export default function RouteGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check for public paths and auth paths
    if (isPublicOrAuthPath(pathname)) {
      return;
    }

    // Redirect to landing page if not authenticated
    if (!isLoading && !isAuthenticated) {
      router.push('/');
    }
  }, [isAuthenticated, isLoading, pathname, router]);

  // Always render children for public paths and auth paths
  if (isPublicOrAuthPath(pathname)) {
    return <>{children}</>;
  }

  // For protected paths, only render if authenticated
  if (isAuthenticated) {
    return <>{children}</>;
  }

  // Show loading state
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
    </div>
  );
}