/**
 * React Hook for WebSocket connection to Lit Compute Network
 * Provides real-time job updates and system stats
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';

interface JobUpdate {
  jobId: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  nodeId?: string;
  outputCID?: string;
  timestamp: string;
}

interface SystemStats {
  pendingJobs: number;
  completedJobs: number;
  activeNodes: number;
  timestamp: string;
}

interface UseLitComputeSocketOptions {
  jobId?: string;
  nodeId?: string;
  autoConnect?: boolean;
}

export function useLitComputeSocket(options: UseLitComputeSocketOptions = {}) {
  const { jobId, nodeId, autoConnect = true } = options;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [jobStatus, setJobStatus] = useState<JobUpdate | null>(null);
  const [systemStats, setSystemStats] = useState<SystemStats | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!autoConnect) return;

    const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000';
    const newSocket = io(`${backendUrl}/lit-compute`, {
      transports: ['websocket'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    setSocket(newSocket);

    // Connection event handlers
    newSocket.on('connect', () => {
      console.log('Connected to Lit Compute WebSocket');
      setIsConnected(true);
      setError(null);

      // Subscribe to job updates if jobId provided
      if (jobId) {
        newSocket.emit('subscribe:job', { jobId });
      }

      // Subscribe to node commands if nodeId provided
      if (nodeId) {
        newSocket.emit('subscribe:node', { nodeId });
      }
    });

    newSocket.on('disconnect', () => {
      console.log('Disconnected from Lit Compute WebSocket');
      setIsConnected(false);
    });

    newSocket.on('connect_error', (err) => {
      console.error('WebSocket connection error:', err);
      setError(err.message);
      setIsConnected(false);
    });

    // Job update handler
    newSocket.on('job:update', (data: JobUpdate) => {
      console.log('Job update received:', data);
      setJobStatus(data);
    });

    // System stats handler
    newSocket.on('system:stats', (data: SystemStats) => {
      console.log('System stats received:', data);
      setSystemStats(data);
    });

    // Node command handler (for node operators)
    newSocket.on('node:command', (data: any) => {
      console.log('Node command received:', data);
      // Handle node commands (e.g., NEW_JOB)
    });

    // System event handler
    newSocket.on('system:event', (data: any) => {
      console.log('System event received:', data);
    });

    // Cleanup on unmount
    return () => {
      if (jobId) {
        newSocket.emit('unsubscribe:job', { jobId });
      }
      newSocket.close();
    };
  }, [jobId, nodeId, autoConnect]);

  // Manual subscribe to job updates
  const subscribeToJob = useCallback((newJobId: string) => {
    if (socket && isConnected) {
      socket.emit('subscribe:job', { jobId: newJobId });
    }
  }, [socket, isConnected]);

  // Manual unsubscribe from job updates
  const unsubscribeFromJob = useCallback((oldJobId: string) => {
    if (socket && isConnected) {
      socket.emit('unsubscribe:job', { jobId: oldJobId });
    }
  }, [socket, isConnected]);

  // Manual connect
  const connect = useCallback(() => {
    if (socket && !isConnected) {
      socket.connect();
    }
  }, [socket, isConnected]);

  // Manual disconnect
  const disconnect = useCallback(() => {
    if (socket && isConnected) {
      socket.disconnect();
    }
  }, [socket, isConnected]);

  return {
    socket,
    isConnected,
    jobStatus,
    systemStats,
    error,
    subscribeToJob,
    unsubscribeFromJob,
    connect,
    disconnect,
  };
}
