import type { APIRoute } from 'astro';
import wixData from 'wix-data';
import { getLoggedInMember } from 'wix-members-backend';

/**
 * GET /api/jobs/timeline
 * Get job timeline events
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const jobOrderId = url.searchParams.get('jobOrderId');
    if (!jobOrderId) {
      return new Response(JSON.stringify({ message: 'jobOrderId is required' }), {
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

    // Validate user belongs to job
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

    // Get all events
    const events = await wixData.query('jobevents')
      .eq('jobOrderId', jobOrderId)
      .ascending('createdAt')
      .find();

    return new Response(
      JSON.stringify({
        ok: true,
        events: events.items.map((e: any) => ({
          _id: e._id,
          action: e.action,
          actorId: e.actorId,
          meta: e.meta ? JSON.parse(e.meta) : {},
          createdAt: e.createdAt,
        })),
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error in /api/jobs/timeline:', error);
    return new Response(JSON.stringify({ message: String(error) }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
