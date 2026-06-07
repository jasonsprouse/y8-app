"use client";

import React from 'react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
  const { user, isLoading, isAuthenticated } = useAuth();

  if (isLoading) return <p>Loading secure data...</p>;
  if (!isAuthenticated) return <p>Please connect your wallet and sign in.</p>;

  return (
    <div>
      <h1>Welcome back!</h1>
      <p>Your authenticated wallet address is: {user?.address}</p>
      {user?.role === 'admin' && <p>Admin tools unlocked.</p>}
    </div>
  );
}
