import type { APIRoute } from 'astro';
import { BaseCrudService } from '@/integrations';
import { JobOrders, CompletionAttempts, Rejections, RejectionAttachments, RejectionReasons, JobEvents, SystemAuditLogs } from '@/entities';

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

    // TODO: Get userId from authenticated session
    // For now, using placeholder - should be replaced with actual auth
    const userId = 'user-placeholder';

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
    const { items: recentRejections } = await BaseCrudService.getAll<Rejections>('rejections');
    const userRecentRejections = recentRejections.filter(
      r => r.createdByUserId === userId && 
           r.createdAt && 
           new Date(r.createdAt) > fiveMinutesAgo
    );

    if (userRecentRejections.length >= 5) {
      return new Response(
        JSON.stringify({ message: 'RATE_LIMIT: Too many rejections in a short time' }),
        {
          status: 429,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Get and validate job
    const job = await BaseCrudService.getById<JobOrders>('joborders', jobOrderId);
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
    const { items: reasons } = await BaseCrudService.getAll<RejectionReasons>('rejectreasons');
    const reasonRecord = reasons.find(
      r => r.reasonCode === reasonCode && r.context === context
    );

    if (!reasonRecord) {
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
      const attempt = await BaseCrudService.getById<CompletionAttempts>(
        'completionattempts',
        completionAttemptId
      );
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
    const rejectionId = crypto.randomUUID();
    const rejection: Rejections = {
      _id: rejectionId,
      context,
      categorySnapshot: reasonRecord.category,
      reasonCode,
      reasonLabelSnapshot: reasonRecord.label,
      description: description.trim(),
      outcome: outcome || 'NONE',
      createdByUserId: userId,
      createdAt: new Date().toISOString(),
    };
    await BaseCrudService.create('rejections', rejection);

    // Save rejection attachments
    if (attachments && attachments.length > 0) {
      for (const att of attachments) {
        const attId = crypto.randomUUID();
        const attachment: RejectionAttachments = {
          _id: attId,
          rejectionId,
          fileUrl: att.fileUrl,
          fileType: att.fileType,
          fileName: att.fileName || 'file',
          createdAt: new Date().toISOString(),
        };
        await BaseCrudService.create('rejectionattachments', attachment);
      }
    }

    // Handle COMPLETION context: update attempt and job status
    if (context === 'COMPLETION') {
      // Update attempt status
      await BaseCrudService.update('completionattempts', {
        _id: completionAttemptId,
        status: 'rejected',
      });

      // Update job status to outcome
      await BaseCrudService.update('joborders', {
        _id: jobOrderId,
        status: outcome,
        activeCompletionAttemptId: null,
        updatedAt: new Date().toISOString(),
      });
    }

    // Create JobEvent
    const eventId = crypto.randomUUID();
    const event: JobEvents = {
      _id: eventId,
      jobOrderId,
      actorId: userId,
      action: 'COMPLETION_REJECTED',
      meta: JSON.stringify({
        rejectionId,
        context,
        outcome,
      }),
      createdAt: new Date().toISOString(),
    };
    await BaseCrudService.create('jobevents', event);

    // Create audit log
    const logId = crypto.randomUUID();
    const log: SystemAuditLogs = {
      _id: logId,
      actionType: 'REJECTION_CREATED',
      actorId: userId,
      targetResourceType: 'JobOrder',
      targetResourceId: jobOrderId,
      timestamp: new Date().toISOString(),
      details: `${context} rejection: ${reasonCode}`,
    };
    await BaseCrudService.create('auditlogs', log);

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
