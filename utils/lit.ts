/**
 * Deprecated: Lit Protocol utilities
 * 
 * This file has been deprecated as the application has migrated from Lit Protocol PKP
 * authentication to Coinbase Smart Wallet with SIWE (Sign In With Ethereum).
 * 
 * SIWE utilities are now in lib/siwe.ts
 */

export const DOMAIN = process.env.NEXT_PUBLIC_DOMAIN || 'localhost';
export const ORIGIN = typeof window !== 'undefined' ? window.location.origin : 'http://localhost:3000';

// Placeholder exports to prevent import errors during migration
export const signInWithGoogle = async () => {
  throw new Error('OAuth authentication is deprecated. Use Coinbase Smart Wallet instead.');
};

export const signInWithDiscord = async () => {
  throw new Error('OAuth authentication is deprecated. Use Coinbase Smart Wallet instead.');
};

export const getPKPs = async () => {
  throw new Error('Lit Protocol PKP management is deprecated. Use Coinbase Smart Wallet instead.');
};

export const mintPKP = async () => {
  throw new Error('Lit Protocol PKP management is deprecated. Use Coinbase Smart Wallet instead.');
};
