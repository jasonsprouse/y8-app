/**
 * Lit Compute Network API Client
 * Connects Y8 App frontend to The Beach backend
 */

export interface LitComputeJob {
  id: string;
  submitter: string;
  inputCID: string;
  accessControl: any;
  feeAmount: string;
  status: 'pending' | 'active' | 'completed' | 'failed';
  nodeId?: string;
  outputCID?: string;
  submittedAt: string;
  completedAt?: string;
}

export interface SystemStats {
  pendingJobs: number;
  completedJobs: number;
  activeNodes: number;
  totalJobsProcessed: number;
}

export interface NodeStatus {
  nodeId: string;
  wallet: string;
  status: 'online' | 'offline';
  reputation: number;
  activeJobs: number;
  totalJobsCompleted: number;
  lastHeartbeat: string;
}

export class LitComputeAPI {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:3000') {
    this.baseUrl = baseUrl;
  }

  /**
   * Submit a new encryption job to the network
   */
  async submitJob(params: {
    inputCID: string;
    accessControl: any;
    feeAmount: string;
    submitter: string;
  }): Promise<LitComputeJob> {
    const response = await fetch(`${this.baseUrl}/lit-compute/jobs/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to submit job: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get the status of a specific job
   */
  async getJobStatus(jobId: string): Promise<LitComputeJob> {
    const response = await fetch(`${this.baseUrl}/lit-compute/jobs/${jobId}`);

    if (!response.ok) {
      throw new Error(`Failed to get job status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get pending jobs (for dashboard)
   */
  async getPendingJobs(): Promise<LitComputeJob[]> {
    const response = await fetch(`${this.baseUrl}/lit-compute/jobs/pending/list`);

    if (!response.ok) {
      throw new Error(`Failed to get pending jobs: ${response.statusText}`);
    }

    const data = await response.json();
    return data.jobs || [];
  }

  /**
   * Get system statistics
   */
  async getSystemStats(): Promise<SystemStats> {
    const response = await fetch(`${this.baseUrl}/lit-compute/jobs/stats`);

    if (!response.ok) {
      throw new Error(`Failed to get system stats: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Register as a node operator
   */
  async registerNode(params: {
    wallet: string;
    publicKey: string;
    capabilities: {
      maxConcurrentJobs: number;
      supportedNetworks: string[];
    };
  }): Promise<{ nodeId: string; status: string }> {
    const response = await fetch(`${this.baseUrl}/lit-compute/nodes/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      throw new Error(`Failed to register node: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get node status
   */
  async getNodeStatus(nodeId: string): Promise<NodeStatus> {
    const response = await fetch(`${this.baseUrl}/lit-compute/nodes/${nodeId}/status`);

    if (!response.ok) {
      throw new Error(`Failed to get node status: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get node's active jobs
   */
  async getNodeJobs(nodeId: string): Promise<LitComputeJob[]> {
    const response = await fetch(`${this.baseUrl}/lit-compute/nodes/${nodeId}/jobs`);

    if (!response.ok) {
      throw new Error(`Failed to get node jobs: ${response.statusText}`);
    }

    const data = await response.json();
    return data.jobs || [];
  }

  /**
   * Get node's pending payments
   */
  async getNodePayments(nodeId: string): Promise<any[]> {
    const response = await fetch(`${this.baseUrl}/lit-compute/nodes/${nodeId}/payments`);

    if (!response.ok) {
      throw new Error(`Failed to get node payments: ${response.statusText}`);
    }

    const data = await response.json();
    return data.payments || [];
  }

  /**
   * Send heartbeat (for node operators)
   */
  async sendHeartbeat(nodeId: string, status: any): Promise<any> {
    const response = await fetch(`${this.baseUrl}/lit-compute/nodes/heartbeat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ nodeId, status }),
    });

    if (!response.ok) {
      throw new Error(`Failed to send heartbeat: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
export const litComputeAPI = new LitComputeAPI();
