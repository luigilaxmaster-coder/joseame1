import { BaseCrudService } from '@/integrations';
import { UserProfiles } from '@/entities';

/**
 * POST /api/me/avatar - Upload and update user avatar
 * Expects FormData with 'file' field
 */

export async function POST(request: Request) {
  try {
    const memberId = request.headers.get('x-member-id');

    if (!memberId) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized: No member ID provided' }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Parse FormData
    const formData = await request.formData();
    const file = formData.get('file') as File;

    if (!file) {
      return new Response(
        JSON.stringify({ error: 'No file provided' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      return new Response(
        JSON.stringify({ error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Validate file size (10MB max)
    const MAX_FILE_SIZE = 10 * 1024 * 1024;
    if (file.size > MAX_FILE_SIZE) {
      return new Response(
        JSON.stringify({ error: 'File size exceeds 10MB limit' }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // In a real implementation, you would upload to a storage service
    // For now, we'll create a data URL (not recommended for production)
    const buffer = await file.arrayBuffer();
    const base64 = Buffer.from(buffer).toString('base64');
    const dataUrl = `data:${file.type};base64,${base64}`;

    // Fetch existing profile
    const { items: profiles } = await BaseCrudService.getAll<UserProfiles>('userprofiles');
    let userProfile = profiles.find(p => p.memberId === memberId);

    if (!userProfile) {
      // Create profile if it doesn't exist
      const newProfileId = crypto.randomUUID();
      userProfile = {
        _id: newProfileId,
        memberId,
        firstName: '',
        lastName: '',
        bio: '',
        profilePhoto: dataUrl,
        updatedAt: new Date().toISOString(),
      };

      await BaseCrudService.create('userprofiles', userProfile);
    } else {
      // Update existing profile
      await BaseCrudService.update('userprofiles', {
        _id: userProfile._id,
        profilePhoto: dataUrl,
        updatedAt: new Date().toISOString(),
      });

      userProfile.profilePhoto = dataUrl;
      userProfile.updatedAt = new Date().toISOString();
    }

    const responseBody = JSON.stringify({
      success: true,
      url: dataUrl,
      profile: userProfile,
    });

    return new Response(responseBody, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(responseBody).toString(),
      },
    });
  } catch (error) {
    console.error('Error in POST /api/me/avatar:', error);
    const errorBody = JSON.stringify({
      error: 'Failed to upload avatar',
      details: error instanceof Error ? error.message : 'Unknown error',
    });

    return new Response(errorBody, {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(errorBody).toString(),
      },
    });
  }
}
