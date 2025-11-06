/**
 * Job Submission Component for Lit Compute Network
 * Allows users to submit encryption jobs and upload files to IPFS
 */

'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { litComputeAPI } from '@/lib/lit-compute-api';
import { useLitComputeSocket } from '@/hooks/useLitComputeSocket';
import toast from 'react-hot-toast';

export default function JobSubmission() {
  const { pkp, isAuthenticated } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [inputCID, setInputCID] = useState('');
  const [feeAmount, setFeeAmount] = useState('0.1');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentJobId, setCurrentJobId] = useState<string | null>(null);

  // WebSocket connection for real-time updates
  const { jobStatus, isConnected } = useLitComputeSocket({
    jobId: currentJobId || undefined,
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const uploadToIPFS = async (file: File): Promise<string> => {
    // In production, this would upload to IPFS
    // For demo, we'll generate a mock CID
    const mockCID = `Qm${Math.random().toString(36).substring(2, 15)}`;
    toast.success(`File uploaded to IPFS: ${mockCID}`);
    return mockCID;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!isAuthenticated || !pkp) {
      toast.error('Please connect your wallet first');
      return;
    }

    if (!inputCID && !file) {
      toast.error('Please provide an IPFS CID or upload a file');
      return;
    }

    setIsSubmitting(true);

    try {
      let cid = inputCID;

      // Upload file to IPFS if provided
      if (file) {
        cid = await uploadToIPFS(file);
        setInputCID(cid);
      }

      // Submit job to the network
      const job = await litComputeAPI.submitJob({
        inputCID: cid,
        accessControl: {
          // Use PKP public key for access control
          publicKey: pkp.publicKey,
          conditions: [],
        },
        feeAmount,
        submitter: pkp.ethAddress,
      });

      toast.success(`Job submitted! ID: ${job.id}`);
      setCurrentJobId(job.id);

      // Reset form
      setFile(null);
      setInputCID('');
    } catch (error) {
      console.error('Error submitting job:', error);
      toast.error('Failed to submit job');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6">Submit Encryption Job</h2>

      {/* WebSocket Connection Status */}
      <div className="mb-4 p-3 rounded" style={{ backgroundColor: isConnected ? '#d4edda' : '#f8d7da' }}>
        <span className="text-sm font-medium">
          {isConnected ? '🟢 Connected to network' : '🔴 Disconnected'}
        </span>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* File Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Upload File
          </label>
          <input
            type="file"
            onChange={handleFileChange}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
          {file && (
            <p className="mt-2 text-sm text-gray-600">
              Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
            </p>
          )}
        </div>

        {/* OR Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">OR</span>
          </div>
        </div>

        {/* IPFS CID Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            IPFS CID
          </label>
          <input
            type="text"
            value={inputCID}
            onChange={(e) => setInputCID(e.target.value)}
            placeholder="QmXxxx..."
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* Fee Amount */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Fee Amount (ETH)
          </label>
          <input
            type="number"
            step="0.01"
            min="0.01"
            value={feeAmount}
            onChange={(e) => setFeeAmount(e.target.value)}
            className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
          />
        </div>

        {/* PKP Info */}
        {pkp && (
          <div className="p-3 bg-gray-50 rounded">
            <p className="text-sm text-gray-600">
              <strong>Your PKP:</strong> {pkp.ethAddress.substring(0, 10)}...{pkp.ethAddress.substring(pkp.ethAddress.length - 8)}
            </p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting || !isAuthenticated}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          {isSubmitting ? 'Submitting...' : 'Submit Job'}
        </button>
      </form>

      {/* Job Status */}
      {jobStatus && (
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-lg font-semibold mb-3">Job Status</h3>
          <div className="space-y-2">
            <p className="text-sm">
              <strong>Job ID:</strong> {jobStatus.jobId}
            </p>
            <p className="text-sm">
              <strong>Status:</strong>{' '}
              <span className={`px-2 py-1 rounded text-xs font-medium ${
                jobStatus.status === 'completed' ? 'bg-green-100 text-green-800' :
                jobStatus.status === 'active' ? 'bg-blue-100 text-blue-800' :
                jobStatus.status === 'failed' ? 'bg-red-100 text-red-800' :
                'bg-yellow-100 text-yellow-800'
              }`}>
                {jobStatus.status.toUpperCase()}
              </span>
            </p>
            {jobStatus.nodeId && (
              <p className="text-sm">
                <strong>Assigned Node:</strong> {jobStatus.nodeId}
              </p>
            )}
            {jobStatus.outputCID && (
              <p className="text-sm">
                <strong>Output CID:</strong> {jobStatus.outputCID}
              </p>
            )}
            <p className="text-sm text-gray-500">
              Last updated: {new Date(jobStatus.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
