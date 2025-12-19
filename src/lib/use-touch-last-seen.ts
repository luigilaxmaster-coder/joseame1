import { useEffect } from 'react';
import { useMember } from '@/integrations';

/**
 * Hook to update lastSeen timestamp whenever a member is authenticated
 * Call this in any protected page to ensure real-time user activity tracking
 */
export function useTouchLastSeen() {
  const { member } = useMember();

  useEffect(() => {
    const memberId = (member as any)?._id;
    if (memberId) {
      // Call backend function to update lastSeen
      fetch('/api/userDirectory/touchLastSeen', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ memberId })
      }).catch(err => console.error('Error updating lastSeen:', err));
    }
  }, [(member as any)?._id]);
}
