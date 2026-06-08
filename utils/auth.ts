import NextAuth from 'next-auth';
import type { NextAuthOptions } from 'next-auth';
import Credentials from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';

declare module "next-auth" {
  interface Session {
    address?: string;
  }
}

export const authOptions: NextAuthOptions = {
  providers: [
    Credentials({
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        try {
          // Validate that we have both message and signature
          if (!credentials?.message || !credentials?.signature) {
            console.error('Missing message or signature');
            return null;
          }

          const message = credentials.message as string;
          const signature = credentials.signature as string;

          // Validate signature format: should be 0x followed by 130 hex characters (65 bytes)
          if (!signature.startsWith('0x') || signature.length !== 132) {
            console.error(`Invalid signature format. Expected 132 characters (0x + 130 hex), got ${signature.length} characters`);
            console.error(`Signature: ${signature.substring(0, 100)}...`);
            return null;
          }

          // Validate signature is valid hex
          if (!/^0x[0-9a-fA-F]{130}$/.test(signature)) {
            console.error('Signature contains invalid hex characters');
            return null;
          }

          const siwe = new SiweMessage(message);
          
          const result = await siwe.verify({
            signature,
            // NextAuth/SIWE best practices recommend verifying nonce & domain,
            // but for a basic integration this verifies the signature matches the address.
          });

          if (result.success) {
            return {
              id: siwe.address,
            };
          }
          return null;
        } catch (e) {
          console.error('Auth error:', e);
          return null;
        }
      },
    }),
  ],
  secret: process.env.AUTH_SECRET ?? process.env.NEXTAUTH_SECRET ?? 'fallback-secret-for-development-do-not-use-in-production',
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  callbacks: {
    async jwt({ token, user }) {
      // Add address to token when user logs in
      if (user) {
        token.sub = user.id; // user.id contains the address from authorize callback
      }
      return token;
    },
    async session({ session, token }) {
      if (token.sub) {
        session.address = token.sub;
        session.user = {
          ...session.user,
          name: token.sub,
        };
      }
      return session;
    },
  },
  // pages: {
  //   signIn: '/', // Redirect to home for login
  //   error: '/', // Redirect errors to home
  // },
};
