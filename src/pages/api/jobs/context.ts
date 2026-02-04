import type { APIRoute } from 'astro';
import { getJobContext } from '@/backend/jobs.jsw';

/**
 * GET /api/jobs/context
 * Get job context by threadId
 * Delegates to backend function for wix-data access
 */
export const GET: APIRoute = async ({ url }) => {
  try {
    const threadId = url.searchParams.get('threadId');
    
    const result = await getJobContext(threadId);
    
    return new Response(JSON.stringify(result), {
      status: result.status || 500,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in /api/jobs/context:', error);
    return new Response(JSON.stringify({ ok: false, message: String(error), status: 500 }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};
