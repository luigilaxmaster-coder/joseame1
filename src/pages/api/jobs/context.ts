import type { APIRoute } from 'astro';
// @ts-ignore - Backend module, not processed by frontend build
import wixData from 'wix-data';
// @ts-ignore - Backend module, not processed by frontend build
import { getLoggedInMember } from 'wix-members-backend';

/**
 * GET /api/jobs/context
 * Get job context by threadId
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const threadId = url.searchParams.get('threadId');
    if (!threadId) {
      return new Response(JSON.stringify({ message: 'threadId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get current user
    const member = await getLoggedInMember();
    if (!member) {
      return new Response(JSON.stringify({ message: 'UNAUTHORIZED: User not logged in' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const userId = member._id;

    // Find job by threadId
    const jobs = await wixData.query('joborders')
      .eq('threadId', threadId)
      .find();

    if (jobs.items.length === 0) {
      return new Response(JSON.stringify({ message: 'Job not found for this thread' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const job = jobs.items[0];

    // Validate user belongs to job
    if (job.clientId !== userId && job.joseadorId !== userId) {
      return new Response(JSON.stringify({ message: 'FORBIDDEN: User does not belong to this job' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get active completion attempt if exists
    let activeAttempt = null;
    if (job.activeCompletionAttemptId) {
      activeAttempt = await wixData.get('completionattempts', job.activeCompletionAttemptId);
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
        activeAttempt: activeAttempt
          ? {
              _id: activeAttempt._id,
              proposedByUserId: activeAttempt.proposedByUserId,
              proposedByRole: activeAttempt.proposedByRole,
              note: activeAttempt.note,
              status: activeAttempt.status,
              createdAt: activeAttempt.createdAt,
            }
          : null,
        currentUserId: userId,
        userRole: job.clientId === userId ? 'client' : 'joseador',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in /api/jobs/context:', error);
    return new Response(JSON.stringify({ message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
