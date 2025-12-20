/**
 * Mock jobs service for frontend use
 * Real database operations are handled by API routes
 */

export interface JobContext {
  ok: boolean;
  job?: {
    _id: string;
    clientId: string;
    joseadorId: string;
    threadId: string;
    status: string;
    activeCompletionAttemptId?: string;
    createdAt: Date;
    updatedAt: Date;
  };
  activeAttempt?: {
    _id: string;
    proposedByUserId: string;
    proposedByRole: string;
    note: string;
    status: string;
    createdAt: Date;
  };
  currentUserId: string;
  userRole: 'client' | 'joseador';
  error?: string;
}

export interface JobTimeline {
  ok: boolean;
  events?: Array<{
    _id: string;
    action: string;
    actorId: string;
    meta: Record<string, any>;
    createdAt: Date;
  }>;
  error?: string;
}

export interface CompletionProposal {
  ok: boolean;
  completionAttemptId?: string;
  message?: string;
  error?: string;
}

export interface CompletionAcceptance {
  ok: boolean;
  message?: string;
  error?: string;
}

export interface RejectionResult {
  ok: boolean;
  rejectionId?: string;
  message?: string;
  error?: string;
}

/**
 * Get job context and timeline
 * @param threadId - The thread ID associated with the job
 */
export async function getJobContext(threadId: string): Promise<JobContext> {
  try {
    const response = await fetch(`/api/jobs/context?threadId=${encodeURIComponent(threadId)}`);
    if (!response.ok) {
      const error = await response.json();
      return { ok: false, error: error.message || 'Failed to fetch job context', currentUserId: '', userRole: 'client' };
    }
    return await response.json();
  } catch (error) {
    return { ok: false, error: String(error), currentUserId: '', userRole: 'client' };
  }
}

/**
 * Get job timeline events
 * @param jobOrderId - The job order ID
 */
export async function getJobTimeline(jobOrderId: string): Promise<JobTimeline> {
  try {
    const response = await fetch(`/api/jobs/timeline?jobOrderId=${encodeURIComponent(jobOrderId)}`);
    if (!response.ok) {
      const error = await response.json();
      return { ok: false, error: error.message || 'Failed to fetch timeline' };
    }
    return await response.json();
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Propose completion for a job
 * @param params - Completion proposal parameters
 */
export async function proposeCompletion(params: {
  jobOrderId: string;
  note: string;
  attachments?: Array<{ fileUrl: string; fileType: string; fileName?: string; description?: string }>;
}): Promise<CompletionProposal> {
  try {
    const response = await fetch('/api/jobs/propose-completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const error = await response.json();
      return { ok: false, error: error.message || 'Failed to propose completion' };
    }
    return await response.json();
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Accept a completion proposal
 * @param params - Acceptance parameters
 */
export async function acceptCompletion(params: {
  completionAttemptId: string;
}): Promise<CompletionAcceptance> {
  try {
    const response = await fetch('/api/jobs/accept-completion', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const error = await response.json();
      return { ok: false, error: error.message || 'Failed to accept completion' };
    }
    return await response.json();
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}

/**
 * Reject a completion or general issue
 * @param params - Rejection parameters
 */
export async function rejectUnified(params: {
  context: 'GENERAL' | 'COMPLETION';
  jobOrderId: string;
  completionAttemptId?: string;
  reasonCode: string;
  description: string;
  outcome?: string;
  attachments?: Array<{ fileUrl: string; fileType: string; fileName?: string }>;
  blockUser?: boolean;
}): Promise<RejectionResult> {
  try {
    const response = await fetch('/api/jobs/reject', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params),
    });
    if (!response.ok) {
      const error = await response.json();
      return { ok: false, error: error.message || 'Failed to reject' };
    }
    return await response.json();
  } catch (error) {
    return { ok: false, error: String(error) };
  }
}
