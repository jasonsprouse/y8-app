"use client";

import React from 'react';
import Link from 'next/link';
import styles from '../styles/Page.module.css';
import toast, { Toaster } from 'react-hot-toast';

const notify = (pageName: string) => toast(`You're visiting the ${pageName} page`);

export default function Home() {
  return (
    <div className="page-content">
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
      
      {/* Only include Toaster once */}
      <Toaster />
    </div>
  );
}