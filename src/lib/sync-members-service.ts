import { BaseCrudService } from '@/integrations';
import { UserDirectory } from '@/entities';

/**
 * Service for syncing Wix members to UserDirectory collection
 * This handles the initial backfill and ongoing synchronization
 */

interface WixMember {
  _id: string;
  loginEmail?: string;
  contact?: {
    firstName?: string;
    lastName?: string;
  };
  profile?: {
    nickname?: string;
  };
  _createdDate?: Date | string;
  lastLoginDate?: Date | string;
  _owner?: string;
  _updatedDate?: Date | string;
}

export interface SyncResult {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ memberId: string; email?: string; error: string }>;
}

/**
 * Get full name from Wix member data
 */
function getFullName(member: WixMember): string {
  const firstName = member.contact?.firstName || '';
  const lastName = member.contact?.lastName || '';
  const nickname = member.profile?.nickname || '';
  
  if (firstName && lastName) {
    return `${firstName} ${lastName}`;
  }
  if (firstName) {
    return firstName;
  }
  if (nickname) {
    return nickname;
  }
  return member.loginEmail || 'Unknown User';
}

/**
 * Sync all Wix members to UserDirectory collection
 * This is the initial backfill operation
 */
export async function syncAllMembersToDirectory(): Promise<SyncResult> {
  const result: SyncResult = {
    success: true,
    message: '',
    created: 0,
    updated: 0,
    skipped: 0,
    errors: []
  };

  try {
    // Fetch all Wix members
    const { items: wixMembers } = await BaseCrudService.getAll<any>('Members/FullData').catch(err => {
      console.error('Error fetching Wix members:', err);
      return { items: [] };
    }) as { items: WixMember[] };

    if (!wixMembers || wixMembers.length === 0) {
      result.message = 'No Wix members found to sync';
      return result;
    }

    // Fetch existing directory entries
    const { items: existingMembers } = await BaseCrudService.getAll<UserDirectory>('userdirectory').catch(err => {
      console.error('Error fetching existing directory:', err);
      return { items: [] };
    });

    const existingMembersMap = new Map<string, UserDirectory>(
      existingMembers
        .filter(m => m.memberId)
        .map(m => [m.memberId!, m])
    );

    // Process each Wix member
    for (const wixMember of wixMembers) {
      try {
        if (!wixMember._id) {
          result.skipped++;
          continue;
        }

        const fullName = getFullName(wixMember);
        const email = wixMember.loginEmail || '';
        const createdDate = wixMember._createdDate || new Date().toISOString();
        const lastSeen = wixMember.lastLoginDate || createdDate;

        const existingMember = existingMembersMap.get(wixMember._id);

        if (existingMember) {
          // Update existing member
          await BaseCrudService.update('userdirectory', {
            _id: existingMember._id,
            memberId: wixMember._id,
            fullName,
            email,
            createdDate,
            lastSeen,
            verificationStatus: existingMember.verificationStatus || 'UNVERIFIED',
            isActive: existingMember.isActive !== false
          });
          result.updated++;
        } else {
          // Create new member
          const newMember: UserDirectory = {
            _id: crypto.randomUUID(),
            memberId: wixMember._id,
            fullName,
            email,
            createdDate,
            lastSeen,
            verificationStatus: 'UNVERIFIED',
            isActive: true
          };
          await BaseCrudService.create('userdirectory', newMember);
          result.created++;
        }
      } catch (error) {
        result.errors.push({
          memberId: wixMember._id,
          email: wixMember.loginEmail,
          error: error instanceof Error ? error.message : 'Unknown error'
        });
        result.success = false;
      }
    }

    result.message = `Sync completed: ${result.created} created, ${result.updated} updated, ${result.skipped} skipped`;
    return result;
  } catch (error) {
    result.success = false;
    result.message = error instanceof Error ? error.message : 'Unknown error during sync';
    return result;
  }
}

/**
 * Check if sync is needed (compare Wix members count with directory count)
 */
export async function isSyncNeeded(): Promise<boolean> {
  try {
    const { items: wixMembers } = await BaseCrudService.getAll<any>('Members/FullData').catch(() => ({ items: [] })) as { items: WixMember[] };
    const { items: directoryMembers } = await BaseCrudService.getAll<UserDirectory>('userdirectory').catch(() => ({ items: [] }));

    // If directory has significantly fewer members than Wix, sync is needed
    return directoryMembers.length < wixMembers.length * 0.8; // Allow 20% difference
  } catch (error) {
    console.error('Error checking if sync is needed:', error);
    return false;
  }
}

/**
 * Get sync status information
 */
export async function getSyncStatus(): Promise<{
  wixMembersCount: number;
  directoryMembersCount: number;
  syncNeeded: boolean;
  lastSyncTime?: Date;
}> {
  try {
    const { items: wixMembers } = await BaseCrudService.getAll<any>('Members/FullData').catch(() => ({ items: [] })) as { items: WixMember[] };
    const { items: directoryMembers } = await BaseCrudService.getAll<UserDirectory>('userdirectory').catch(() => ({ items: [] }));

    const syncNeeded = directoryMembers.length < wixMembers.length * 0.8;

    return {
      wixMembersCount: wixMembers.length,
      directoryMembersCount: directoryMembers.length,
      syncNeeded
    };
  } catch (error) {
    console.error('Error getting sync status:', error);
    return {
      wixMembersCount: 0,
      directoryMembersCount: 0,
      syncNeeded: false
    };
  }
}
