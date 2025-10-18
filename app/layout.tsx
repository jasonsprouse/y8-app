import React from 'react';
import type { Metadata, Viewport } from 'next';
import Providers from '../components/Providers';
import Header from '../components/ui/Header';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import NotificationBar from '../components/ui/NotificationBar';
import RouteGuard from '../components/RouteGuard';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: {
    default: 'Home | Y8',
    template: '%s | Y8',
  },
  description: 'Premier lifestyle services for everyone.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};



export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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