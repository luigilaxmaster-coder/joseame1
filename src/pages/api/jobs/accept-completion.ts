import type { APIRoute } from 'astro';
import { BaseCrudService } from '@/integrations';
import { CompletionAttempts, JobOrders, JobEvents, SystemAuditLogs } from '@/entities';

interface AcceptCompletionRequest {
  completionAttemptId: string;
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
 * POST /api/jobs/accept-completion
 * Validates attempt exists, current user is NOT proposer, then accepts
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    const body = (await request.json()) as AcceptCompletionRequest;
    const { completionAttemptId } = body;

    if (!completionAttemptId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'completionAttemptId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get attempt
    const attempt = await BaseCrudService.getById<CompletionAttempts>(
      'completionattempts',
      completionAttemptId
    );
    if (!attempt) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Completion attempt not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    if (attempt.status !== 'active') {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Cannot accept: attempt status is ${attempt.status}, expected active`,
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get job
    const job = await BaseCrudService.getById<JobOrders>('joborders', attempt.jobOrderId!);
    if (!job) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Job not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // TODO: Get userId from authenticated session
    const userId = 'user-placeholder'; // This should come from auth context

    // Validate user is NOT the proposer
    if (attempt.proposedByUserId === userId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Cannot accept your own completion proposal' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update attempt status
    await BaseCrudService.update('completionattempts', {
      _id: completionAttemptId,
      status: 'accepted',
    });

    // Update job: status = COMPLETED, clear activeCompletionAttemptId
    await BaseCrudService.update('joborders', {
      _id: attempt.jobOrderId!,
      status: 'COMPLETED',
      activeCompletionAttemptId: null,
      updatedAt: new Date().toISOString(),
    });

    // Create JobEvent
    await createJobEvent(attempt.jobOrderId!, userId, 'COMPLETION_ACCEPTED', {
      completionAttemptId,
    });

    // Create audit log
    await createAuditLog(
      'COMPLETION_ACCEPTED',
      userId,
      'JobOrder',
      attempt.jobOrderId!,
      'Completion accepted'
    );

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Completion accepted successfully',
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
