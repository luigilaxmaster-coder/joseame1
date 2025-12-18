import { BaseCrudService } from '@/integrations';
import { RegisteredUsers } from '@/entities';

/**
 * Syncs a user to the registeredusers collection when they log in or register
 * This ensures the admin verification page has access to all registered users
 */
export async function syncUserToRegisteredUsers(memberData: any) {
  try {
    if (!memberData || !memberData.loginEmail) {
      console.warn('Cannot sync user: missing loginEmail');
      return;
    }

    const email = memberData.loginEmail;
    
    // Check if user already exists in registeredusers
    const { items } = await BaseCrudService.getAll<RegisteredUsers>('registeredusers');
    const existingUser = items?.find(u => u.email === email);

    const userData: RegisteredUsers = {
      _id: existingUser?._id || memberData._id || crypto.randomUUID(),
      userId: memberData._id,
      email: email,
      firstName: memberData.contact?.firstName || '',
      lastName: memberData.contact?.lastName || '',
      nickname: memberData.profile?.nickname || '',
      photoUrl: memberData.profile?.photo?.url || '',
      registrationDate: existingUser?.registrationDate || new Date().toISOString(),
      lastLoginDate: new Date().toISOString(),
      role: 'member'
    };

    if (existingUser) {
      // Update existing user
      await BaseCrudService.update('registeredusers', userData);
      console.log('User updated in registeredusers:', email);
    } else {
      // Create new user
      await BaseCrudService.create('registeredusers', userData);
      console.log('User created in registeredusers:', email);
    }
  } catch (error) {
    console.error('Error syncing user to registeredusers:', error);
    // Don't throw - this is a background sync operation
  }
}
