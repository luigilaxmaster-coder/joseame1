import { useEffect } from 'react';
import { useMember } from '@/integrations';
import { syncUserToRegisteredUsers } from './user-sync-service';

/**
 * Hook to automatically sync user to registeredusers collection
 * Should be used in any component that needs to ensure user is synced
 * Handles all login methods: email, Google, Facebook, etc.
 */
export function useSyncUser() {
  const { member, isAuthenticated } = useMember();

  useEffect(() => {
    if (isAuthenticated && member) {
      console.log('useSyncUser: Syncing authenticated user', {
        email: member.loginEmail,
        nickname: member.profile?.nickname
      });
      syncUserToRegisteredUsers(member);
    }
  }, [isAuthenticated, member]);
}
