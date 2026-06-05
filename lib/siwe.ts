import { SiweMessage } from 'siwe';

/**
 * SIWE utility for Sign In With Ethereum message generation and nonce management.
 * Used by both client-side (wallet signature) and server-side (session validation).
 */

const generateNonce = (): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let nonce = '';
  for (let i = 0; i < 32; i++) {
    nonce += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return nonce;
};

export interface SiweMessageData {
  domain: string;
  address: string;
  statement: string;
  uri: string;
  version: string;
  chainId: number;
  nonce: string;
  expirationTime: string;
}

export const createSiweMessageData = (
  address: string,
  nonce: string,
  chainId: number = 8453 // Base chain ID
): SiweMessageData => {
  const domain = typeof window !== 'undefined' ? window.location.host : 'localhost:3000';
  const origin = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

  return {
    domain,
    address,
    statement: 'Sign in with Ethereum to Y8 App',
    uri: origin,
    version: '1',
    chainId,
    nonce,
    expirationTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes
  };
};

export const createSiweMessage = (messageData: SiweMessageData): string => {
  const message = new SiweMessage(messageData);
  return message.prepareMessage();
};

export const getNonce = (): string => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    let nonce = localStorage.getItem('siwe_nonce');
    if (!nonce) {
      nonce = generateNonce();
      localStorage.setItem('siwe_nonce', nonce);
    }
    return nonce;
  }
  return generateNonce();
};

export const clearNonce = (): void => {
  if (typeof window !== 'undefined' && typeof localStorage !== 'undefined') {
    localStorage.removeItem('siwe_nonce');
  }
};
