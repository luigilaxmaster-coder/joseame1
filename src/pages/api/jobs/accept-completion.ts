import type { APIRoute } from 'astro';
import wixData from 'wix-data';
import { getLoggedInMember } from 'wix-members-backend';

/**
 * POST /api/jobs/accept-completion
 * Accept a completion proposal
 */
export const POST: APIRoute = async ({ request }) => {
  try {
    if (request.method !== 'POST') {
      return new Response(JSON.stringify({ message: 'Method not allowed' }), {
        status: 405,
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
    const body = await request.json();
    const { completionAttemptId } = body;

    if (!completionAttemptId) {
      return new Response(JSON.stringify({ message: 'completionAttemptId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get attempt
    const attempt = await wixData.get('completionattempts', completionAttemptId);
    if (!attempt) {
      return new Response(JSON.stringify({ message: 'Completion attempt not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (attempt.status !== 'active') {
      return new Response(
        JSON.stringify({
          message: `Cannot accept: attempt status is ${attempt.status}, expected active`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get job
    const job = await wixData.get('joborders', attempt.jobOrderId);
    if (!job) {
      return new Response(JSON.stringify({ message: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate user belongs to job
    if (job.clientId !== userId && job.joseadorId !== userId) {
      return new Response(JSON.stringify({ message: 'FORBIDDEN: User does not belong to this job' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate user is NOT the proposer
    if (attempt.proposedByUserId === userId) {
      return new Response(JSON.stringify({ message: 'Cannot accept your own completion proposal' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Update attempt status
    await wixData.update('completionattempts', {
      _id: completionAttemptId,
      status: 'accepted',
    });

    // Update job: status = COMPLETED, clear activeCompletionAttemptId
    await wixData.update('joborders', {
      _id: attempt.jobOrderId,
      status: 'COMPLETED',
      activeCompletionAttemptId: null,
      updatedAt: new Date(),
    });

    // Create JobEvent
    const eventId = Math.random().toString(36).substr(2, 9);
    await wixData.insert('jobevents', {
      _id: eventId,
      jobOrderId: attempt.jobOrderId,
      actorId: userId,
      action: 'COMPLETION_ACCEPTED',
      meta: JSON.stringify({
        completionAttemptId,
      }),
      createdAt: new Date(),
    });

    // Create audit log
    const logId = Math.random().toString(36).substr(2, 9);
    await wixData.insert('auditlogs', {
      _id: logId,
      actionType: 'COMPLETION_ACCEPTED',
      actorId: userId,
      targetResourceType: 'JobOrder',
      targetResourceId: attempt.jobOrderId,
      timestamp: new Date(),
      details: 'Completion accepted',
    });

    return new Response(
      JSON.stringify({
        ok: true,
        message: 'Completion accepted successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in /api/jobs/accept-completion:', error);
    return new Response(JSON.stringify({ message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
