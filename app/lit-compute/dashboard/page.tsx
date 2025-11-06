/**
 * Lit Compute User Dashboard
 * Personalized dashboard showing user's jobs, earnings, and quick actions
 */

'use client';

import JobList from '@/components/LitCompute/JobList';
import PaymentHistory from '@/components/LitCompute/PaymentHistory';
import SystemStatsDashboard from '@/components/LitCompute/SystemStatsDashboard';
import Link from 'next/link';

export default function LitComputeDashboardPage() {
  // TODO: Get actual user ID from auth context
  const userId = 'mock-user-id';
  const hasNode = false; // TODO: Check if user has registered node

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-4xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600 mt-2">
            Manage your Lit Compute Network activity
          </p>
        </div>

        {/* Quick Stats */}
        <SystemStatsDashboard />

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Link
            href="/lit-compute"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center border-2 border-transparent hover:border-blue-500"
          >
            <div className="text-4xl mb-4">🔐</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Submit Job</h3>
            <p className="text-gray-600 text-sm">
              Encrypt data using the distributed network
            </p>
          </Link>

          <Link
            href="/lit-compute/nodes"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center border-2 border-transparent hover:border-purple-500"
          >
            <div className="text-4xl mb-4">🖥️</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              {hasNode ? 'Node Dashboard' : 'Become a Node'}
            </h3>
            <p className="text-gray-600 text-sm">
              {hasNode ? 'Monitor your node and earnings' : 'Start earning crypto by processing jobs'}
            </p>
          </Link>

          <Link
            href="/lit-compute/analytics"
            className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition text-center border-2 border-transparent hover:border-green-500"
          >
            <div className="text-4xl mb-4">📊</div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Analytics</h3>
            <p className="text-gray-600 text-sm">
              View network performance and statistics
            </p>
          </Link>
        </div>

        {/* My Jobs */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">My Recent Jobs</h2>
          <JobList userId={userId} limit={5} />
          <div className="mt-6 text-center">
            <Link
              href="/lit-compute/jobs"
              className="text-blue-500 hover:underline font-semibold"
            >
              View All My Jobs →
            </Link>
          </div>
        </div>

        {/* Payment History */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <PaymentHistory userId={userId} compact={true} />
        </div>

        {/* Help & Resources */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-blue-50 rounded-lg p-6 border border-blue-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">📚 Getting Started</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>• <Link href="/docs/submit-job" className="text-blue-500 hover:underline">How to submit a job</Link></li>
              <li>• <Link href="/docs/run-node" className="text-blue-500 hover:underline">Run a compute node</Link></li>
              <li>• <Link href="/docs/pricing" className="text-blue-500 hover:underline">Pricing & fees</Link></li>
              <li>• <Link href="/docs/faq" className="text-blue-500 hover:underline">FAQ</Link></li>
            </ul>
          </div>

          <div className="bg-green-50 rounded-lg p-6 border border-green-200">
            <h3 className="text-lg font-bold text-gray-900 mb-3">💡 Tips</h3>
            <ul className="space-y-2 text-sm text-gray-700">
              <li>✓ Jobs complete in 2-5 minutes on average</li>
              <li>✓ Higher fees = faster processing priority</li>
              <li>✓ Node operators earn 0.05-0.15 ETH per job</li>
              <li>✓ Network uptime: 99.9%</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
