import React from 'react';
import type { Metadata } from 'next';
import Providers from '../components/Providers';
import Header from '../components/ui/Header';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import NotificationBar from '../components/ui/NotificationBar';
import RouteGuard from '../components/RouteGuard';
import '../styles/globals.css';

// Use system fonts as fallback
const fontVariables = '--font-poppins: ui-sans-serif, system-ui, sans-serif; --font-inter: ui-sans-serif, system-ui, sans-serif;';

export const metadata: Metadata = {
  title: {
    default: 'Home | Y8',
    template: '%s | Y8',
  },
  description: 'Premier lifestyle services for everyone.',
  viewport: 'width=device-width, initial-scale=1',
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" style={{ fontVariables } as React.CSSProperties}>
      <body>
        <Providers>
          <NotificationBar />
          <Header />
          <Navbar />

          <main className="page-content">
            <RouteGuard>
              {children}
            </RouteGuard>
          </main>
          
          <Footer />
        </Providers>
      </body>
    </html>
  );
}