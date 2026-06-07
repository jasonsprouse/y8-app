"use client";

import React, { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../context/AuthContext';
import Dashboard from '../components/Dashboard';
import styles from '../styles/Page.module.css';
import toast, { Toaster } from 'react-hot-toast';

const notify = (pageName: string) => toast(`You're visiting the ${pageName} page`);

export default function Home() {
  const { isAuthenticated, isLoading, user } = useAuth();
  const router = useRouter();

  // Redirect to auth if not authenticated
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth');
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading state
  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  // Show main content if authenticated
  if (!isAuthenticated) {
    return null; // RouteGuard will handle redirect
  }

  return (
    <div className="page-content">
      {/* Use Dashboard component for user info */}
      {user && (
        <Dashboard />
      )}

      {/* Main navigation cards */}
      <div className={styles.grid}>
        <Link href="/space" onClick={() => notify('Space')} className={styles.linkWrapper}>
          <div className={`${styles.card} ${styles.space}`}>Space</div>
        </Link>
        
        <Link href="/food" onClick={() => notify('Food')} className={styles.linkWrapper}>
          <div className={`${styles.card} ${styles.food}`}>Food</div>
        </Link>
        
        <Link href="/energy" onClick={() => notify('Energy')} className={styles.linkWrapper}>
          <div className={`${styles.card} ${styles.energy}`}>Energy</div>
        </Link>
        
        <Link href="/health" onClick={() => notify('Health')} className={styles.linkWrapper}>
          <div className={`${styles.card} ${styles.health}`}>Health</div>
        </Link>
      </div>
      
      <Toaster />
    </div>
  );
}
