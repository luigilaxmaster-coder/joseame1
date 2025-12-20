import type { APIRoute } from 'astro';
import { BaseCrudService } from '@/integrations';
import { JobOrders, CompletionAttempts, CompletionAttachments, JobEvents, SystemAuditLogs } from '@/entities';

interface ProposeCompletionRequest {
  jobOrderId: string;
  note: string;
  attachments?: Array<{
    fileUrl: string;
    fileType: string;
    fileName?: string;
    description?: string;
  }>;
}

/**
 * Helper: Check if active completion attempt exists for job
 */
async function checkActiveAttemptExists(jobOrderId: string): Promise<boolean> {
  const { items } = await BaseCrudService.getAll<CompletionAttempts>('completionattempts');
  return items.some(a => a.jobOrderId === jobOrderId && a.status === 'active');
}

/**
 * Helper: Create job event
 */
async function createJobEvent(
  jobOrderId: string,
  actorId: string,
  action: string,
  meta: Record<string, any> = {}
): Promise<void> {
  const eventId = crypto.randomUUID();
  const event: JobEvents = {
    _id: eventId,
    jobOrderId,
    actorId,
    action,
    meta: JSON.stringify(meta),
    createdAt: new Date().toISOString(),
  };
  await BaseCrudService.create('jobevents', event);
}

/**
 * Helper: Create audit log entry
 */
async function createAuditLog(
  actionType: string,
  actorId: string,
  targetResourceType: string,
  targetResourceId: string,
  details: string = ''
): Promise<void> {
  const logId = crypto.randomUUID();
  const log: SystemAuditLogs = {
    _id: logId,
    actionType,
    actorId,
    targetResourceType,
    targetResourceId,
    timestamp: new Date().toISOString(),
    details,
  };
  await BaseCrudService.create('auditlogs', log);
}

/**
 * POST /api/jobs/propose-completion
 * Creates CompletionAttempt + saves attachments + updates JobOrder status
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as ProposeCompletionRequest;
    const { jobOrderId, note, attachments = [] } = body;

    // Validate inputs
    if (!jobOrderId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'jobOrderId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (!note || note.trim().length < 10) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Note must be at least 10 characters' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get and validate job
    const job = await BaseCrudService.getById<JobOrders>('joborders', jobOrderId);
    if (!job) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Job not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check job status
    if (job.status !== 'IN_PROGRESS') {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Cannot propose completion: job status is ${job.status}, expected IN_PROGRESS`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Check no active attempt exists
    const hasActiveAttempt = await checkActiveAttemptExists(jobOrderId);
    if (hasActiveAttempt) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: 'ACTIVE_ATTEMPT_EXISTS: Cannot propose completion while another attempt is active',
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Get userId from authenticated session
    const userId = 'user-placeholder'; // This should come from auth context

    // Determine proposer role
    const proposedByRole = job.clientId === userId ? 'client' : 'joseador';

    // Create CompletionAttempt
    const attemptId = crypto.randomUUID();
    const attempt: CompletionAttempts = {
      _id: attemptId,
      jobOrderId,
      proposedByUserId: userId,
      proposedByRole,
      note: note.trim(),
      status: 'active',
      createdAt: new Date().toISOString(),
    };
    await BaseCrudService.create('completionattempts', attempt);

    // Save attachments
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        const attId = crypto.randomUUID();
        const attachment: CompletionAttachments = {
          _id: attId,
          completionAttemptId: attemptId,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileName: att.fileName || 'file',
          description: att.description || '',
          createdAt: new Date().toISOString(),
        };
        await BaseCrudService.create('completionattachments', attachment);
      }
    }

    // Update JobOrder status and activeCompletionAttemptId
    await BaseCrudService.update('joborders', {
      _id: jobOrderId,
      status: 'COMPLETION_PROPOSED',
      activeCompletionAttemptId: attemptId,
      updatedAt: new Date().toISOString(),
    });

    // Create JobEvent
    await createJobEvent(jobOrderId, userId, 'COMPLETION_PROPOSED', {
      completionAttemptId: attemptId,
      proposedByRole,
    });

    // Create audit log
    await createAuditLog(
      'COMPLETION_PROPOSED',
      userId,
      'JobOrder',
      jobOrderId,
      `Completion proposed by ${proposedByRole}`
    );

    return new Response(
      JSON.stringify({
        ok: true,
        completionAttemptId: attemptId,
        message: 'Completion proposed successfully',
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ ok: false, error: message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
};
