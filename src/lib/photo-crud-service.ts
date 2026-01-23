/**
 * Photo CRUD Service
 * Handles database operations for user profiles and photos
 */

import { BaseCrudService } from '@/integrations';
import { UserProfiles, UserPhotos } from '@/entities';

export class PhotoCrudService {
  /**
   * Get or create user profile
   * @param memberId - The member ID
   * @returns UserProfiles record
   */
  static async getUserProfile(memberId: string): Promise<UserProfiles | null> {
    try {
      const result = await BaseCrudService.getAll<UserProfiles>('userprofiles', [], {
        limit: 1,
      });

      // Find profile by memberId
      const profile = result.items.find((p) => p.memberId === memberId);
      return profile || null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }

  /**
   * Upsert user profile (update if exists, create if not)
   * @param memberId - The member ID
   * @param profilePhoto - URL of the profile photo
   * @returns Updated or created UserProfiles record
   */
  static async upsertUserProfile(
    memberId: string,
    profilePhoto: string
  ): Promise<UserProfiles> {
    try {
      const existingProfile = await this.getUserProfile(memberId);

      const now = new Date();

      if (existingProfile) {
        // Update existing profile
        const updated = await BaseCrudService.update<UserProfiles>('userprofiles', {
          _id: existingProfile._id,
          profilePhoto,
          updatedAt: now,
        });
        return updated;
      } else {
        // Create new profile
        const newProfile: UserProfiles = {
          _id: crypto.randomUUID(),
          memberId,
          profilePhoto,
          updatedAt: now,
        };
        await BaseCrudService.create('userprofiles', newProfile);
        return newProfile;
      }
    } catch (error) {
      console.error('Error upserting user profile:', error);
      throw error;
    }
  }

  /**
   * Create a new photo record in UserPhotos
   * @param memberId - The member ID
   * @param photoUrl - URL of the photo
   * @param type - Type of photo ('profile' or 'portfolio')
   * @param fileSize - Size of the file in bytes
   * @returns Created UserPhotos record
   */
  static async createPhotoRecord(
    memberId: string,
    photoUrl: string,
    type: 'profile' | 'portfolio',
    fileSize: number
  ): Promise<UserPhotos> {
    try {
      const newPhoto: UserPhotos = {
        _id: crypto.randomUUID(),
        memberId,
        photoUrl,
        type,
        createdAt: new Date(),
        fileSize,
      };
      await BaseCrudService.create('userphotos', newPhoto);
      return newPhoto;
    } catch (error) {
      console.error('Error creating photo record:', error);
      throw error;
    }
  }

  /**
   * Get all photos for a member
   * @param memberId - The member ID
   * @param type - Optional filter by type ('profile' or 'portfolio')
   * @returns Array of UserPhotos records
   */
  static async getMemberPhotos(
    memberId: string,
    type?: 'profile' | 'portfolio'
  ): Promise<UserPhotos[]> {
    try {
      const result = await BaseCrudService.getAll<UserPhotos>('userphotos', [], {
        limit: 100,
      });

      // Filter by memberId and optionally by type
      let photos = result.items.filter((p) => p.memberId === memberId);
      if (type) {
        photos = photos.filter((p) => p.type === type);
      }

      // Sort by createdAt descending (newest first)
      photos.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      });

      return photos;
    } catch (error) {
      console.error('Error fetching member photos:', error);
      return [];
    }
  }

  /**
   * Delete a photo record
   * @param photoId - The photo ID to delete
   */
  static async deletePhoto(photoId: string): Promise<void> {
    try {
      await BaseCrudService.delete('userphotos', photoId);
    } catch (error) {
      console.error('Error deleting photo:', error);
      throw error;
    }
  }
}
