"use client";

import { useEffect } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';

export default function AuthHandler() {
  const { isAuthenticated, logOut } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (isAuthenticated) {
      if (pathname === '/' || pathname.startsWith('/auth/callback')) {
        router.push('/');
      }
    }
  }, [isAuthenticated, pathname, router]);

  const handleLogout = () => {
    logOut();
    router.push('/');
  };

  // This component doesn't render anything
  return null;
}