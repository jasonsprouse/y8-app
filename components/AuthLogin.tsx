"use client";

import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import LoginMethods from './LitAuth/LoginMethods';
import SignUpMethods from './LitAuth/SignUpMethods';
import WebAuthn from './LitAuth/WebAuthn';
import StytchOTP from './LitAuth/StytchOTP';
import WalletMethods from './LitAuth/WalletMethods';
import AccountSelection from './LitAuth/AccountSelection';
import CreateAccount from './LitAuth/CreateAccount';
import Loading from './LitAuth/Loading';
import styles from '../styles/AuthLogin.module.css';

type AuthView = 'login' | 'signup' | 'email' | 'phone' | 'wallet' | 'webauthn' | 'create-account';

export default function AuthLogin() {
  const { 
    isLoading,
    loginWithGoogle, 
    loginWithDiscord, 
    loginWithEthWallet, 
    loginWithWebAuthn, 
    loginWithStytchOtp,
    registerWebAuthn,
    availablePkps,
    pendingPkpSelection,
    setPKP,
    needsToCreateAccount,
    clearNeedsToCreateAccount,
    error 
  } = useAuth();
  
  const [authView, setAuthView] = useState<AuthView>('login');

  // Handle loading state
  if (isLoading) {
    return (
      <div className={styles.authContainer}>
        <Loading copy="Authenticating..." error={error} />
      </div>
    );
  }

  // Handle PKP account selection
  if (pendingPkpSelection && availablePkps && availablePkps.length > 0) {
    return (
      <div className={styles.authContainer}>
        <AccountSelection
          accounts={availablePkps}
          setCurrentAccount={setPKP}
          error={error}
        />
      </div>
    );
  }

  // Handle needs to create account view (from AuthContext)
  if (needsToCreateAccount) {
    return (
      <div className={styles.authContainer}>
        <CreateAccount
          signUp={() => {
            clearNeedsToCreateAccount();
            setAuthView('signup');
          }}
          error={undefined}
        />
      </div>
    );
  }

  // Handle create account view (from local state)
  if (authView === 'create-account') {
    return (
      <div className={styles.authContainer}>
        <CreateAccount
          signUp={() => setAuthView('signup')}
          error={error}
        />
      </div>
    );
  }

  // Render different auth views
  const renderAuthView = () => {
    switch(authView) {
      case 'signup':
        return (
          <SignUpMethods
            handleGoogleLogin={loginWithGoogle}
            handleDiscordLogin={loginWithDiscord}
            authWithEthWallet={loginWithEthWallet}
            registerWithWebAuthn={registerWebAuthn}
            authWithWebAuthn={loginWithWebAuthn}
            authWithStytch={loginWithStytchOtp}
            goToLogin={() => setAuthView('login')}
            error={error}
          />
        );
      
      case 'email':
        return (
          <StytchOTP
            method={'email'}
            authWithStytch={loginWithStytchOtp}
            setView={setAuthView}
          />
        );
      
      case 'phone':
        return (
          <StytchOTP
            method={'phone'}
            authWithStytch={loginWithStytchOtp}
            setView={setAuthView}
          />
        );
      
      case 'wallet':
        return (
          <WalletMethods
            authWithEthWallet={loginWithEthWallet}
            setView={setAuthView}
          />
        );
      
      case 'webauthn':
        return (
          <WebAuthn
            start={'authenticate'}
            authWithWebAuthn={loginWithWebAuthn}
            setView={setAuthView}
          />
        );
      
      case 'login':
      default:
        return (
          <LoginMethods
            handleGoogleLogin={loginWithGoogle}
            handleDiscordLogin={loginWithDiscord}
            authWithEthWallet={loginWithEthWallet}
            authWithWebAuthn={loginWithWebAuthn}
            authWithStytch={loginWithStytchOtp}
            signUp={() => setAuthView('signup')}
            error={error}
          />
        );
    }
  };

  return (
    <div className={styles.authContainer}>
      <div className={styles.authPanel}>
        {renderAuthView()}
      </div>
    </div>
  );
}