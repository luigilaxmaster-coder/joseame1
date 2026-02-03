import { getOrCreateUserProfile, getMyProfile, updateMyProfile, getPublicProfile } from '@/backend/multi-tenant-profiles.jsw';

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
    return await getPublicProfile(memberId);
  } catch (error) {
    console.error('Failed to fetch public profile:', error);
    throw error;
  }
}
