/**
 * Frontend service for syncing members with the backend
 * Calls backend functions via HTTP endpoints
 */

export interface SyncResult {
  success: boolean;
  message: string;
  created: number;
  updated: number;
  skipped: number;
  errors: Array<{ memberId?: string; email?: string; error: string }>;
}

export interface SyncStatus {
  wixMembersCount: number;
  directoryMembersCount: number;
  syncNeeded: boolean;
}

/**
 * Sync all Wix members to UserDirectory collection
 */
export async function syncAllMembersToDirectory(): Promise<SyncResult> {
  try {
    const response = await fetch('/api/userDirectory/syncAllMembers', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Sync failed: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      message: `Successfully synced ${data.synced} members`,
      created: data.created || 0,
      updated: data.updated || 0,
      skipped: 0,
      errors: []
    };
  } catch (error) {
    console.error('Error syncing members:', error);
    return {
      success: false,
      message: error instanceof Error ? error.message : 'Unknown error',
      created: 0,
      updated: 0,
      skipped: 0,
      errors: [{ error: error instanceof Error ? error.message : 'Unknown error' }]
    };
  }
}

/**
 * Get sync status between Wix members and UserDirectory
 */
export async function getSyncStatus(): Promise<SyncStatus> {
  try {
    const response = await fetch('/api/userDirectory/syncStatus', {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    });

    if (!response.ok) {
      throw new Error(`Failed to get sync status: ${response.statusText}`);
    }

    const data = await response.json();
    return {
      wixMembersCount: data.wixMembersCount || 0,
      directoryMembersCount: data.directoryMembersCount || 0,
      syncNeeded: (data.wixMembersCount || 0) > (data.directoryMembersCount || 0)
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
