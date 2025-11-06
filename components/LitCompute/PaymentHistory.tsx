/**
 * Payment History Component
 * Transaction history with filtering, search, and CSV export
 */

'use client';

import { useEffect, useState } from 'react';
import { LitComputeAPI } from '@/lib/lit-compute-api';
import toast from 'react-hot-toast';

interface PaymentHistoryProps {
  nodeId?: string; // If viewing as node operator
  userId?: string; // If viewing as job submitter
  compact?: boolean; // Show compact view (5 items)
}

interface Transaction {
  id: string;
  timestamp: string;
  type: 'earned' | 'spent' | 'withdrawn' | 'refund';
  amount: string; // ETH
  amountUSD?: string;
  jobId: string;
  status: 'pending' | 'confirmed' | 'failed';
  txHash?: string;
  nodeId?: string;
  description?: string;
}

type FilterType = 'all' | 'earned' | 'spent' | 'withdrawn' | 'refund';
type DateRange = '7days' | '30days' | '90days' | 'all';

export default function PaymentHistory({ nodeId, userId, compact = false }: PaymentHistoryProps) {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [filteredTransactions, setFilteredTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [dateRange, setDateRange] = useState<DateRange>('30days');
  const [searchQuery, setSearchQuery] = useState('');
  const [exporting, setExporting] = useState(false);

  const api = new LitComputeAPI();
  const itemsPerPage = compact ? 5 : 20;

  // Fetch transactions
  useEffect(() => {
    const fetchTransactions = async () => {
      try {
        setLoading(true);
        let data: Transaction[];

        if (nodeId) {
          data = await api.getNodeTransactions(nodeId);
        } else if (userId) {
          data = await api.getUserTransactions(userId);
        } else {
          data = [];
        }

        setTransactions(data);
        applyFilters(data);
      } catch (error) {
        console.error('Failed to fetch transactions:', error);
        toast.error('Failed to load payment history');
      } finally {
        setLoading(false);
      }
    };

    fetchTransactions();
  }, [nodeId, userId]);

  // Apply filters whenever they change
  useEffect(() => {
    applyFilters(transactions);
  }, [filterType, dateRange, searchQuery, transactions]);

  const applyFilters = (data: Transaction[]) => {
    let filtered = [...data];

    // Filter by type
    if (filterType !== 'all') {
      filtered = filtered.filter((tx) => tx.type === filterType);
    }

    // Filter by date range
    const now = Date.now();
    const rangeMs = {
      '7days': 7 * 24 * 60 * 60 * 1000,
      '30days': 30 * 24 * 60 * 60 * 1000,
      '90days': 90 * 24 * 60 * 60 * 1000,
      'all': Infinity,
    };

    if (dateRange !== 'all') {
      const cutoff = now - rangeMs[dateRange];
      filtered = filtered.filter((tx) => new Date(tx.timestamp).getTime() > cutoff);
    }

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.id.toLowerCase().includes(query) ||
          tx.jobId.toLowerCase().includes(query) ||
          tx.txHash?.toLowerCase().includes(query)
      );
    }

    setFilteredTransactions(filtered);
    setTotalPages(Math.ceil(filtered.length / itemsPerPage));
    setCurrentPage(1); // Reset to first page
  };

  const exportToCSV = () => {
    setExporting(true);

    try {
      // Create CSV content
      const headers = ['Date', 'Time', 'Type', 'Amount (ETH)', 'Amount (USD)', 'Job ID', 'Status', 'Tx Hash'];
      const rows = filteredTransactions.map((tx) => [
        new Date(tx.timestamp).toLocaleDateString(),
        new Date(tx.timestamp).toLocaleTimeString(),
        tx.type,
        tx.amount,
        tx.amountUSD || '',
        tx.jobId,
        tx.status,
        tx.txHash || '',
      ]);

      const csvContent =
        headers.join(',') +
        '\n' +
        rows.map((row) => row.map((cell) => `"${cell}"`).join(',')).join('\n');

      // Download file
      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `lit-compute-transactions-${Date.now()}.csv`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast.success('CSV exported successfully!');
    } catch (error) {
      console.error('Export failed:', error);
      toast.error('Failed to export CSV');
    } finally {
      setExporting(false);
    }
  };

  const formatETH = (eth: string) => {
    return parseFloat(eth).toFixed(4);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'earned':
        return '💰';
      case 'spent':
        return '💸';
      case 'withdrawn':
        return '🏦';
      case 'refund':
        return '↩️';
      default:
        return '📝';
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'earned':
        return 'text-green-600';
      case 'spent':
        return 'text-red-600';
      case 'withdrawn':
        return 'text-blue-600';
      case 'refund':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
    };

    return (
      <span className={`text-xs px-2 py-1 rounded ${styles[status as keyof typeof styles] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const paginatedTransactions = filteredTransactions.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[200px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header & Filters */}
      {!compact && (
        <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">💸 Payment History</h2>
            <p className="text-sm text-gray-600 mt-1">
              {filteredTransactions.length} transaction{filteredTransactions.length !== 1 ? 's' : ''}
            </p>
          </div>

          {/* Filters */}
          <div className="flex flex-wrap gap-2">
            {/* Type Filter */}
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value as FilterType)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Types</option>
              <option value="earned">Earned</option>
              <option value="spent">Spent</option>
              <option value="withdrawn">Withdrawn</option>
              <option value="refund">Refunds</option>
            </select>

            {/* Date Range Filter */}
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value as DateRange)}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7days">Last 7 Days</option>
              <option value="30days">Last 30 Days</option>
              <option value="90days">Last 90 Days</option>
              <option value="all">All Time</option>
            </select>

            {/* Export Button */}
            <button
              onClick={exportToCSV}
              disabled={exporting || filteredTransactions.length === 0}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {exporting ? 'Exporting...' : '📥 Export CSV'}
            </button>
          </div>
        </div>
      )}

      {/* Search */}
      {!compact && (
        <input
          type="text"
          placeholder="Search by Job ID or Tx Hash..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      )}

      {/* Transactions Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        {paginatedTransactions.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            No transactions found
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date & Time
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Job ID
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  {!compact && (
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tx Hash
                    </th>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {paginatedTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {new Date(tx.timestamp).toLocaleDateString()}
                      </div>
                      <div className="text-xs text-gray-500">
                        {new Date(tx.timestamp).toLocaleTimeString()}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="text-sm">
                        {getTypeIcon(tx.type)} {tx.type.charAt(0).toUpperCase() + tx.type.slice(1)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className={`text-sm font-semibold ${getTypeColor(tx.type)}`}>
                        {tx.type === 'earned' || tx.type === 'refund' ? '+' : '-'}
                        {formatETH(tx.amount)} ETH
                      </div>
                      {tx.amountUSD && (
                        <div className="text-xs text-gray-500">${tx.amountUSD}</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(tx.jobId);
                          toast.success('Job ID copied!');
                        }}
                        className="text-sm text-blue-500 hover:underline font-mono"
                      >
                        #{tx.jobId.slice(0, 8)}...
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(tx.status)}
                    </td>
                    {!compact && (
                      <td className="px-6 py-4 whitespace-nowrap">
                        {tx.txHash ? (
                          <a
                            href={`https://etherscan.io/tx/${tx.txHash}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-blue-500 hover:underline"
                          >
                            View on Etherscan →
                          </a>
                        ) : (
                          <span className="text-sm text-gray-400">-</span>
                        )}
                      </td>
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!compact && totalPages > 1 && (
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600">
            Page {currentPage} of {totalPages}
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              ← Previous
            </button>
            <button
              onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Next →
            </button>
          </div>
        </div>
      )}

      {/* Compact View: View All Link */}
      {compact && filteredTransactions.length > itemsPerPage && (
        <div className="text-center">
          <button className="text-blue-500 hover:underline text-sm">
            View All {filteredTransactions.length} Transactions →
          </button>
        </div>
      )}
    </div>
  );
}
