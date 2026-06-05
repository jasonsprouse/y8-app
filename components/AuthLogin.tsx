"use client";

import BiometricWalletButton from './BiometricWalletButton';

/**
 * AuthLogin - Deprecated component maintained for backward compatibility
 * 
 * Now displays a deprecation message directing users to the /auth page
 * where Coinbase Smart Wallet authentication is available.
 */
export default function AuthLogin() {
  return (
    <div style={{ textAlign: 'center', padding: '2rem' }}>
      <h2>Authentication</h2>
      <p>Please use the authentication page to log in.</p>
      <BiometricWalletButton />
    </div>
  );
} 
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
      
      case 'webAuthn':
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