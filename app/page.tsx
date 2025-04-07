import React from 'react';
import Link from 'next/link';
import styles from '../styles/Page.module.css';

export default function Home() {
  return (
    <div className="page-content">
      <div className={styles.grid}>
        <Link href="/space" className={styles.linkWrapper}>
          <div className={`${styles.card} ${styles.space}`}>Space</div>
        </Link>
        
        <Link href="/food" className={styles.linkWrapper}>
          <div className={`${styles.card} ${styles.food}`}>Food</div>
        </Link>
        
        <Link href="/energy" className={styles.linkWrapper}>
          <div className={`${styles.card} ${styles.energy}`}>Energy</div>
        </Link>
        
        <Link href="/health" className={styles.linkWrapper}>
          <div className={`${styles.card} ${styles.health}`}>Health</div>
        </Link>
      </div>
    </div>
  );
}