export interface UserProfile {
  _id: string;
  memberId: string;
  firstName: string;
  lastName: string;
  profilePhoto: string;
  bio: string;
  updatedAt: string;
}

export function getOrCreateUserProfile(): Promise<UserProfile>;
export function getMyProfile(): Promise<UserProfile>;
export function updateMyProfile(profileData: Partial<UserProfile>): Promise<UserProfile>;
export function getPublicProfile(targetMemberId: string): Promise<Partial<UserProfile>>;
