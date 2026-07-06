import { useState, useEffect, useCallback } from 'react';
import { useMember } from '@/integrations';
import { UserProfiles } from '@/entities';
import { safeJsonFetch, safeJsonPatch, safeFormDataFetch } from '@/lib/safe-json-fetch';

/**
 * Custom hook for managing authenticated user's profile
 * Handles fetching, updating, and avatar uploads with real API integration
 */

interface ProfileUpdateData {
  firstName?: string;
  lastName?: string;
  bio?: string;
  profilePhoto?: string;
}

interface AvatarUploadResponse {
  success: boolean;
  url: string;
  profile: UserProfiles;
}

export function useMyProfile() {
  const { member } = useMember();
  const [profile, setProfile] = useState<UserProfiles | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isError, setIsError] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateError, setUpdateError] = useState<string | null>(null);

  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  // Fetch profile
  const fetchProfile = useCallback(async () => {
    if (!member?.loginEmail) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setIsError(false);
    setError(null);

    try {
      const response = await safeJsonFetch<UserProfiles>(
        '/api/me/profile',
        {
          headers: {
            'x-member-id': member.loginEmail,
          },
        }
      );

      if (!response.ok) {
        throw new Error(response.error || 'Failed to fetch profile');
      }

      setProfile(response.data || null);
    } catch (err) {
      setIsError(true);
      setError(err instanceof Error ? err.message : 'Unknown error');
      console.error('Error fetching profile:', err);
    } finally {
      setIsLoading(false);
    }
  }, [member?.loginEmail]);

  // Auto-fetch on mount and when member changes
  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  // Update profile
  const updateProfile = useCallback(
    async (data: ProfileUpdateData) => {
      if (!member?.loginEmail) {
        setUpdateError('No authenticated user');
        return null;
      }

      setIsUpdating(true);
      setUpdateError(null);

      try {
        const response = await safeJsonPatch<UserProfiles>(
          '/api/me/profile',
          data,
          {
            headers: {
              'x-member-id': member.loginEmail,
            },
          }
        );

        if (!response.ok) {
          throw new Error(response.error || 'Failed to update profile');
        }

        setProfile(response.data || null);
        return response.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setUpdateError(errorMsg);
        console.error('Error updating profile:', err);
        return null;
      } finally {
        setIsUpdating(false);
      }
    },
    [member?.loginEmail]
  );

  // Upload avatar
  const uploadAvatar = useCallback(
    async (file: File) => {
      if (!member?.loginEmail) {
        setUploadError('No authenticated user');
        return null;
      }

      setIsUploadingAvatar(true);
      setUploadError(null);

      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await safeFormDataFetch<AvatarUploadResponse>(
          '/api/me/avatar',
          formData,
          {
            headers: {
              'x-member-id': member.loginEmail,
            },
          }
        );

        if (!response.ok) {
          throw new Error(response.error || 'Failed to upload avatar');
        }

        setProfile(response.data?.profile || null);
        return response.data;
      } catch (err) {
        const errorMsg = err instanceof Error ? err.message : 'Unknown error';
        setUploadError(errorMsg);
        console.error('Error uploading avatar:', err);
        return null;
      } finally {
        setIsUploadingAvatar(false);
      }
    },
    [member?.loginEmail]
  );

  return {
    // Query state
    profile,
    isLoading,
    isError,
    error,

    // Mutations
    updateProfile,
    isUpdating,
    updateError,

    uploadAvatar,
    isUploadingAvatar,
    uploadError,

    // Refetch
    refetch: fetchProfile,
  };
}
