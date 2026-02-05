/**
 * Type declarations for jobs.jsw backend module
 */

export interface RejectUnifiedParams {
  context: 'GENERAL' | 'COMPLETION';
  jobOrderId: string;
  completionAttemptId?: string;
  reasonCode: string;
  description: string;
  outcome: string;
  attachments: Array<{
    fileUrl: string;
    fileType: string;
    fileName: string;
  }>;
}

export interface ProposeCompletionParams {
  jobOrderId: string;
  note: string;
  attachments: Array<{
    fileUrl: string;
    fileType: string;
    fileName: string;
    description: string;
  }>;
}

export interface AcceptCompletionParams {
  completionAttemptId: string;
}

export interface BackendResult {
  ok: boolean;
  error?: string;
}

export function rejectUnified(params: RejectUnifiedParams): Promise<BackendResult>;
export function proposeCompletion(params: ProposeCompletionParams): Promise<BackendResult>;
export function acceptCompletion(params: AcceptCompletionParams): Promise<BackendResult>;
