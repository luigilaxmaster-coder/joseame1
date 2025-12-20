import type { APIRoute } from 'astro';
import wixData from 'wix-data';
import { getLoggedInMember } from 'wix-members-backend';

/**
 * POST /api/jobs/reject
 * Reject a completion or general issue
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
    const {
      context,
      jobOrderId,
      completionAttemptId,
      reasonCode,
      description,
      outcome,
      attachments = [],
      blockUser = false,
    } = body;

    // Validate required fields
    if (!context || !['GENERAL', 'COMPLETION'].includes(context)) {
      return new Response(JSON.stringify({ message: 'context must be GENERAL or COMPLETION' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!jobOrderId) {
      return new Response(JSON.stringify({ message: 'jobOrderId is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!reasonCode) {
      return new Response(JSON.stringify({ message: 'reasonCode is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!description || description.trim().length < 20) {
      return new Response(JSON.stringify({ message: 'Description must be at least 20 characters' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Rate limit check: max 5 rejections in 5 minutes per user
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentRejections = await wixData.query('rejections')
      .eq('createdByUserId', userId)
      .gt('createdAt', fiveMinutesAgo)
      .find();

    if (recentRejections.items.length >= 5) {
      return new Response(
        JSON.stringify({ message: 'RATE_LIMIT: Too many rejections in a short time' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

    // Get rejection reason from catalog
    const reasons = await wixData.query('rejectreasons')
      .eq('reasonCode', reasonCode)
      .eq('context', context)
      .find();

    if (reasons.items.length === 0) {
      return new Response(
        JSON.stringify({
          message: `Rejection reason not found: ${reasonCode} in context ${context}`,
        }),
        {
          status: 404,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const reasonRecord = reasons.items[0];

    // GENERAL context validation
    if (context === 'GENERAL') {
      if (outcome && outcome !== 'NONE') {
        return new Response(JSON.stringify({ message: 'GENERAL rejections must have outcome=NONE' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // COMPLETION context validation
    if (context === 'COMPLETION') {
      if (!completionAttemptId) {
        return new Response(JSON.stringify({ message: 'completionAttemptId is required for COMPLETION context' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      if (!outcome || !['REWORK_REQUESTED', 'DISPUTE_OPEN', 'CANCEL_REQUESTED'].includes(outcome)) {
        return new Response(
          JSON.stringify({
            message: 'outcome must be one of: REWORK_REQUESTED, DISPUTE_OPEN, CANCEL_REQUESTED',
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Get and validate attempt
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
            message: `Cannot reject: attempt status is ${attempt.status}, expected active`,
          }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Validate user is NOT the proposer
      if (attempt.proposedByUserId === userId) {
        return new Response(JSON.stringify({ message: 'Cannot reject your own completion proposal' }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        });
      }
    }

    // Create Rejection record
    const rejectionId = Math.random().toString(36).substr(2, 9);
    const rejection = {
      _id: rejectionId,
      context,
      categorySnapshot: reasonRecord.category,
      reasonCode,
      reasonLabelSnapshot: reasonRecord.label,
      description: description.trim(),
      outcome: outcome || 'NONE',
      createdByUserId: userId,
      createdAt: new Date(),
    };
    await wixData.insert('rejections', rejection);

    // Save rejection attachments
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        const attId = Math.random().toString(36).substr(2, 9);
        await wixData.insert('rejectionattachments', {
          _id: attId,
          rejectionId,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileName: att.fileName || 'file',
          createdAt: new Date(),
        });
      }
    }

    // Handle COMPLETION context: update attempt and job status
    if (context === 'COMPLETION') {
      // Update attempt status
      await wixData.update('completionattempts', {
        _id: completionAttemptId,
        status: 'rejected',
      });

      // Update job status to outcome
      await wixData.update('joborders', {
        _id: jobOrderId,
        status: outcome,
        activeCompletionAttemptId: null,
        updatedAt: new Date(),
      });
    }

    // Create JobEvent
    const eventId = Math.random().toString(36).substr(2, 9);
    await wixData.insert('jobevents', {
      _id: eventId,
      jobOrderId,
      actorId: userId,
      action: 'COMPLETION_REJECTED',
      meta: JSON.stringify({
        rejectionId,
        context,
        outcome,
      }),
      createdAt: new Date(),
    });

    // Create audit log
    const logId = Math.random().toString(36).substr(2, 9);
    await wixData.insert('auditlogs', {
      _id: logId,
      actionType: 'REJECTION_CREATED',
      actorId: userId,
      targetResourceType: 'JobOrder',
      targetResourceId: jobOrderId,
      timestamp: new Date(),
      details: `${context} rejection: ${reasonCode}`,
    });

    return new Response(
      JSON.stringify({
        ok: true,
        rejectionId,
        message: 'Rejection recorded successfully',
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in /api/jobs/reject:', error);
    return new Response(JSON.stringify({ message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
