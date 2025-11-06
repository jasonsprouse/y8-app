/**
 * Job List Component
 * Browse and search all jobs in the network with real-time updates
 */

'use client';

import { useEffect, useState } from 'react';
import { useLitComputeSocket } from '@/hooks/useLitComputeSocket';
import { LitComputeAPI, type LitComputeJob } from '@/lib/lit-compute-api';
import toast from 'react-hot-toast';
import Link from 'next/link';

interface JobListProps {
  userId?: string; // Filter by user's jobs
  nodeId?: string; // Filter by node's jobs
  limit?: number; // Max number of jobs to display
}

type StatusFilter = 'all' | 'pending' | 'active' | 'completed' | 'failed';
type SortBy = 'date-desc' | 'date-asc' | 'fee-desc' | 'fee-asc';

export default function JobList({ userId, nodeId, limit }: JobListProps) {
  const [jobs, setJobs] = useState<LitComputeJob[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<LitComputeJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortBy>('date-desc');
  const [searchQuery, setSearchQuery] = useState('');
  const [autoRefresh, setAutoRefresh] = useState(true);

  const api = new LitComputeAPI();
  const { isConnected } = useLitComputeSocket({ autoConnect: true });

  // Fetch jobs
  const fetchJobs = async () => {
    try {
      setLoading(true);
      let data: LitComputeJob[];

      if (userId) {
        data = await api.getJobsByUser(userId);
      } else if (nodeId) {
        data = await api.getJobsByNode(nodeId);
      } else {
        data = await api.getAllJobs();
      }

      setJobs(data);
    } catch (error) {
      console.error('Failed to fetch jobs:', error);
      toast.error('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    // Auto-refresh every 5 seconds if enabled
    let interval: NodeJS.Timeout | null = null;
    if (autoRefresh) {
      interval = setInterval(fetchJobs, 5000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [userId, nodeId, autoRefresh]);

  // Apply filters and sorting
  useEffect(() => {
    let filtered = [...jobs];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter((job) => job.status === statusFilter);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (job) =>
          job.id.toLowerCase().includes(query) ||
          job.submitter.toLowerCase().includes(query) ||
          job.inputCID.toLowerCase().includes(query) ||
          job.nodeId?.toLowerCase().includes(query)
      );
    }

    // Sort
    filtered.sort((a, b) => {
      switch (sortBy) {
        case 'date-desc':
          return new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime();
        case 'date-asc':
          return new Date(a.submittedAt).getTime() - new Date(b.submittedAt).getTime();
        case 'fee-desc':
          return parseFloat(b.feeAmount) - parseFloat(a.feeAmount);
        case 'fee-asc':
          return parseFloat(a.feeAmount) - parseFloat(b.feeAmount);
        default:
          return 0;
      }
    });

    // Apply limit
    if (limit) {
      filtered = filtered.slice(0, limit);
    }

    setFilteredJobs(filtered);
  }, [jobs, statusFilter, sortBy, searchQuery, limit]);

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: 'bg-yellow-100 text-yellow-800',
      active: 'bg-blue-100 text-blue-800',
      completed: 'bg-green-100 text-green-800',
      failed: 'bg-red-100 text-red-800',
    };

    const icons = {
      pending: '⏳',
      active: '🔄',
      completed: '✅',
      failed: '❌',
    };

    return (
      <span className={`inline-flex items-center gap-1 text-xs px-3 py-1 rounded-full ${styles[status as keyof typeof styles]}`}>
        <span>{icons[status as keyof typeof icons]}</span>
        {status.toUpperCase()}
      </span>
    );
  };

  const formatDuration = (start: string, end?: string) => {
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const durationMs = endTime - startTime;
    const minutes = Math.floor(durationMs / 60000);
    const seconds = Math.floor((durationMs % 60000) / 1000);

    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  };

  const formatETH = (eth: string) => {
    return parseFloat(eth).toFixed(4);
  };

  if (loading && jobs.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">📋 Jobs</h2>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-sm text-gray-600">
              {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''}
            </p>
            {isConnected && (
              <div className="flex items-center gap-1">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                <span className="text-xs text-green-600">Live</span>
              </div>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-wrap gap-2">
          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as StatusFilter)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="active">Active</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
          </select>

          {/* Sort */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortBy)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="date-desc">Newest First</option>
            <option value="date-asc">Oldest First</option>
            <option value="fee-desc">Highest Fee</option>
            <option value="fee-asc">Lowest Fee</option>
          </select>

          {/* Auto-refresh Toggle */}
          <button
            onClick={() => setAutoRefresh(!autoRefresh)}
            className={`px-4 py-2 rounded-lg transition ${
              autoRefresh
                ? 'bg-blue-500 text-white hover:bg-blue-600'
                : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
            }`}
          >
            {autoRefresh ? '⏸️ Pause' : '▶️ Auto-refresh'}
          </button>

          {/* Manual Refresh */}
          <button
            onClick={fetchJobs}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition"
          >
            🔄 Refresh
          </button>
        </div>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search by Job ID, Submitter, CID, or Node ID..."
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Jobs List */}
      {filteredJobs.length === 0 ? (
        <div className="text-center py-12 text-gray-500 bg-white rounded-lg shadow-md">
          <p className="text-lg">No jobs found</p>
          <p className="text-sm mt-2">Try adjusting your filters or search query</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredJobs.map((job) => (
            <Link
              key={job.id}
              href={`/lit-compute/jobs/${job.id}`}
              className="block bg-white rounded-lg shadow-md hover:shadow-lg transition p-4 border border-gray-200 hover:border-blue-300"
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Left: Job Info */}
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-lg font-bold text-gray-900">Job #{job.id.slice(0, 8)}</span>
                    {getStatusBadge(job.status)}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-semibold">Submitter:</span>{' '}
                      <span className="font-mono text-xs">{job.submitter.slice(0, 16)}...</span>
                    </div>
                    <div>
                      <span className="font-semibold">Input CID:</span>{' '}
                      <span className="font-mono text-xs">{job.inputCID.slice(0, 16)}...</span>
                    </div>
                    {job.nodeId && (
                      <div>
                        <span className="font-semibold">Node:</span>{' '}
                        <span className="font-mono text-xs">{job.nodeId.slice(0, 16)}...</span>
                      </div>
                    )}
                    {job.outputCID && (
                      <div>
                        <span className="font-semibold">Output CID:</span>{' '}
                        <span className="font-mono text-xs">{job.outputCID.slice(0, 16)}...</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Metrics */}
                <div className="flex flex-row md:flex-col items-start md:items-end gap-2">
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Fee</p>
                    <p className="text-lg font-bold text-green-600">{formatETH(job.feeAmount)} ETH</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">Duration</p>
                    <p className="text-sm font-semibold text-gray-900">
                      {formatDuration(job.submittedAt, job.completedAt)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">
                      {new Date(job.submittedAt).toLocaleString()}
                    </p>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Show More */}
      {limit && filteredJobs.length === limit && (
        <div className="text-center">
          <Link
            href="/lit-compute/jobs"
            className="inline-block px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
          >
            View All Jobs →
          </Link>
        </div>
      )}
    </div>
  );
}
