# Multi-Tenant Implementation Setup Guide - JOSEAME

## ✅ What Has Been Implemented

### 1. **CMS Collections Created/Updated**

#### ✓ UserProfiles Collection
- **ID**: `userprofiles`
- **Fields Added**:
  - `memberId` (string, REQUIRED, unique index) - Wix member ID
  - `firstName` (string) - User's first name
  - `lastName` (string) - User's last name
  - `profilePhoto` (image/url) - Profile picture
  - `bio` (string) - User biography
  - `updatedAt` (datetime) - Last update timestamp

#### ✓ Conversations Collection (NEW)
- **ID**: `conversations`
- **Fields**:
  - `participants` (string) - Comma-separated member IDs
  - `createdAt` (datetime) - Conversation creation time
  - `lastMessageAt` (datetime) - Timestamp of last message
  - `lastMessageText` (string) - Preview of last message
  - `createdBy` (string) - Member ID who initiated conversation
  - `title` (string) - Optional conversation title

#### ✓ Messages Collection (UPDATED)
- **ID**: `messages-1`
- **Fields Added**:
  - `conversationId` (string) - Reference to parent conversation
  - `receiverId` (string) - Member ID of receiver
  - `attachments` (string) - JSON-stringified array of file URLs
  - `isDeleted` (boolean) - Soft-delete flag

### 2. **Backend Web Modules Created**

#### ✓ `src/backend/multi-tenant-profiles.jsw`
Implements user profile management with full isolation:
- `getOrCreateUserProfile()` - Auto-create profile on first access
- `getMyProfile()` - Get current user's profile
- `updateMyProfile(data)` - Update profile (owner only)
- `getPublicProfile(memberId)` - Get another user's public profile

#### ✓ `src/backend/multi-tenant-messaging.jsw`
Implements secure messaging with participant validation:
- `createConversation(otherMemberId)` - Create 1:1 conversation
- `listMyConversations(limit, cursor)` - List user's conversations
- `sendMessage(conversationId, text, attachments)` - Send message
- `listMessages(conversationId, limit, cursor)` - Get messages
- `deleteMessage(messageId)` - Soft-delete message
- `getConversation(conversationId)` - Get conversation with validation

### 3. **Frontend Service Layer Created**

#### ✓ `src/lib/multi-tenant-profiles-service.ts`
TypeScript wrapper for profile operations:
- `initializeUserProfile()` - Call on app load
- `fetchMyProfile()` - Get current user's profile
- `updateUserProfile(data)` - Update profile
- `fetchPublicProfile(memberId)` - Get another user's public profile

#### ✓ `src/lib/multi-tenant-messaging-service.ts`
TypeScript wrapper for messaging operations:
- `startConversation(otherMemberId)` - Create/get conversation
- `getMyConversations(limit, cursor)` - List conversations
- `sendMessageToConversation(conversationId, text, attachments)` - Send message
- `getConversationMessages(conversationId, limit, cursor)` - Get messages
- `removeMessage(messageId)` - Delete message
- `fetchConversation(conversationId)` - Get conversation

### 4. **Frontend Pages Updated**

#### ✓ ProfilePage.tsx
- Added multi-tenant profile initialization on mount
- Integrated `initializeUserProfile()` to ensure user has profile
- Profile data now uses backend-validated user context

#### ✓ InboxPage.tsx (NEW)
- Complete messaging UI with conversation list and chat views
- Integrates all multi-tenant messaging functions
- Validates user participation before showing messages
- Supports message deletion (soft-delete)
- Real-time conversation loading with pagination

### 5. **Type Definitions Created**

#### ✓ `src/backend/multi-tenant-profiles.jsw.d.ts`
TypeScript definitions for profile backend module

#### ✓ `src/backend/multi-tenant-messaging.jsw.d.ts`
TypeScript definitions for messaging backend module

---

## 🔒 Security Features Implemented

