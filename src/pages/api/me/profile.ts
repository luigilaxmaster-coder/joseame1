import { BaseCrudService } from '@/integrations';
import { UserProfiles } from '@/entities';

/**
 * GET /api/me/profile - Get authenticated user's profile
 * PATCH /api/me/profile - Update authenticated user's profile
 */

export async function GET(request: Request) {
  try {
    // Get member ID from request (in Wix, this comes from auth context)
    const memberId = request.headers.get('x-member-id');

    if (!memberId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No member ID provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch user profile from database
    const { items: profiles } = await BaseCrudService.getAll<UserProfiles>('userprofiles');
    const userProfile = profiles.find(p => p.memberId === memberId);

    if (!userProfile) {
      // Auto-create profile if it doesn't exist
      const newProfileId = crypto.randomUUID();
      const newProfile: UserProfiles = {
        _id: newProfileId,
        memberId,
        firstName: '',
        lastName: '',
        bio: '',
        profilePhoto: '',
        updatedAt: new Date().toISOString(),
      };

      await BaseCrudService.create('userprofiles', newProfile);

      return new Response(JSON.stringify(newProfile), {
        status: 201,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify(userProfile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in GET /api/me/profile:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to fetch profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    const memberId = request.headers.get('x-member-id');

    if (!memberId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No member ID provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const body = await request.json();

    // Validate input
    if (!body || typeof body !== 'object') {
      return new Response(
        JSON.stringify({ error: 'Invalid request body' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Fetch existing profile
    const { items: profiles } = await BaseCrudService.getAll<UserProfiles>('userprofiles');
    const userProfile = profiles.find(p => p.memberId === memberId);

    if (!userProfile) {
      return new Response(
        JSON.stringify({ error: 'Profile not found' }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update profile with new data
    const updatedProfile: UserProfiles = {
      ...userProfile,
      firstName: body.firstName ?? userProfile.firstName,
      lastName: body.lastName ?? userProfile.lastName,
      bio: body.bio ?? userProfile.bio,
      profilePhoto: body.profilePhoto ?? userProfile.profilePhoto,
      updatedAt: new Date().toISOString(),
    };

    await BaseCrudService.update('userprofiles', {
      _id: userProfile._id,
      firstName: updatedProfile.firstName,
      lastName: updatedProfile.lastName,
      bio: updatedProfile.bio,
      profilePhoto: updatedProfile.profilePhoto,
      updatedAt: updatedProfile.updatedAt,
    });

    return new Response(JSON.stringify(updatedProfile), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in PATCH /api/me/profile:', error);
    return new Response(
      JSON.stringify({
        error: 'Failed to update profile',
        details: error instanceof Error ? error.message : 'Unknown error',
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
