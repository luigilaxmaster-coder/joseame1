# Facebook Login User Sync Fix

## Problem
Users logging in via Facebook (and other social login methods) were not appearing in the admin user verification page, even though the user backfill mechanism was implemented.

## Root Causes Identified

### 1. **Email Case Sensitivity**
- Wix stores emails in their original case (e.g., "User@Gmail.com")
- The comparison logic was case-sensitive, causing mismatches
- Facebook users often have different email casing than email-based logins

### 2. **Missing Display Name Extraction**
- Facebook users may not have `profile.nickname` populated
- The backfill was storing empty strings for nicknames
- No fallback logic to extract display names from contact info

### 3. **Incomplete User Sync Coverage**
- User sync was only called in specific pages (RoleSelectionPage, dashboards, profile)
- Users logging in via Facebook might not visit all these pages
- HomePage wasn't syncing users, missing early-login users

### 4. **Backfill Status Calculation**
- The backfill status was using simple count comparison
- Didn't account for email case differences
- Showed incorrect "backfill needed" counts

## Solutions Implemented

### 1. **Enhanced User Sync Service** (`user-sync-service.ts`)
```typescript
// Now handles:
- Lowercase email normalization
- Better error logging with login method info
- Smart display name extraction
- Proper email comparison
```

### 2. **Improved Backfill Service** (`user-backfill-service.ts`)
```typescript
// Added:
- getDisplayName() helper function
- Handles all login methods (email, Google, Facebook, etc.)
- Case-insensitive email comparison
- Better logging for debugging
```

### 3. **New User Sync Hook** (`user-sync-hook.ts`)
```typescript
// Provides:
- Centralized user sync logic
- Automatic sync on authentication
- Reusable across all pages
```

### 4. **Updated Components**
All key pages now use the `useSyncUser()` hook:
- **HomePage.tsx** - Syncs users on first visit
- **RoleSelectionPage.tsx** - Syncs during role selection
- **ClientDashboardPage.tsx** - Syncs on client dashboard
- **JoseadorDashboardPage.tsx** - Syncs on joseador dashboard
- **ProfilePage.tsx** - Syncs on profile view

### 5. **Backfill Status Logic** (`user-backfill-service.ts`)
```typescript
// Now:
- Compares emails case-insensitively
- Identifies exactly which users are missing
- Provides accurate backfill counts
- Logs missing user emails for debugging
```

## How It Works Now

### User Registration/Login Flow
1. User logs in via any method (email, Google, Facebook, etc.)
2. `MemberProvider` authenticates the user
3. User visits any page with `useSyncUser()` hook
4. User data is synced to `registeredusers` collection with:
   - Normalized lowercase email
   - Smart display name extraction
   - Login timestamp
   - Profile information

### Admin Backfill Process
1. Admin visits `/admin/users-verification`
2. System checks backfill status:
   - Fetches all Wix members from `Members/FullData`
   - Compares with `registeredusers` (case-insensitive)
   - Identifies missing users
3. Admin can click "Sincronizar Ahora" to backfill
4. All missing users are imported with proper data

## Key Improvements

| Aspect | Before | After |
|--------|--------|-------|
| Email Matching | Case-sensitive | Case-insensitive |
| Display Names | Empty for social logins | Smart extraction from profile/contact |
| Sync Coverage | Limited pages | All pages via hook |
| Backfill Accuracy | Simple count | Email-based comparison |
| Logging | Basic | Detailed with login methods |

## Testing Checklist

- [ ] Facebook user logs in and appears in admin verification page
- [ ] Google user logs in and appears in admin verification page
- [ ] Email user logs in and appears in admin verification page
- [ ] Backfill status shows correct count of missing users
- [ ] Running backfill imports all missing users
- [ ] User display names are properly extracted
- [ ] Email addresses are normalized (lowercase)
- [ ] Console logs show sync operations

## Files Modified

1. `/src/lib/user-sync-service.ts` - Enhanced sync logic
2. `/src/lib/user-backfill-service.ts` - Improved backfill with display name extraction
3. `/src/lib/user-sync-hook.ts` - New reusable hook (created)
4. `/src/components/pages/HomePage.tsx` - Added useSyncUser hook
5. `/src/components/pages/RoleSelectionPage.tsx` - Updated to use hook
6. `/src/components/pages/ClientDashboardPage.tsx` - Updated to use hook
7. `/src/components/pages/JoseadorDashboardPage.tsx` - Updated to use hook
8. `/src/components/pages/ProfilePage.tsx` - Updated to use hook

## Debugging

Check browser console for logs like:
```
✓ User created in registeredusers: user@facebook.com (John Doe)
✓ User updated in registeredusers: user@gmail.com (Jane Smith)
Backfill Status: {
  wixMembersCount: 15,
  registeredUsersCount: 12,
  backfillNeeded: 3,
  missingEmails: ['user1@facebook.com', 'user2@google.com']
}
```

## Future Improvements

1. Add webhook for real-time sync on user registration
2. Implement batch sync for better performance
3. Add user sync status dashboard
4. Implement retry logic for failed syncs
5. Add email verification status tracking