### Authentication Validation
- ✅ Every backend function validates logged-in user via `currentMember.getMember()`
- ✅ Returns `NOT_AUTHENTICATED` error if user not logged in
- ✅ User identity obtained from backend (never trusts frontend)

### Data Isolation
- ✅ Users can only access their own profile
- ✅ Users can only see conversations they participate in
- ✅ Users can only read messages from their conversations
- ✅ Users can only delete their own messages

### Conversation Validation
- ✅ Participant list validated before message access
- ✅ Prevents self-conversations
- ✅ Validates user participation on every operation

### Soft-Delete Implementation
- ✅ Messages marked as deleted but not removed from DB
- ✅ Maintains audit trail
- ✅ Deleted messages excluded from `listMessages()`

---

## 📋 Next Steps to Complete Implementation

### 1. **Configure Collection Permissions** (CRITICAL)
Go to Wix Dashboard → Database → Collections and set:

**UserProfiles Collection**:
```
Read: Site member author (only own profile)
Create: Site member
Update: Site member author (only own)
Delete: Site member author (only own)
```

**Conversations Collection**:
```
Read: No public access (backend only)
Create: No public access (backend only)
Update: No public access (backend only)
Delete: No public access (backend only)
```

**Messages Collection**:
```
Read: No public access (backend only)
Create: No public access (backend only)
Update: No public access (backend only)
Delete: No public access (backend only)
```

### 2. **Create Database Indexes** (Performance)
In Wix Dashboard → Database → Collections, add indexes:

**UserProfiles**:
- `memberId` (UNIQUE)

**Conversations**:
- `participants` (REGULAR)
- `createdBy` (REGULAR)

**Messages**:
- `conversationId` (REGULAR)
- `senderId` (REGULAR)
- `isDeleted` (REGULAR)

### 3. **Test Multi-Tenant Isolation**
Run these test scenarios:

```typescript
// Test 1: User A cannot see User B's profile
const userBProfile = await fetchPublicProfile('userB_id');
// Should only return: memberId, firstName, lastName, profilePhoto, bio
// Should NOT return: updatedAt, _createdDate, _updatedDate

// Test 2: User A cannot see User B's conversations
const userAConversations = await getMyConversations();
// Should only include conversations where userA is a participant

// Test 3: User A cannot read messages from User B's conversation
try {
  await getConversationMessages('userB_conversation_id');
  // Should throw FORBIDDEN error
} catch (error) {
  console.assert(error.message.includes('FORBIDDEN'));
}

// Test 4: User A cannot delete User B's messages
try {
  await removeMessage('userB_message_id');
  // Should throw FORBIDDEN error
} catch (error) {
  console.assert(error.message.includes('FORBIDDEN'));
}
```

### 4. **Integrate with Existing Pages**
Update other pages to use multi-tenant services:

**ClientDashboardPage.tsx**:
```typescript
import { initializeUserProfile } from '@/lib/multi-tenant-profiles-service';

useEffect(() => {
  initializeUserProfile().catch(error => {
    console.error('Failed to initialize profile:', error);
  });
}, []);
```

**JoseadorDashboardPage.tsx**:
```typescript
import { initializeUserProfile, getMyConversations } from '@/lib/multi-tenant-profiles-service';

useEffect(() => {
  initializeUserProfile().catch(error => {
    console.error('Failed to initialize profile:', error);
  });
}, []);
```

### 5. **Add Navigation Links**
Update navigation to include Inbox:

```typescript
// In your navigation component
<Link to="/joseador/inbox">
  <MessageCircle size={20} />
  Mensajes
</Link>

<Link to="/client/inbox">
  <MessageCircle size={20} />
  Mensajes
</Link>
```

### 6. **Error Handling in Frontend**
Implement consistent error handling:

```typescript
import { getMyConversations } from '@/lib/multi-tenant-messaging-service';

try {
  const result = await getMyConversations();
} catch (error) {
  if (error.message === 'NOT_AUTHENTICATED') {
    // Redirect to login
    navigate('/login');
  } else if (error.message === 'FORBIDDEN') {
    // Show permission denied message
    showError('No tienes permiso para acceder a esto');
  } else if (error.message === 'NOT_FOUND') {
    // Show not found message
    showError('Recurso no encontrado');
  } else {
    // Show generic error
    showError('Error al cargar datos');
  }
}
```

