// Lazy import backend functions to support dynamic module loading
let backendFunctions: any = null;

async function getBackendFunctions() {
  if (!backendFunctions) {
    const module = await import('@/backend/multi-tenant-profiles.jsw');
    backendFunctions = module;
  }
  return backendFunctions;
}

export interface UserProfile {
  _id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  bio: string;
  updatedAt: string;
}

/**
 * Initialize user profile on app load
 * Creates profile if it doesn't exist
 */
export async function initializeUserProfile(): Promise<UserProfile> {
  try {
    const { getOrCreateUserProfile } = await getBackendFunctions();
    return await getOrCreateUserProfile();
  } catch (error) {
    console.error('Failed to initialize user profile:', error);
    throw error;
  }
}

/**
 * Fetch current user's profile
 */
export async function fetchMyProfile(): Promise<UserProfile> {
  try {
    const { getMyProfile } = await getBackendFunctions();
    return await getMyProfile();
  } catch (error) {
    console.error('Failed to fetch profile:', error);
    throw error;
  }
}

/**
 * Update current user's profile
 */
export async function updateUserProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  try {
    const { updateMyProfile } = await getBackendFunctions();
    return await updateMyProfile(data);
  } catch (error) {
    console.error('Failed to update profile:', error);
    throw error;
  }
}

/**
 * Fetch another user's public profile
 */
export async function fetchPublicProfile(memberId: string): Promise<Partial<UserProfile>> {
  try {
    const { getPublicProfile } = await getBackendFunctions();
    return await getPublicProfile(memberId);
  } catch (error) {
    console.error('Failed to fetch public profile:', error);
    throw error;
  }
}
