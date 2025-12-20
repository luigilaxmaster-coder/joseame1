import type { APIRoute } from 'astro';
import { BaseCrudService } from '@/integrations';
import { JobOrders, JobEvents } from '@/entities';

/**
 * GET /api/jobs/timeline
 * Returns all events for a job in chronological order
 * Query params: jobOrderId
 */
export const GET: APIRoute = async ({ request }) => {
  try {
    const url = new URL(request.url);
    const jobOrderId = url.searchParams.get('jobOrderId');

    if (!jobOrderId) {
      return new Response(
        JSON.stringify({ ok: false, error: 'jobOrderId is required' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate user belongs to job
    const job = await BaseCrudService.getById<JobOrders>('joborders', jobOrderId);
    if (!job) {
      return new Response(
        JSON.stringify({ ok: false, error: 'Job not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Get all events for this job
    const { items: allEvents } = await BaseCrudService.getAll<JobEvents>('jobevents');
    const jobEvents = allEvents
      .filter(e => e.jobOrderId === jobOrderId)
      .sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateA - dateB;
      });

    return new Response(
      JSON.stringify({
        ok: true,
        events: jobEvents.map(e => ({
          _id: e._id,
          action: e.action,
          actorId: e.actorId,
          meta: e.meta ? JSON.parse(e.meta) : {},
          createdAt: e.createdAt,
        })),
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
