"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import BiometricWalletButton from '../components/BiometricWalletButton';
import styles from '../styles/Page.module.css';
import toast, { Toaster } from 'react-hot-toast';

// Mark as dynamic to prevent static prerendering
export const dynamic = 'force-dynamic';

const notify = (pageName: string) => toast(`You're visiting the ${pageName} page`);

export default function Home() {
  const { isLoading, isAuthenticated } = useAuth();

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="page-content">
      {isAuthenticated ? (
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
      ) : (
        <div style={{ textAlign: 'center', paddingTop: '2rem' }}>
          <h1>Welcome to Y8 App</h1>
          <p>Sign in with your wallet to continue</p>
          <BiometricWalletButton />
        </div>
      )}
      <Toaster />
    </div>
  );
}