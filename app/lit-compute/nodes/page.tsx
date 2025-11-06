/**
 * Node Operator Dashboard Page
 * Full interface for users to manage their compute nodes
 */

'use client';

import NodeDashboard from '@/components/LitCompute/NodeDashboard';
import Link from 'next/link';

export default function NodesPage() {
  // TODO: Get actual user data from auth context
  const pkpWallet = 'mock-pkp-wallet-address';
  const hasNode = true; // TODO: Check if user has registered node
  const nodeId = 'mock-node-id-12345678'; // TODO: Get actual node ID

  if (!hasNode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          {/* Registration CTA */}
          <div className="bg-white rounded-lg shadow-xl p-8 md:p-12 text-center">
            <div className="text-6xl mb-6">🖥️</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Become a Node Operator
            </h1>
            <p className="text-xl text-gray-600 mb-8">
              Earn crypto by processing encryption jobs on the Lit Compute Network
            </p>

            {/* Benefits Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
              <div className="bg-green-50 rounded-lg p-6 border border-green-200">
                <div className="text-3xl mb-3">💰</div>
                <h3 className="font-bold text-gray-900 mb-2">Earn Crypto</h3>
                <p className="text-sm text-gray-600">
                  0.05-0.15 ETH per job<br />
                  ~$100-300/day potential
                </p>
              </div>

              <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
                <div className="text-3xl mb-3">⚡</div>
                <h3 className="font-bold text-gray-900 mb-2">Fast Payouts</h3>
                <p className="text-sm text-gray-600">
                  Instant payment on completion<br />
                  Withdraw anytime
                </p>
              </div>

              <div className="bg-purple-50 rounded-lg p-6 border border-purple-200">
                <div className="text-3xl mb-3">🔒</div>
                <h3 className="font-bold text-gray-900 mb-2">Secure</h3>
                <p className="text-sm text-gray-600">
                  Smart contract payments<br />
                  Reputation-based system
                </p>
              </div>
            </div>

            {/* Requirements */}
            <div className="bg-gray-50 rounded-lg p-6 mb-8 text-left">
              <h3 className="font-bold text-gray-900 mb-4">📋 Requirements</h3>
              <ul className="space-y-2 text-sm text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Hardware:</strong> 4+ CPU cores, 8GB RAM, 50GB storage</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Internet:</strong> Stable connection (10+ Mbps)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Wallet:</strong> ETH wallet with PKP (Programmable Key Pair)</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-500 mt-1">✓</span>
                  <span><strong>Stake:</strong> 0.1 ETH deposit (refundable)</span>
                </li>
              </ul>
            </div>

            {/* CTA Buttons */}
            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <button className="px-8 py-4 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition text-lg font-semibold">
                🚀 Register Node
              </button>
              <Link
                href="/docs/run-node"
                className="px-8 py-4 border-2 border-purple-500 text-purple-500 rounded-lg hover:bg-purple-50 transition text-lg font-semibold"
              >
                📚 Read Setup Guide
              </Link>
            </div>

            {/* Download Desktop App */}
            <div className="mt-10 pt-8 border-t border-gray-200">
              <h3 className="font-bold text-gray-900 mb-4">💻 Download Node Software</h3>
              <div className="flex flex-wrap gap-4 justify-center">
                <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                  🪟 Windows
                </button>
                <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                  🍎 macOS
                </button>
                <button className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition">
                  🐧 Linux
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto">
        <NodeDashboard nodeId={nodeId} pkpWallet={pkpWallet} />
      </div>
    </div>
  );
}
