"use client";

import Image from 'next/image';
import { useAuth } from '../../context/AuthContext';

export default function AuthPage() {
  const {
    loginWithGoogle,
    loginWithDiscord,
    loginWithWebAuthn,
    registerWebAuthn,
    error,
  } = useAuth();

  return (
    <div className="auth-page">
      <h1>Authenticate</h1>
      <p>Choose your authentication method</p>
      {error && <p className="text-red-500">{error.message}</p>}
      <div className="buttons-container">
        <button
          type="button"
          className="btn btn--outline"
          onClick={loginWithGoogle}
        >
          <div className="btn__icon">
            <Image src="/google.png" alt="Google logo" fill={true}></Image>
          </div>
          <span className="btn__label">Continue with Google</span>
        </button>
        <button
          type="button"
          className="btn btn--outline"
          onClick={loginWithDiscord}
        >
          <div className="btn__icon">
            <Image src="/discord.png" alt="Discord logo" fill={true}></Image>
          </div>
          <span className="btn__label">Continue with Discord</span>
        </button>
        <button
          type="button"
          className="btn btn--outline"
          onClick={loginWithWebAuthn}
        >
          <div className="btn__icon">
            <Image src="/webauthn.png" alt="WebAuthn logo" fill={true}></Image>
          </div>
          <span className="btn__label">Continue with WebAuthn</span>
        </button>
        {error && (
          <button
            type="button"
            className="btn btn--primary"
            onClick={registerWebAuthn}
          >
            Register with WebAuthn
          </button>
        )}
      </div>
    </div>
  );
}