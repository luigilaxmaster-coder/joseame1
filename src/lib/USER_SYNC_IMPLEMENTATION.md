# User Sync Implementation Guide

## Overview
This document describes the implementation of automatic user synchronization to the `registeredusers` collection. When users log into JOSEAME, they are automatically added to the `registeredusers` collection, making them visible in the Admin Users Verification page.

## Architecture

### 1. Core Service: `user-sync-service.ts`
**Location:** `/src/lib/user-sync-service.ts`

**Function:** `syncUserToRegisteredUsers(memberData: any)`

**Purpose:** Syncs a user from Wix Members to the custom `registeredusers` collection

**How it works:**
1. Receives member data from Wix authentication
2. Checks if user already exists in `registeredusers` collection by email
3. If user exists: Updates their `lastLoginDate` and other profile info
4. If user is new: Creates a new record with registration date and profile info
5. Handles errors gracefully (doesn't throw - background operation)

**Data Mapping:**
```
Wix Member Data → RegisteredUsers Collection
├── loginEmail → email
├── _id → userId
├── contact.firstName → firstName
├── contact.lastName → lastName
├── profile.nickname → nickname
├── profile.photo.url → photoUrl
└── (auto-generated) → registrationDate (on first sync)
└── (current time) → lastLoginDate (on every sync)
```

## Integration Points

### 1. RoleSelectionPage.tsx
**When:** User selects their role (Client or Joseador)
**What:** Syncs user data to `registeredusers` collection
**Code:**
```typescript
useEffect(() => {
  if (member) {
    syncUserToRegisteredUsers(member);
  }
}, [member]);
```

### 2. ProfilePage.tsx
**When:** User visits their profile
**What:** Syncs/updates user data
**Code:**
```typescript
useEffect(() => {
  if (member) {
    syncUserToRegisteredUsers(member);
  }
  loadProfileData();
}, [member?.loginEmail]);
```

### 3. ClientDashboardPage.tsx
**When:** Client user loads their dashboard
**What:** Syncs/updates user data
**Code:**
```typescript
useEffect(() => {
  setUserRole('client');
  if (member) {
    syncUserToRegisteredUsers(member);
  }
  loadJobs();
  loadApplications();
  // ... rest of setup
}, [member]);
```

### 4. JoseadorDashboardPage.tsx
**When:** Joseador user loads their dashboard
**What:** Syncs/updates user data
**Code:**
```typescript
useEffect(() => {
  setUserRole('joseador');
  if (member) {
    syncUserToRegisteredUsers(member);
  }
  loadJobs();
  loadPiqueteBalance();
  // ... rest of setup
}, [member?.loginEmail]);
```

## User Flow

```
User Logs In
    ↓
Wix Authentication
    ↓
RoleSelectionPage (First Sync)
    ↓
User Selects Role
    ↓
Dashboard (ClientDashboardPage or JoseadorDashboardPage)
    ↓
User data synced to registeredusers collection
    ↓
Admin can see user in "Verificación de Usuarios" page
```

## Admin Verification Page

**Location:** `/src/components/pages/AdminUsersVerificationPage.tsx`

**Features:**
- Displays all users from `registeredusers` collection
- Shows verification status (verified/unverified)
- Shows activity status (online/idle/offline)
- Shows piquete balance
- Allows admin to:
  - Verify/unverify users
  - Add/remove piquetes
  - Search and filter users
  - Monitor user activity

**Data Sources:**
1. `registeredusers` - User profile information
2. `userverification` - Verification status
3. `piquetebalances` - Piquete balance information

## Database Collections

### registeredusers
```typescript
{
  _id: string;
  userId: string;           // Wix member ID
  email: string;            // Unique identifier
  firstName: string;
  lastName: string;
  nickname: string;
  photoUrl: string;
  registrationDate: Date;   // Set on first sync
  lastLoginDate: Date;      // Updated on every sync
  role: string;             // 'member' by default
}
```

## Error Handling

The sync service includes robust error handling:
- Logs warnings if member data is incomplete
- Catches and logs errors without throwing
- Allows app to continue functioning even if sync fails
- Provides console feedback for debugging

## Testing the Implementation

### Step 1: Create a Test User
1. Go to `/login`
2. Click "Crear Cuenta Nueva" or "Iniciar Sesión"
3. Complete Wix authentication

### Step 2: Verify Sync
1. Check browser console for sync logs:
   - "User created in registeredusers: [email]"
   - "User updated in registeredusers: [email]"

### Step 3: Check Admin Page
1. Navigate to `/admin/users-verification`
2. Verify the new user appears in the list
3. Check that user details are correct:
   - Name/nickname
   - Email
   - Activity status (should be "En línea")
   - Registration date

### Step 4: Test Verification
1. Click "Verificar" button for the user
2. Verify status should change to "Verificado"
3. Check that verification record is created in `userverification` collection

## Performance Considerations

- Sync is asynchronous and non-blocking
- Errors don't interrupt user flow
- Multiple syncs for same user are idempotent (safe to repeat)
- Collection queries are optimized with email-based lookups
- Polling in admin page refreshes every 5 seconds

## Future Enhancements

1. **Batch Sync:** Sync multiple users at once
2. **Sync History:** Track sync events and timestamps
3. **Conflict Resolution:** Handle duplicate emails
4. **Data Validation:** Validate email format and required fields
5. **Webhook Integration:** Sync on Wix member events
6. **Caching:** Cache user data locally to reduce API calls

## Troubleshooting

### Users not appearing in admin page
1. Check browser console for sync errors
2. Verify `registeredusers` collection exists
3. Check user email is not empty
4. Verify user has logged in (not just registered)
5. Check collection permissions are set to "ANYONE"

### Sync errors in console
1. Check Wix member data structure
2. Verify BaseCrudService is properly imported
3. Check collection ID is correct: 'registeredusers'
4. Verify network connectivity

### Activity status always "offline"
1. Check `lastLoginDate` is being updated
2. Verify date comparison logic in admin page
3. Check browser time is correct

## Related Files

- `/src/lib/user-sync-service.ts` - Core sync service
- `/src/entities/index.ts` - RegisteredUsers type definition
- `/src/components/pages/AdminUsersVerificationPage.tsx` - Admin dashboard
- `/src/components/pages/RoleSelectionPage.tsx` - Role selection
- `/src/components/pages/ProfilePage.tsx` - User profile
- `/src/components/pages/ClientDashboardPage.tsx` - Client dashboard
- `/src/components/pages/JoseadorDashboardPage.tsx` - Joseador dashboard
