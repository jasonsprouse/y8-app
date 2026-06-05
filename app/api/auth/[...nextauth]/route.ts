import NextAuth from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { SiweMessage } from 'siwe';
import type { AuthOptions } from 'next-auth';

// Prevent static generation of dynamic route
export const dynamic = 'force-dynamic';

/**
 * NextAuth configuration with SIWE (Sign In With Ethereum)
 * 
 * This enables Web3 session management using cryptographic signatures.
 * Users sign a message with their wallet, we validate it, and issue a session cookie.
 */
const authOptions: AuthOptions = {
  providers: [
    CredentialsProvider({
      name: 'Ethereum',
      credentials: {
        message: { label: 'Message', type: 'text' },
        signature: { label: 'Signature', type: 'text' },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            console.error('Missing message or signature in credentials');
            return null;
          }

          // Parse the message data from JSON
          const messageData = JSON.parse(credentials.message);
          
          // Reconstruct the SIWE message from the data
          const siweMessage = new SiweMessage(messageData);

          // Verify the signature against the message
          const result = await siweMessage.verify({ signature: credentials.signature });

          if (result.success) {
            return {
              id: siweMessage.address,
              name: siweMessage.address,
              email: siweMessage.address,
            };
          }

          console.error('SIWE verification failed:', result.error);
          return null;
        } catch (error) {
          console.error('SIWE validation error:', error);
          return null;
        }
      },
    }),
  ],
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
    updateAge: 24 * 60 * 60, // Re-issue a new JWT every 24 hours
  },
  pages: {
    signIn: '/auth',
    error: '/auth',
  },
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.address = user.id;
      }
      return token;
    },
    async session({ session, token }) {
      (session.user as any).address = token.address;
      return session;
    },
  },
  secret: process.env.NEXTAUTH_SECRET || 'dev-secret-change-in-production',
};

const handler = NextAuth(authOptions);

export { handler as GET, handler as POST };
