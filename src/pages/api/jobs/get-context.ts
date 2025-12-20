import type { APIRoute } from 'astro';
import { BaseCrudService } from '@/integrations';
import { JobOrders, CompletionAttempts } from '@/entities';

/**
 * GET /api/jobs/get-context
 * Returns JobOrder + activeCompletionAttempt if exists
 * Query params: threadId
 */
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const threadId = url.searchParams.get('threadId');

    if (!threadId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'threadId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find job by threadId
    const { items: jobs } = await BaseCrudService.getAll<JobOrders>('joborders');
    const job = jobs.find(j => j.threadId === threadId);

    if (!job) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Job not found for this thread' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get active completion attempt if exists
    let activeAttempt = null;
    if (job.activeCompletionAttemptId) {
      activeAttempt = await BaseCrudService.getById<CompletionAttempts>(
        'completionattempts',
        job.activeCompletionAttemptId
      );
    }

    return new Response(
      JSON.stringify({
        ok: true,
        job: {
          _id: job._id,
          clientId: job.clientId,
          joseadorId: job.joseadorId,
          threadId: job.threadId,
          status: job.status,
          activeCompletionAttemptId: job.activeCompletionAttemptId,
          createdAt: job.createdAt,
          updatedAt: job.updatedAt,
        },
        activeAttempt: activeAttempt ? {
          _id: activeAttempt._id,
          proposedByUserId: activeAttempt.proposedByUserId,
          proposedByRole: activeAttempt.proposedByRole,
          note: activeAttempt.note,
          status: activeAttempt.status,
          createdAt: activeAttempt.createdAt,
        } : null,
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
