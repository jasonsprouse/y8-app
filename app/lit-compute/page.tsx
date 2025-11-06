/**
 * Lit Compute Network Landing Page
 * Main entry point for the distributed encryption network
 */

'use client';

import React from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import JobSubmission from '@/components/LitCompute/JobSubmission';
import SystemStatsDashboard from '@/components/LitCompute/SystemStatsDashboard';

export default function LitComputePage() {
  const { isAuthenticated, pkp } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-extrabold text-gray-900 mb-4">
            Lit Compute Network
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Decentralized encryption-as-a-service powered by Lit Protocol.
            Submit jobs, run nodes, and earn rewards for providing compute power.
          </p>
        </div>

        {/* Feature Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-3">🔐</div>
            <h3 className="text-lg font-semibold mb-2">Secure Encryption</h3>
            <p className="text-gray-600 text-sm">
              Enterprise-grade encryption using Lit Protocol's programmable key pairs and threshold cryptography
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-3">⚡</div>
            <h3 className="text-lg font-semibold mb-2">Multi-Core Performance</h3>
            <p className="text-gray-600 text-sm">
              Optimized for 16-thread systems like i9-9980HK. Process 8-12 jobs simultaneously for maximum earnings
            </p>
          </div>

          <div className="bg-white rounded-lg shadow-lg p-6">
            <div className="text-3xl mb-3">💰</div>
            <h3 className="text-lg font-semibold mb-2">Earn Rewards</h3>
            <p className="text-gray-600 text-sm">
              Node operators earn $0.10-0.20 per job. Potential earnings: $1,500-4,500/month on mainnet
            </p>
          </div>
        </div>

        {/* System Stats */}
        <SystemStatsDashboard />

        {/* Job Submission */}
        <div className="mt-12">
          {isAuthenticated ? (
            <JobSubmission />
          ) : (
            <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-8 text-center">
              <h2 className="text-2xl font-bold mb-4">Connect Your Wallet</h2>
              <p className="text-gray-600 mb-6">
                You need to authenticate to submit encryption jobs or register as a node operator
              </p>
              <Link
                href="/"
                className="inline-block px-6 py-3 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
              >
                Go to Authentication
              </Link>
            </div>
          )}
        </div>

        {/* Node Operator CTA */}
        <div className="mt-12 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg shadow-lg p-8 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">Become a Node Operator</h2>
            <p className="text-lg mb-6">
              Have a multi-core system? Join the network and earn passive income by processing encryption jobs
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div>
                <div className="text-4xl font-bold">8-16</div>
                <div className="text-sm opacity-90">Jobs/minute</div>
              </div>
              <div>
                <div className="text-4xl font-bold">$50-150</div>
                <div className="text-sm opacity-90">Daily earnings</div>
              </div>
              <div>
                <div className="text-4xl font-bold">98%+</div>
                <div className="text-sm opacity-90">Success rate</div>
              </div>
            </div>
            <Link
              href="/lit-compute/node-operator"
              className="inline-block px-8 py-3 bg-white text-purple-600 font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Start Running a Node
            </Link>
          </div>
        </div>

        {/* Technical Specs */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">Technical Specifications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-3">Backend (The Beach)</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ NestJS with 8 worker processes</li>
                <li>✅ Redis Vercel KV for state management</li>
                <li>✅ WebSocket real-time updates</li>
                <li>✅ 10 REST API endpoints</li>
                <li>✅ PostgreSQL for job history</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-3">Frontend (Y8 App)</h3>
              <ul className="space-y-2 text-sm text-gray-600">
                <li>✅ Next.js 15 with App Router</li>
                <li>✅ Lit Protocol PKP authentication</li>
                <li>✅ Web3Modal wallet integration</li>
                <li>✅ Real-time job tracking</li>
                <li>✅ Node operator dashboard</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Architecture Diagram */}
        <div className="mt-12 bg-white rounded-lg shadow-lg p-8">
          <h2 className="text-2xl font-bold mb-6 text-center">System Architecture</h2>
          <div className="text-center text-sm text-gray-600 font-mono">
            <pre className="inline-block text-left bg-gray-50 p-4 rounded">
{`User (Y8 App)
    ↓
[Lit Protocol PKP Auth]
    ↓
Backend (The Beach - NestJS)
    ↓
Redis Vercel KV (State Management)
    ↓
Node Operators (i9-9980HK: 16 threads)
    ↓
Lit Protocol Encryption
    ↓
IPFS Storage
    ↓
Smart Contract Payment`}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
