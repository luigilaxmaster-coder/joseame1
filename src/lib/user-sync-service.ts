import { BaseCrudService } from '@/integrations';
import { RegisteredUsers } from '@/entities';

/**
 * Syncs a user to the registeredusers collection when they log in or register
 * This ensures the admin verification page has access to all registered users
 * Works with all login methods: email, Google, Facebook, etc.
 */
export async function syncUserToRegisteredUsers(memberData: any) {
  try {
    if (!memberData || !memberData.loginEmail) {
      console.warn('Cannot sync user: missing loginEmail', memberData);
      return;
    }

    const email = memberData.loginEmail.toLowerCase();
    
    console.log('Syncing user to registeredusers:', {
      email,
      loginMethod: memberData.loginMethod || 'unknown',
      hasContact: !!memberData.contact,
      hasProfile: !!memberData.profile,
      memberId: memberData._id
    });

    // Check if user already exists in registeredusers by email
    const { items } = await BaseCrudService.getAll<RegisteredUsers>('registeredusers').catch(() => ({ items: [] }));
    const existingUser = items?.find(u => u.email?.toLowerCase() === email);

    const userData: RegisteredUsers = {
      _id: existingUser?._id || crypto.randomUUID(),
      userId: memberData._id,
      email: email,
      firstName: memberData.contact?.firstName || '',
      lastName: memberData.contact?.lastName || '',
      nickname: memberData.profile?.nickname || memberData.contact?.firstName || '',
      photoUrl: memberData.profile?.photo?.url || '',
      registrationDate: existingUser?.registrationDate || new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      role: 'member'
    };

    if (existingUser) {
      // Update existing user - preserve registration date, update last login
      await BaseCrudService.update('registeredusers', userData);
      console.log('✓ User updated in registeredusers:', email);
    } else {
      // Create new user
      await BaseCrudService.create('registeredusers', userData);
      console.log('✓ User created in registeredusers:', email);
    }
  } catch (error) {
    console.error('Error syncing user to registeredusers:', error);
    // Don't throw - this is a background sync operation
  }
}

/**
 * Sync user immediately after login/registration
 * This is called from the MemberProvider to ensure all users are synced
 */
export async function syncUserImmediately(memberData: any): Promise<boolean> {
  try {
    await syncUserToRegisteredUsers(memberData);
    return true;
  } catch (error) {
    console.error('Failed to sync user immediately:', error);
    return false;
  }
}
