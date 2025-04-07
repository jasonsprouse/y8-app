"use client";

import React from 'react';
import { AuthProvider } from '../context/AuthContext';  // Make sure this matches your file location

export default function Providers({ children }: { children: React.ReactNode }) {
  return <AuthProvider>{children}</AuthProvider>;
}