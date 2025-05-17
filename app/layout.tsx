import React from 'react';
import type { Metadata } from 'next';
import { Poppins, Inter } from 'next/font/google';
import Providers from '../components/Providers';
import Header from '../components/ui/Header';
import Navbar from '../components/ui/Navbar';
import Footer from '../components/ui/Footer';
import NotificationBar from '../components/ui/NotificationBar';
import '../styles/globals.css';

// Configure fonts
const poppins = Poppins({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  variable: '--font-poppins',
});

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
});

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
    <html lang="en" className={`${poppins.variable} ${inter.variable}`}>
      <body>
        <Providers>
          <NotificationBar />
          <Header />
          <Navbar />

          <main className="page-content">
            {children}
          </main>
          
          <Footer />
        </Providers>
      </body>
    </html>
  );
}