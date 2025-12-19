import { BaseCrudService } from '@/integrations';
import { RegisteredUsers } from '@/entities';

/**
 * Backfill service to sync all historical Wix members to the registeredusers collection
 * This ensures all users appear in the admin verification page, not just those who logged in after sync was activated
 */

interface WixMember {
  _id: string;
  _createdDate?: Date;
  _updatedDate?: Date;
  loginEmail?: string;
  loginEmailVerified?: boolean;
  status?: string;
  contact?: {
    firstName?: string;
    lastName?: string;
    phones?: string[];
  };
  profile?: {
    nickname?: string;
    photo?: {
      url?: string;
      height?: number;
      width?: number;
      offsetX?: number;
      offsetY?: number;
    };
    title?: string;
  };
  lastLoginDate?: Date | string;
}

export interface BackfillResult {
  success: boolean;
  totalProcessed: number;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ email: string; error: string }>;
  message: string;
}

/**
 * Helper function to extract display name from Wix member
 * Handles various login methods (email, Google, Facebook, etc.)
 */
function getDisplayName(wixMember: WixMember): string {
  // Try profile nickname first
  if (wixMember.profile?.nickname) {
    return wixMember.profile.nickname;
  }
  
  // Try contact first name
  if (wixMember.contact?.firstName) {
    const lastName = wixMember.contact?.lastName ? ` ${wixMember.contact.lastName}` : '';
    return `${wixMember.contact.firstName}${lastName}`;
  }
  
  // Fall back to email (remove domain for cleaner display)
  if (wixMember.loginEmail) {
    return wixMember.loginEmail.split('@')[0];
  }
  
  return 'User';
}

/**
 * Backfill all Wix members from Members/FullData to registeredusers collection
 * Handles all login methods: email, Google, Facebook, etc.
 */
export async function backfillAllUsers(): Promise<BackfillResult> {
  const result: BackfillResult = {
    success: false,
    totalProcessed: 0,
    created: 0,
    updated: 0,
    skipped: 0,
    errors: [],
    message: 'Starting backfill...',
  };

  try {
    console.log('Starting user backfill from Members/FullData...');

    // Fetch all Wix members from the built-in Members/FullData collection
    const { items: wixMembers } = await BaseCrudService.getAll<WixMember>('Members/FullData').catch(err => {
      console.error('Error fetching Members/FullData:', err);
      throw new Error(`Failed to fetch Wix members: ${err.message}`);
    });

    if (!wixMembers || wixMembers.length === 0) {
      result.message = 'No Wix members found to backfill';
      result.success = true;
      return result;
    }

    console.log(`Found ${wixMembers.length} Wix members to process`);

    // Fetch existing registered users to avoid duplicates
    const { items: existingUsers } = await BaseCrudService.getAll<RegisteredUsers>('registeredusers').catch(err => {
      console.error('Error fetching existing registeredusers:', err);
      return { items: [] };
    });

    const existingEmailsMap = new Map(
      (existingUsers || []).map(user => [user.email?.toLowerCase(), user._id])
    );

    console.log(`Found ${existingEmailsMap.size} existing registered users`);

    // Process each Wix member
    for (const wixMember of wixMembers) {
      result.totalProcessed++;

      try {
        // Skip members without email
        if (!wixMember.loginEmail) {
          result.skipped++;
          console.warn(`Skipping member ${wixMember._id} - no email`);
          continue;
        }

        const email = wixMember.loginEmail.toLowerCase();
        const existingUserId = existingEmailsMap.get(email);
        const displayName = getDisplayName(wixMember);

        const userData: RegisteredUsers = {
          _id: existingUserId || crypto.randomUUID(),
          userId: wixMember._id,
          email: email, // Store lowercase for consistency
          firstName: wixMember.contact?.firstName || '',
          lastName: wixMember.contact?.lastName || '',
          nickname: displayName, // Use smart display name extraction
          photoUrl: wixMember.profile?.photo?.url || '',
          registrationDate: wixMember._createdDate || new Date().toISOString(),
          lastLoginDate: wixMember.lastLoginDate || wixMember._updatedDate || new Date().toISOString(),
          role: 'member',
        };

        if (existingUserId) {
          // Update existing user
          await BaseCrudService.update('registeredusers', userData);
          result.updated++;
          console.log(`✓ Updated user: ${email} (${displayName})`);
        } else {
          // Create new user
          await BaseCrudService.create('registeredusers', userData);
          result.created++;
          existingEmailsMap.set(email, userData._id);
          console.log(`✓ Created user: ${email} (${displayName})`);
        }
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : String(error);
        result.errors.push({
          email: wixMember.loginEmail || 'unknown',
          error: errorMessage,
        });
        console.error(`Error processing member ${wixMember.loginEmail}:`, error);
      }
    }

    result.success = true;
    result.message = `Backfill completed! Created: ${result.created}, Updated: ${result.updated}, Skipped: ${result.skipped}, Errors: ${result.errors.length}`;

    console.log('Backfill completed:', result);
    return result;
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    result.success = false;
    result.message = `Backfill failed: ${errorMessage}`;
    console.error('Backfill error:', error);
    return result;
  }
}

/**
 * Get backfill status - shows how many users are in each collection
 * Compares Wix members with registered users to identify missing users
 */
export async function getBackfillStatus() {
  try {
    const [wixMembersData, registeredUsersData] = await Promise.all([
      BaseCrudService.getAll<WixMember>('Members/FullData').catch(() => ({ items: [] })),
      BaseCrudService.getAll<RegisteredUsers>('registeredusers').catch(() => ({ items: [] })),
    ]);

    const wixMembers = (wixMembersData.items || []).filter(m => m.loginEmail);
    const registeredUsers = (registeredUsersData.items || []);

    // Create a map of registered user emails for comparison
    const registeredEmailsMap = new Map(
      registeredUsers.map(u => [u.email?.toLowerCase(), true])
    );

    // Count how many Wix members are NOT in registeredusers
    const missingUsers = wixMembers.filter(
      m => !registeredEmailsMap.has(m.loginEmail?.toLowerCase())
    );

    const wixMembersCount = wixMembers.length;
    const registeredUsersCount = registeredUsers.length;
    const backfillNeeded = missingUsers.length;

    console.log('Backfill Status:', {
      wixMembersCount,
      registeredUsersCount,
      backfillNeeded,
      missingEmails: missingUsers.slice(0, 3).map(m => m.loginEmail)
    });

    return {
      wixMembersCount,
      registeredUsersCount,
      backfillNeeded,
      isBackfillNeeded: backfillNeeded > 0,
    };
  } catch (error) {
    console.error('Error getting backfill status:', error);
    return {
      wixMembersCount: 0,
      registeredUsersCount: 0,
      backfillNeeded: 0,
      isBackfillNeeded: false,
    };
  }
}
