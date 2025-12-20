/**
 * Type declarations for wix-data module
 */

declare module 'wix-data' {
  export interface QueryResult<T = any> {
    items: T[];
    totalCount: number;
    pageSize: number;
    currentPage: number;
    totalPages: number;
    hasNext: () => boolean;
    hasPrev: () => boolean;
    next: () => Promise<QueryResult<T>>;
    prev: () => Promise<QueryResult<T>>;
  }

  export interface WixDataQuery<T = any> {
    eq(propertyName: string, value: any): WixDataQuery<T>;
    ne(propertyName: string, value: any): WixDataQuery<T>;
    gt(propertyName: string, value: any): WixDataQuery<T>;
    lt(propertyName: string, value: any): WixDataQuery<T>;
    ge(propertyName: string, value: any): WixDataQuery<T>;
    le(propertyName: string, value: any): WixDataQuery<T>;
    contains(propertyName: string, value: any): WixDataQuery<T>;
    startsWith(propertyName: string, value: string): WixDataQuery<T>;
    endsWith(propertyName: string, value: string): WixDataQuery<T>;
    hasSome(propertyName: string, value: any[]): WixDataQuery<T>;
    hasAll(propertyName: string, value: any[]): WixDataQuery<T>;
    ascending(propertyName: string): WixDataQuery<T>;
    descending(propertyName: string): WixDataQuery<T>;
    limit(limit: number): WixDataQuery<T>;
    skip(skip: number): WixDataQuery<T>;
    find(): Promise<QueryResult<T>>;
    count(): Promise<number>;
  }

  export function query<T = any>(collectionId: string): WixDataQuery<T>;
  export function get<T = any>(collectionId: string, itemId: string): Promise<T>;
  export function insert<T = any>(collectionId: string, item: Partial<T>): Promise<T>;
  export function update<T = any>(collectionId: string, item: Partial<T> & { _id: string }): Promise<T>;
  export function save<T = any>(collectionId: string, item: Partial<T>): Promise<T>;
  export function remove(collectionId: string, itemId: string): Promise<void>;
  export function bulkInsert<T = any>(collectionId: string, items: Partial<T>[]): Promise<{ inserted: number; errors: any[] }>;
  export function bulkUpdate<T = any>(collectionId: string, items: (Partial<T> & { _id: string })[]): Promise<{ updated: number; errors: any[] }>;
  export function bulkRemove(collectionId: string, itemIds: string[]): Promise<{ removed: number; errors: any[] }>;
  export function bulkSave<T = any>(collectionId: string, items: Partial<T>[]): Promise<{ inserted: number; updated: number; errors: any[] }>;

  const wixData: {
    query: typeof query;
    get: typeof get;
    insert: typeof insert;
    update: typeof update;
    save: typeof save;
    remove: typeof remove;
    bulkInsert: typeof bulkInsert;
    bulkUpdate: typeof bulkUpdate;
    bulkRemove: typeof bulkRemove;
    bulkSave: typeof bulkSave;
  };

  export default wixData;
}

/**
 * Type declarations for wix-members-backend module
 */

declare module 'wix-members-backend' {
  export interface Member {
    _id: string;
    id?: string;
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
  }

  export function getLoggedInMember(): Promise<Member | null>;
  
  export const members: {
    getMember(memberId: string): Promise<Member | null>;
    queryMembers(): any;
  };

  export const currentMember: {
    getMember(): Promise<Member | null>;
  };
}
