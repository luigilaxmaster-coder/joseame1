import { BaseCrudService } from '@/integrations';
import { UserDirectory } from '@/entities';

/**
 * Service for managing the UserDirectory collection
 * This is the source of truth for all Wix members
 */

export interface DirectoryFilters {
  verificationStatus?: 'VERIFIED' | 'UNVERIFIED' | 'all';
  activityStatus?: 'online' | 'inactive' | 'offline' | 'all';
  search?: string;
}

export interface PaginationOptions {
  limit?: number;
  offset?: number;
}

/**
 * Get activity status based on lastSeen timestamp
 * Online: <= 5 minutes
 * Inactive: > 5 minutes and <= 30 days
 * Offline: > 30 days
 */
export function getActivityStatus(lastSeen?: Date | string): 'online' | 'inactive' | 'offline' {
  if (!lastSeen) return 'offline';
  
  const lastSeenDate = typeof lastSeen === 'string' ? new Date(lastSeen) : lastSeen;
  const now = new Date();
  const diffMinutes = (now.getTime() - lastSeenDate.getTime()) / (1000 * 60);
  
  if (diffMinutes <= 5) return 'online';
  if (diffMinutes <= 30 * 24 * 60) return 'inactive';
  return 'offline';
}

/**
 * Upsert a member to the UserDirectory
 * Creates if doesn't exist, updates if exists
 */
export async function upsertMemberToDirectory(
  memberId: string,
  fullName: string,
  email?: string,
  createdDate?: Date | string
): Promise<UserDirectory> {
  try {
    // Try to find existing member by memberId
    const { items } = await BaseCrudService.getAll<UserDirectory>('userdirectory');
    const existingMember = items.find(m => m.memberId === memberId);

    const now = new Date().toISOString();
    const memberData: UserDirectory = {
      _id: existingMember?._id || crypto.randomUUID(),
      memberId,
      fullName,
      email,
      createdDate: createdDate || now,
      lastSeen: now,
      verificationStatus: existingMember?.verificationStatus || 'UNVERIFIED',
      isActive: true
    };

    if (existingMember) {
      // Update existing member
      await BaseCrudService.update('userdirectory', memberData);
    } else {
      // Create new member
      await BaseCrudService.create('userdirectory', memberData);
    }

    return memberData;
  } catch (error) {
    console.error('Error upserting member to directory:', error);
    throw error;
  }
}

/**
 * Update the lastSeen timestamp for a member
 */
export async function touchLastSeen(memberId: string): Promise<void> {
  try {
    const { items } = await BaseCrudService.getAll<UserDirectory>('userdirectory');
    const member = items.find(m => m.memberId === memberId);

    if (member) {
      const now = new Date().toISOString();
      const activityStatus = getActivityStatus(now);
      
      await BaseCrudService.update('userdirectory', {
        _id: member._id,
        lastSeen: now,
        isActive: activityStatus === 'online' || activityStatus === 'inactive'
      });
    }
  } catch (error) {
    console.error('Error touching lastSeen:', error);
    // Don't throw - this is a non-critical operation
  }
}

/**
 * Get all directory users with filters and pagination
 */
export async function listDirectoryUsers(
  filters?: DirectoryFilters,
  pagination?: PaginationOptions
): Promise<{ items: UserDirectory[]; total: number }> {
  try {
    const { items } = await BaseCrudService.getAll<UserDirectory>('userdirectory');
    
    let filtered = [...items];

    // Apply verification status filter
    if (filters?.verificationStatus && filters.verificationStatus !== 'all') {
      filtered = filtered.filter(u => u.verificationStatus === filters.verificationStatus);
    }

    // Apply activity status filter
    if (filters?.activityStatus && filters.activityStatus !== 'all') {
      filtered = filtered.filter(u => {
        const status = getActivityStatus(u.lastSeen);
        return status === filters.activityStatus;
      });
    }

    // Apply search filter
    if (filters?.search) {
      const searchTerm = filters.search.toLowerCase();
      filtered = filtered.filter(u => {
        const fullName = u.fullName?.toLowerCase() || '';
        const email = u.email?.toLowerCase() || '';
        return fullName.includes(searchTerm) || email.includes(searchTerm);
      });
    }

    // Apply pagination
    const total = filtered.length;
    const limit = pagination?.limit || 50;
    const offset = pagination?.offset || 0;
    const paginated = filtered.slice(offset, offset + limit);

    return { items: paginated, total };
  } catch (error) {
    console.error('Error listing directory users:', error);
    throw error;
  }
}

/**
 * Get directory statistics
 */
export async function getDirectoryStats(): Promise<{
  total: number;
  verified: number;
  unverified: number;
  online: number;
  inactive: number;
  offline: number;
}> {
  try {
    const { items } = await BaseCrudService.getAll<UserDirectory>('userdirectory');

    const stats = {
      total: items.length,
      verified: items.filter(u => u.verificationStatus === 'VERIFIED').length,
      unverified: items.filter(u => u.verificationStatus === 'UNVERIFIED').length,
      online: items.filter(u => getActivityStatus(u.lastSeen) === 'online').length,
      inactive: items.filter(u => getActivityStatus(u.lastSeen) === 'inactive').length,
      offline: items.filter(u => getActivityStatus(u.lastSeen) === 'offline').length
    };

    return stats;
  } catch (error) {
    console.error('Error getting directory stats:', error);
    throw error;
  }
}

/**
 * Toggle verification status for a member
 */
export async function toggleVerificationStatus(memberId: string): Promise<UserDirectory> {
  try {
    const { items } = await BaseCrudService.getAll<UserDirectory>('userdirectory');
    const member = items.find(m => m.memberId === memberId);

    if (!member) {
      throw new Error(`Member ${memberId} not found in directory`);
    }

    const newStatus = member.verificationStatus === 'VERIFIED' ? 'UNVERIFIED' : 'VERIFIED';

    await BaseCrudService.update('userdirectory', {
      _id: member._id,
      verificationStatus: newStatus
    });

    return { ...member, verificationStatus: newStatus };
  } catch (error) {
    console.error('Error toggling verification status:', error);
    throw error;
  }
}

/**
 * Get a single member from directory
 */
export async function getDirectoryMember(memberId: string): Promise<UserDirectory | null> {
  try {
    const { items } = await BaseCrudService.getAll<UserDirectory>('userdirectory');
    return items.find(m => m.memberId === memberId) || null;
  } catch (error) {
    console.error('Error getting directory member:', error);
    return null;
  }
}

/**
 * Format last activity time for display
 */
export function formatLastActivity(date?: Date | string): string {
  if (!date) return 'N/A';
  
  const lastSeenDate = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - lastSeenDate.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return 'Hace unos segundos';
  if (diffMins < 60) return `Hace ${diffMins} min`;
  if (diffHours < 24) return `Hace ${diffHours}h`;
  if (diffDays < 7) return `Hace ${diffDays}d`;
  return lastSeenDate.toLocaleDateString('es-DO');
}
