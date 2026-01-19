import { BaseCrudService } from '@/integrations';
import { RegisteredUsers, UserDirectory, JoseadoresProfiles } from '@/entities';

/**
 * Syncs a user to the registeredusers collection when they log in or register
 * This ensures the admin verification page has access to all registered users
 * Works with all login methods: email, Google, Facebook, etc.
 * Also syncs to UserDirectory and JoseadoresProfiles if applicable
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
      role: existingUser?.role || 'member',
      verificationStatus: existingUser?.verificationStatus || 'Pendiente',
      badges: existingUser?.badges || ''
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

    // Sync to UserDirectory
    await syncToUserDirectory(memberData, userData);

    // Sync to JoseadoresProfiles if user is a Joseador
    if (userData.role === 'Joseador') {
      await syncToJoseadorProfile(memberData, userData);
    }
  } catch (error) {
    console.error('Error syncing user to registeredusers:', error);
    // Don't throw - this is a background sync operation
  }
}

/**
 * Syncs user data to UserDirectory collection
 */
async function syncToUserDirectory(memberData: any, userData: RegisteredUsers) {
  try {
    const { items: directoryItems } = await BaseCrudService.getAll<UserDirectory>('userdirectory').catch(() => ({ items: [] }));
    const existingDirectory = directoryItems?.find(u => u.email?.toLowerCase() === userData.email?.toLowerCase());

    const directoryData: UserDirectory = {
      _id: existingDirectory?._id || crypto.randomUUID(),
      memberId: memberData._id,
      email: userData.email,
      fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.nickname || 'Sin nombre',
      createdDate: existingDirectory?.createdDate || new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      verificationStatus: userData.verificationStatus,
      isActive: true
    };

    if (existingDirectory) {
      await BaseCrudService.update('userdirectory', directoryData);
      console.log('✓ User updated in userdirectory:', userData.email);
    } else {
      await BaseCrudService.create('userdirectory', directoryData);
      console.log('✓ User created in userdirectory:', userData.email);
    }
  } catch (error) {
    console.error('Error syncing to UserDirectory:', error);
  }
}

/**
 * Syncs user data to JoseadoresProfiles collection if user is a Joseador
 */
async function syncToJoseadorProfile(memberData: any, userData: RegisteredUsers) {
  try {
    const { items: joseadorItems } = await BaseCrudService.getAll<JoseadoresProfiles>('joseadores').catch(() => ({ items: [] }));
    const existingJoseador = joseadorItems?.find(j => j.email?.toLowerCase() === userData.email?.toLowerCase());

    if (existingJoseador) {
      // Update existing Joseador profile with latest data
      await BaseCrudService.update('joseadores', {
        _id: existingJoseador._id,
        userId: memberData._id,
        fullName: `${userData.firstName || ''} ${userData.lastName || ''}`.trim() || userData.nickname || 'Sin nombre',
        email: userData.email,
        verificationStatus: userData.verificationStatus,
        badges: userData.badges
      });
      console.log('✓ Joseador profile updated:', userData.email);
    }
    // Note: We don't auto-create Joseador profiles - they should be created during onboarding
  } catch (error) {
    console.error('Error syncing to JoseadoresProfiles:', error);
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
