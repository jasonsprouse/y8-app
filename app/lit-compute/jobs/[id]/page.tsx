/**
 * Job Details Page
 * Display detailed information about a specific Lit Compute job
 */

import { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Job Details | Lit Compute Network',
  description: 'View detailed information about your encryption job',
};

interface JobDetailsPageProps {
  params: {
    id: string;
  };
}

// This would fetch real data from API in production
async function getJobData(jobId: string) {
  // TODO: Replace with actual API call
  return {
    id: jobId,
    submitter: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    inputCID: 'QmXjkFQjnD8i8ntmwehoAHBfJEApETx8ebScyVzAHqgjpD',
    outputCID: 'QmYwAPJzv5CZsnA625s3Xf2nemtYgPpHdWEz79ojWnPbdG',
    accessControl: {
      type: 'PKP',
      wallet: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    },
    feeAmount: '0.1',
    status: 'completed',
    nodeId: 'node-abc123def456',
    submittedAt: new Date(Date.now() - 3600000).toISOString(),
    startedAt: new Date(Date.now() - 3300000).toISOString(),
    completedAt: new Date(Date.now() - 3000000).toISOString(),
    processingTime: 300, // seconds
    txHash: '0x9876543210fedcba9876543210fedcba9876543210fedcba9876543210fedcba',
  };
}

export default async function JobDetailsPage({ params }: JobDetailsPageProps) {
  const job = await getJobData(params.id);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800 border-yellow-300',
      active: 'bg-blue-100 text-blue-800 border-blue-300',
      completed: 'bg-green-100 text-green-800 border-green-300',
      failed: 'bg-red-100 text-red-800 border-red-300',
    };

    const icons = {
      pending: '⏳',
      active: '🔄',
      completed: '✅',
      failed: '❌',
    };

    return (
      <span className={`inline-flex items-center gap-2 text-sm px-4 py-2 rounded-full border-2 font-semibold ${styles[status as keyof typeof styles]}`}>
        <span className="text-xl">{icons[status as keyof typeof icons]}</span>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-sm text-gray-600">
          <Link href="/lit-compute" className="hover:text-blue-500">Home</Link>
          <span>/</span>
          <Link href="/lit-compute/dashboard" className="hover:text-blue-500">Dashboard</Link>
          <span>/</span>
          <span className="text-gray-900 font-semibold">Job #{job.id.slice(0, 8)}</span>
        </nav>

        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Job Details</h1>
              <p className="text-gray-600 mt-1 font-mono text-sm">ID: {job.id}</p>
            </div>
            {getStatusBadge(job.status)}
          </div>
        </div>

        {/* Timeline */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">📅 Timeline</h2>
          <div className="space-y-4">
            {/* Submitted */}
            <div className="flex gap-4">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xl">📝</span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-gray-900">Submitted</h3>
                <p className="text-sm text-gray-600">{new Date(job.submittedAt).toLocaleString()}</p>
              </div>
            </div>

            {/* Started */}
            {job.startedAt && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">🔄</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Processing Started</h3>
                  <p className="text-sm text-gray-600">{new Date(job.startedAt).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Node: {job.nodeId}</p>
                </div>
              </div>
            )}

            {/* Completed */}
            {job.completedAt && (
              <div className="flex gap-4">
                <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-xl">✅</span>
                </div>
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900">Completed</h3>
                  <p className="text-sm text-gray-600">{new Date(job.completedAt).toLocaleString()}</p>
                  <p className="text-xs text-gray-500">Processing time: {formatDuration(job.processingTime)}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">🔐 Job Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Input */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Input Data</h3>
              <div className="bg-gray-50 rounded-lg p-4 break-all">
                <p className="text-xs text-gray-600 mb-1">IPFS CID:</p>
                <p className="font-mono text-sm text-gray-900">{job.inputCID}</p>
                <a
                  href={`https://ipfs.io/ipfs/${job.inputCID}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-blue-500 hover:underline"
                >
                  View on IPFS →
                </a>
              </div>
            </div>

            {/* Output */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Output Data</h3>
              <div className="bg-gray-50 rounded-lg p-4 break-all">
                {job.outputCID ? (
                  <>
                    <p className="text-xs text-gray-600 mb-1">IPFS CID:</p>
                    <p className="font-mono text-sm text-gray-900">{job.outputCID}</p>
                    <div className="flex gap-2 mt-2">
                      <a
                        href={`https://ipfs.io/ipfs/${job.outputCID}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-blue-500 hover:underline"
                      >
                        View on IPFS →
                      </a>
                      <button className="text-sm text-blue-500 hover:underline">
                        Download
                      </button>
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Not yet available</p>
                )}
              </div>
            </div>

            {/* Submitter */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Submitter</h3>
              <div className="bg-gray-50 rounded-lg p-4 break-all">
                <p className="font-mono text-sm text-gray-900">{job.submitter}</p>
                <a
                  href={`https://etherscan.io/address/${job.submitter}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-block mt-2 text-sm text-blue-500 hover:underline"
                >
                  View on Etherscan →
                </a>
              </div>
            </div>

            {/* Node */}
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900">Processing Node</h3>
              <div className="bg-gray-50 rounded-lg p-4 break-all">
                {job.nodeId ? (
                  <>
                    <p className="font-mono text-sm text-gray-900">{job.nodeId}</p>
                    <Link
                      href={`/lit-compute/nodes/${job.nodeId}`}
                      className="inline-block mt-2 text-sm text-blue-500 hover:underline"
                    >
                      View Node Details →
                    </Link>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">Not yet assigned</p>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Payment Info */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">💰 Payment</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-gray-600 mb-1">Fee Amount</p>
              <p className="text-2xl font-bold text-green-600">{job.feeAmount} ETH</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-gray-600 mb-1">Network Fee</p>
              <p className="text-2xl font-bold text-blue-600">0.005 ETH</p>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg border border-purple-200">
              <p className="text-sm text-gray-600 mb-1">Total Cost</p>
              <p className="text-2xl font-bold text-purple-600">{(parseFloat(job.feeAmount) + 0.005).toFixed(3)} ETH</p>
            </div>
          </div>
          {job.txHash && (
            <div className="mt-6 text-center">
              <a
                href={`https://etherscan.io/tx/${job.txHash}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
              >
                <span>View Transaction on Etherscan</span>
                <span>→</span>
              </a>
            </div>
          )}
        </div>

        {/* Access Control */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">🔑 Access Control</h2>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-2xl">🔐</span>
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">PKP (Programmable Key Pair)</h3>
                <p className="text-sm text-gray-600">Threshold cryptography protection</p>
              </div>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p>✓ Only authorized PKP wallet can decrypt output</p>
              <p>✓ Distributed key shares across Lit Protocol network</p>
              <p>✓ No single point of failure</p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <Link
            href="/lit-compute/dashboard"
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition text-center font-semibold"
          >
            ← Back to Dashboard
          </Link>
          {job.status === 'completed' && job.outputCID && (
            <button className="flex-1 px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition text-center font-semibold">
              📥 Download Result
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
