/**
 * Node Operator Dashboard Component
 * Full interface for node operators to monitor earnings, jobs, and performance
 */

'use client';

import { useEffect, useState } from 'react';
import { useLitComputeSocket } from '@/hooks/useLitComputeSocket';
import { LitComputeAPI, type NodeStatus } from '@/lib/lit-compute-api';
import toast from 'react-hot-toast';

interface NodeDashboardProps {
  nodeId: string;
  pkpWallet: string;
}

interface NodeEarnings {
  total: string; // ETH
  totalUSD: string;
  today: string;
  thisWeek: string;
  thisMonth: string;
  recentPayments: Payment[];
}

interface Payment {
  id: string;
  timestamp: string;
  amount: string; // ETH
  jobId: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
}

interface ActiveJob {
  id: string;
  progress: number; // 0-100
  estimatedTimeRemaining: number; // seconds
  inputCID: string;
  feeAmount: string;
}

interface PerformanceMetrics {
  avgJobTime: number; // seconds
  successRate: number; // 0-100
  uptime: number; // 0-100
  jobsPerHour: number;
  networkRank: number;
  totalNodes: number;
}

export default function NodeDashboard({ nodeId, pkpWallet }: NodeDashboardProps) {
  const [nodeStatus, setNodeStatus] = useState<NodeStatus | null>(null);
  const [earnings, setEarnings] = useState<NodeEarnings | null>(null);
  const [activeJobs, setActiveJobs] = useState<ActiveJob[]>([]);
  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [withdrawing, setWithdrawing] = useState(false);

  const api = new LitComputeAPI();
  const { isConnected, systemStats } = useLitComputeSocket({ nodeId, autoConnect: true });

  // Fetch node data
  useEffect(() => {
    const fetchNodeData = async () => {
      try {
        const [status, earningsData, jobs, metricsData] = await Promise.all([
          api.getNodeStatus(nodeId),
          api.getNodeEarnings(nodeId),
          api.getActiveJobsByNode(nodeId),
          api.getNodeMetrics(nodeId),
        ]);

        setNodeStatus(status);
        setEarnings(earningsData);
        setActiveJobs(jobs);
        setMetrics(metricsData);
      } catch (error) {
        console.error('Failed to fetch node data:', error);
        toast.error('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };

    fetchNodeData();
    const interval = setInterval(fetchNodeData, 10000); // Refresh every 10s

    return () => clearInterval(interval);
  }, [nodeId]);

  const handleWithdraw = async () => {
    setWithdrawing(true);
    try {
      const result = await api.withdrawEarnings(nodeId, pkpWallet);
      toast.success(`Withdrawal initiated! Tx: ${result.txHash}`);
      
      // Refresh earnings after withdrawal
      const newEarnings = await api.getNodeEarnings(nodeId);
      setEarnings(newEarnings);
    } catch (error) {
      console.error('Withdrawal failed:', error);
      toast.error('Withdrawal failed. Please try again.');
    } finally {
      setWithdrawing(false);
    }
  };

  const formatETH = (eth: string) => {
    return parseFloat(eth).toFixed(4);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs}s`;
  };

  const getReputationStars = (reputation: number) => {
    const stars = Math.round((reputation / 100) * 5);
    return '⭐'.repeat(stars);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!nodeStatus || !earnings || !metrics) {
    return (
      <div className="text-center p-8">
        <p className="text-red-500">Failed to load node dashboard</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">🖥️ Node Operator Dashboard</h1>
          <p className="text-gray-600 mt-1">
            Node ID: <span className="font-mono text-sm">{nodeId.slice(0, 16)}...</span>
          </p>
          <div className="flex items-center gap-2 mt-2">
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`}></div>
            <span className="text-sm text-gray-600">
              {isConnected ? 'Connected' : 'Disconnected'}
            </span>
          </div>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Earnings Card */}
        <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">💰 Total Earnings</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{formatETH(earnings.total)} ETH</p>
            <p className="text-green-100">${parseFloat(earnings.totalUSD).toLocaleString()}</p>
            <div className="mt-4 pt-4 border-t border-green-400">
              <div className="flex justify-between text-sm">
                <span>Today:</span>
                <span className="font-semibold">{formatETH(earnings.today)} ETH</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>This Week:</span>
                <span className="font-semibold">{formatETH(earnings.thisWeek)} ETH</span>
              </div>
            </div>
          </div>
        </div>

        {/* Jobs Card */}
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">📊 Jobs</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{nodeStatus.totalJobsCompleted.toLocaleString()}</p>
            <p className="text-blue-100">completed</p>
            <div className="mt-4 pt-4 border-t border-blue-400">
              <div className="flex justify-between text-sm">
                <span>Active Now:</span>
                <span className="font-semibold">{nodeStatus.activeJobs}</span>
              </div>
              <div className="flex justify-between text-sm mt-1">
                <span>Success Rate:</span>
                <span className="font-semibold">{metrics.successRate.toFixed(1)}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Reputation Card */}
        <div className="bg-gradient-to-br from-purple-500 to-purple-600 rounded-lg p-6 text-white shadow-lg">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold">⭐ Reputation</h3>
          </div>
          <div className="space-y-2">
            <p className="text-3xl font-bold">{nodeStatus.reputation.toFixed(1)}/100</p>
            <p className="text-purple-100 text-2xl">{getReputationStars(nodeStatus.reputation)}</p>
            <div className="mt-4 pt-4 border-t border-purple-400">
              <div className="flex justify-between text-sm">
                <span>Network Rank:</span>
                <span className="font-semibold">#{metrics.networkRank} of {metrics.totalNodes}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Jobs */}
      {activeJobs.length > 0 && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">🔥 Active Jobs ({activeJobs.length})</h3>
          <div className="space-y-4">
            {activeJobs.map((job) => (
              <div key={job.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-semibold text-gray-900">Job #{job.id.slice(0, 8)}</p>
                    <p className="text-sm text-gray-600">Fee: {job.feeAmount} ETH</p>
                  </div>
                  <span className="text-sm text-gray-600">
                    Est: {formatTime(job.estimatedTimeRemaining)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-blue-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${job.progress}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{job.progress}% complete</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Performance Metrics */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">📈 Performance Metrics</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{formatTime(metrics.avgJobTime)}</p>
            <p className="text-sm text-gray-600 mt-1">Avg Job Time</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{metrics.successRate.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-1">Success Rate</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{metrics.uptime.toFixed(1)}%</p>
            <p className="text-sm text-gray-600 mt-1">Uptime</p>
          </div>
          <div className="text-center p-4 bg-gray-50 rounded-lg">
            <p className="text-2xl font-bold text-gray-900">{metrics.jobsPerHour}</p>
            <p className="text-sm text-gray-600 mt-1">Jobs/Hour</p>
          </div>
        </div>
      </div>

      {/* Recent Earnings */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-gray-900">💸 Recent Earnings</h3>
          <button
            onClick={handleWithdraw}
            disabled={withdrawing || parseFloat(earnings.total) === 0}
            className="px-6 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            {withdrawing ? 'Processing...' : '💰 Withdraw Earnings'}
          </button>
        </div>
        <div className="space-y-3">
          {earnings.recentPayments.length === 0 ? (
            <p className="text-gray-500 text-center py-4">No recent payments</p>
          ) : (
            earnings.recentPayments.slice(0, 5).map((payment) => (
              <div
                key={payment.id}
                className="flex justify-between items-center p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition"
              >
                <div>
                  <p className="font-semibold text-gray-900">
                    {new Date(payment.timestamp).toLocaleString()}
                  </p>
                  <p className="text-sm text-gray-600">Job #{payment.jobId.slice(0, 8)}</p>
                  {payment.txHash && (
                    <a
                      href={`https://etherscan.io/tx/${payment.txHash}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-blue-500 hover:underline"
                    >
                      View on Etherscan →
                    </a>
                  )}
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-green-600">+{formatETH(payment.amount)} ETH</p>
                  <span
                    className={`text-xs px-2 py-1 rounded ${
                      payment.status === 'confirmed'
                        ? 'bg-green-100 text-green-800'
                        : payment.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800'
                        : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {payment.status}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>
        {earnings.recentPayments.length > 5 && (
          <div className="text-center mt-4">
            <button className="text-blue-500 hover:underline text-sm">
              View All Earnings →
            </button>
          </div>
        )}
      </div>

      {/* Node Settings */}
      <div className="flex gap-4">
        <button className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition">
          ⚙️ Node Settings
        </button>
        <button
          onClick={() => {
            navigator.clipboard.writeText(nodeId);
            toast.success('Node ID copied!');
          }}
          className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
        >
          📋 Copy Node ID
        </button>
      </div>
    </div>
  );
}
