/**
 * Type declarations for wix-members-backend module
 */

declare module 'wix-members-backend' {
  export interface Member {
    _id: string;
    loginEmail?: string;
    status?: string;
    contactId?: string;
    privacyStatus?: string;
    activityStatus?: string;
    createdDate?: Date;
    updatedDate?: Date;
    lastLoginDate?: Date;
    profile?: {
      nickname?: string;
      slug?: string;
      profilePhoto?: {
        url?: string;
        height?: number;
        width?: number;
      };
      coverPhoto?: {
        url?: string;
        height?: number;
        width?: number;
      };
      title?: string;
    };
    [key: string]: any;
  }

  export function getLoggedInMember(): Promise<Member | null>;
  export function getMember(memberId: string): Promise<Member | null>;
}
