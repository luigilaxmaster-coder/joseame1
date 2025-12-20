import type { APIRoute } from 'astro';
import wixData from 'wix-data';
import { getLoggedInMember } from 'wix-members-backend';

/**
 * POST /api/jobs/propose-completion
 * Propose completion for a job
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
    const { jobOrderId, note, attachments = [] } = body;

    // Validate inputs
    if (!jobOrderId) {
      return new Response(JSON.stringify({ message: 'jobOrderId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!note || note.trim().length < 10) {
      return new Response(JSON.stringify({ message: 'Note must be at least 10 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Get and validate job
    const job = await wixData.get('joborders', jobOrderId);
    if (!job) {
      return new Response(JSON.stringify({ message: 'Job not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (job.clientId !== userId && job.joseadorId !== userId) {
      return new Response(JSON.stringify({ message: 'FORBIDDEN: User does not belong to this job' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Check job status
    if (job.status !== 'IN_PROGRESS') {
      return new Response(
        JSON.stringify({
          message: `Cannot propose completion: job status is ${job.status}, expected IN_PROGRESS`,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check no active attempt exists
    const attempts = await wixData.query('completionattempts')
      .eq('jobOrderId', jobOrderId)
      .eq('status', 'active')
      .find();

    if (attempts.items.length > 0) {
      return new Response(
        JSON.stringify({
          message: 'ACTIVE_ATTEMPT_EXISTS: Cannot propose completion while another attempt is active',
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Determine proposer role
    const proposedByRole = job.clientId === userId ? 'client' : 'joseador';

    // Create CompletionAttempt
    const attemptId = Math.random().toString(36).substr(2, 9);
    const attempt = {
      _id: attemptId,
      jobOrderId,
      proposedByUserId: userId,
      proposedByRole,
      note: note.trim(),
      status: 'active',
      createdAt: new Date(),
    };
    await wixData.insert('completionattempts', attempt);

    // Save attachments
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        const attId = Math.random().toString(36).substr(2, 9);
        await wixData.insert('completionattachments', {
          _id: attId,
          completionAttemptId: attemptId,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileName: att.fileName || 'file',
          description: att.description || '',
          createdAt: new Date(),
        });
      }
    }

    // Update JobOrder status and activeCompletionAttemptId
    await wixData.update('joborders', {
      _id: jobOrderId,
      status: 'COMPLETION_PROPOSED',
      activeCompletionAttemptId: attemptId,
      updatedAt: new Date(),
    });

    // Create JobEvent
    const eventId = Math.random().toString(36).substr(2, 9);
    await wixData.insert('jobevents', {
      _id: eventId,
      jobOrderId,
      actorId: userId,
      action: 'COMPLETION_PROPOSED',
      meta: JSON.stringify({
        completionAttemptId: attemptId,
        proposedByRole,
      }),
      createdAt: new Date(),
    });

    // Create audit log
    const logId = Math.random().toString(36).substr(2, 9);
    await wixData.insert('auditlogs', {
      _id: logId,
      actionType: 'COMPLETION_PROPOSED',
      actorId: userId,
      targetResourceType: 'JobOrder',
      targetResourceId: jobOrderId,
      timestamp: new Date(),
      details: `Completion proposed by ${proposedByRole}`,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        completionAttemptId: attemptId,
        message: 'Completion proposed successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in /api/jobs/propose-completion:', error);
    return new Response(JSON.stringify({ message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
