"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useAuth } from '../context/AuthContext';
import styles from '../styles/WalletConnect.module.css';

const WalletConnect = () => {
  const [isInfoVisible, setIsInfoVisible] = useState(false);
  const { 
    status, 
    address, 
    ensName,
    isAuthenticated,
    isConnected,
    userSignature, 
    connect, 
    requestSignature 
  } = useAuth();

  // Show info box when connected
  useEffect(() => {
    if (isConnected) {
      setIsInfoVisible(true);
    }
  }, [isConnected]);

  // Helper function to get status style class
  const getStatusClass = () => {
    if (status.includes("Authenticated")) return styles.statusAuthenticated;
    if (status.includes("Connected")) return styles.statusConnected;
    if (status.includes("Error") || status.includes("failed") || status.includes("Rejected")) 
      return styles.statusError;
    return "";
  };

  const handleButtonClick = () => {
    if (status === "Connected (Not Authenticated)" || status === "Connected (Re-auth needed)") {
      requestSignature();
    } else {
      connect();
    }
    setIsInfoVisible(true);
  };

  const getButtonText = () => {
    if (status === "Authenticated ✓") return "Authenticated ✓";
    if (status === "Connected (Re-auth needed)") return "Re-authenticate";
    if (status === "Connected" || status === "Connected (Not Authenticated)") return "Sign to Authenticate";
    if (status === "Connected (Signing...)") return "Waiting for signature...";
    if (status === "Opening MetaMask...") return "Opening MetaMask...";
    return "Connect Wallet";
  };

  return (
    <div className={styles.walletContainer}>
      <button 
        className={styles.connectButton} 
        onClick={handleButtonClick}
      >
        <Image
          src="https://metamask.io/images/metamask-fox.svg"
          width={20}
          height={20}
          alt="MetaMask"
        />
        <span>{getButtonText()}</span>
      </button>
      
      {isInfoVisible && (
        <div className={styles.walletInfo}>
          <div>
            <strong>Status:</strong> 
            <span className={getStatusClass()}>{status}</span>
          </div>
          <div>
            <strong>Address:</strong> 
            {ensName ? (
              <>
                <span className={styles.ensName}>{ensName}</span>
                <span className={styles.walletAddress}>({address})</span>
              </>
            ) : (
              <span className={styles.walletAddress}>{address}</span>
            )}
          </div>
          {userSignature && (
            <div>
              <strong>Authenticated:</strong> 
              <span className={styles.authenticated}>✓</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default WalletConnect;