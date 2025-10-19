"use client";

import React from 'react';
import Link from 'next/link';
import { useAuth } from '../context/AuthContext';
import AuthLogin from '../components/AuthLogin';
import Dashboard from '../components/LitAuth/Dashboard';
import styles from '../styles/Page.module.css';
import toast, { Toaster } from 'react-hot-toast';

const notify = (pageName: string) => toast(`You're visiting the ${pageName} page`);

export default function Home() {
  const { isLoading, isAuthenticated, pkp, sessionSigs } = useAuth();

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
        <>
          <Dashboard currentAccount={pkp} sessionSigs={sessionSigs} />
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
        </>
      ) : (
        <AuthLogin />
      )}
      <Toaster />
    </div>
  );
}