---

## 🧪 Testing Checklist

- [ ] User can create profile on first login
- [ ] User can view and edit their own profile
- [ ] User cannot view other users' full profiles (only public fields)
- [ ] User can start a conversation with another user
- [ ] User can send messages in their conversations
- [ ] User cannot see conversations they're not part of
- [ ] User cannot read messages from other users' conversations
- [ ] User can delete their own messages
- [ ] User cannot delete other users' messages
- [ ] Deleted messages don't appear in message list
- [ ] Conversation list shows most recent messages first
- [ ] Pagination works for conversations and messages
- [ ] Unauthenticated users get appropriate errors
- [ ] Self-conversation creation is prevented
- [ ] Message timestamps are correct
- [ ] Profile photos display correctly

---

## 📚 API Reference

### Profile Service

```typescript
// Initialize profile (call on app load)
await initializeUserProfile();

// Get current user's profile
const profile = await fetchMyProfile();
// Returns: { _id, memberId, firstName, lastName, profilePhoto, bio, updatedAt }

// Update profile
const updated = await updateUserProfile({
  firstName: 'Juan',
  lastName: 'Pérez',
  bio: 'Profesional en...'
});

// Get another user's public profile
const publicProfile = await fetchPublicProfile('other_member_id');
// Returns: { _id, memberId, firstName, lastName, profilePhoto, bio }
```

### Messaging Service

```typescript
// Start conversation with another user
const conversation = await startConversation('other_member_id');
// Returns: { _id, participants, createdAt, lastMessageAt, lastMessageText, createdBy, title }

// Get all conversations for current user
const result = await getMyConversations(limit, cursor);
// Returns: { items: Conversation[], hasMore: boolean, nextCursor: string | null, totalCount: number }

// Send message
const message = await sendMessageToConversation(conversationId, 'Hello!', []);
// Returns: { _id, conversationId, senderId, receiverId, text, attachments, createdAt, isDeleted }

// Get messages in conversation
const result = await getConversationMessages(conversationId, limit, cursor);
// Returns: { items: Message[], hasMore: boolean, nextCursor: string | null, totalCount: number }

// Delete message (soft-delete)
await removeMessage(messageId);
// Returns: { success: true }

// Get specific conversation
const conversation = await fetchConversation(conversationId);
// Returns: { _id, participants, createdAt, lastMessageAt, lastMessageText, createdBy, title }
```

---

## 🚀 Deployment Checklist

- [ ] All backend modules deployed to Wix
- [ ] Collection permissions configured correctly
- [ ] Database indexes created
- [ ] Frontend pages updated and tested
- [ ] Error handling implemented
- [ ] Navigation links added
- [ ] Multi-tenant isolation verified
- [ ] Performance tested with pagination
- [ ] Security audit completed
- [ ] Documentation updated

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue**: `NOT_AUTHENTICATED` error on all operations
- **Solution**: Ensure user is logged in before calling backend functions

**Issue**: `FORBIDDEN` error when accessing conversation
- **Solution**: Verify user is a participant in the conversation

**Issue**: Messages not appearing
- **Solution**: Check that `isDeleted` is false in the database

**Issue**: Slow conversation loading
- **Solution**: Ensure database indexes are created on `participants` and `createdBy`

---

## 📖 Documentation Files

- `MULTI_TENANT_IMPLEMENTATION.md` - Complete architecture documentation
- `MULTI_TENANT_SETUP_GUIDE.md` - This file, setup and deployment guide
- Backend modules: `src/backend/multi-tenant-*.jsw`
- Frontend services: `src/lib/multi-tenant-*-service.ts`
- Updated pages: `src/components/pages/ProfilePage.tsx`, `InboxPage.tsx`
