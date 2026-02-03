# Multi-Tenant User Isolation Implementation - JOSEAME

## Overview
This document describes the complete multi-tenant isolation system for JOSEAME, ensuring each user can only access their own profile and private messages.

## Architecture

### 1. Data Collections

#### UserProfiles Collection
- **ID**: `userprofiles`
- **Purpose**: Store user profile information with multi-tenant isolation
- **Key Fields**:
  - `memberId` (string, REQUIRED, unique index) - Wix member ID
  - `firstName` (string) - User's first name
  - `lastName` (string) - User's last name
  - `profilePhoto` (image/url) - Profile picture
  - `bio` (string) - User biography
  - `updatedAt` (datetime) - Last update timestamp

#### Conversations Collection
- **ID**: `conversations`
- **Purpose**: Store 1:1 conversation threads between users
- **Key Fields**:
  - `participants` (string) - Comma-separated member IDs (e.g., "memberId1,memberId2")
  - `createdAt` (datetime) - Conversation creation time
  - `lastMessageAt` (datetime) - Timestamp of last message
  - `lastMessageText` (string) - Preview of last message
  - `createdBy` (string) - Member ID who initiated conversation
  - `title` (string) - Optional conversation title

#### Messages Collection
- **ID**: `messages-1`
- **Purpose**: Store individual messages within conversations
- **Key Fields**:
  - `conversationId` (string) - Reference to parent conversation
  - `senderId` (string) - Member ID of sender
  - `receiverId` (string) - Member ID of receiver (for 1:1 chats)
  - `text` (string) - Message content
  - `attachments` (string) - JSON-stringified array of file URLs
  - `createdAt` (datetime) - Message creation time
  - `isDeleted` (boolean) - Soft-delete flag

### 2. Security Model

#### Collection Permissions
**CRITICAL**: All permissions are configured to enforce backend-only access:

- **UserProfiles**:
  - Read: Backend only (via `getMyProfile`, `getPublicProfile`)
  - Create: Backend only (via `getOrCreateUserProfile`)
  - Update: Backend only (via `updateMyProfile`)
  - Delete: Backend only

- **Conversations**:
  - Read: Backend only (via `listMyConversations`, `getConversation`)
  - Create: Backend only (via `createConversation`)
  - Update: Backend only (via `sendMessage` which updates lastMessage*)
  - Delete: Backend only

- **Messages**:
  - Read: Backend only (via `listMessages`)
  - Create: Backend only (via `sendMessage`)
  - Update: Backend only (via `deleteMessage` for soft-delete)
  - Delete: Backend only

#### Validation Rules
Every backend function validates:
1. **Authentication**: User must be logged in (via `currentMember.getMember()`)
2. **Ownership**: User can only access their own data
3. **Participation**: User must be a participant in the conversation to read/write messages
4. **Authorization**: Specific operations (e.g., delete) only allowed by the owner

### 3. Backend Web Modules

#### File: `src/backend/multi-tenant-profiles.jsw`

**Function: `getOrCreateUserProfile()`**
- Creates a profile for the current user if it doesn't exist
- Returns existing profile if already created
- Called on app initialization
- Error: `NOT_AUTHENTICATED` if user not logged in

**Function: `getMyProfile()`**
- Returns the current user's profile
- Only accessible to the profile owner
- Error: `NOT_AUTHENTICATED`, `NOT_FOUND`

**Function: `updateMyProfile(profileData)`**
- Updates current user's profile fields
- Validates ownership before updating
- Allowed fields: `firstName`, `lastName`, `bio`, `profilePhoto`
- Error: `NOT_AUTHENTICATED`, `NOT_FOUND`

**Function: `getPublicProfile(targetMemberId)`**
- Returns another user's public profile (read-only)
- Only returns non-sensitive fields
- Requires authentication
- Error: `NOT_AUTHENTICATED`, `NOT_FOUND`

#### File: `src/backend/multi-tenant-messaging.jsw`

**Function: `createConversation(otherMemberId)`**
- Creates a 1:1 conversation or returns existing one
- Prevents self-conversations
- Validates both users exist
- Error: `NOT_AUTHENTICATED`, `INVALID_OPERATION`

**Function: `listMyConversations(limit, cursor)`**
- Returns all conversations where user is a participant
- Supports pagination with cursor
- Sorted by most recent message
- Returns: `{ items, hasMore, nextCursor, totalCount }`

**Function: `sendMessage(conversationId, text, attachments)`**
- Sends a message in a conversation
- Validates user is a participant
- Updates conversation's lastMessage* fields
- Error: `NOT_AUTHENTICATED`, `NOT_FOUND`, `FORBIDDEN`

**Function: `listMessages(conversationId, limit, cursor)`**
- Returns all non-deleted messages in a conversation
- Validates user is a participant
- Supports pagination with cursor
- Sorted by creation time (oldest first)
- Returns: `{ items, hasMore, nextCursor, totalCount }`

**Function: `deleteMessage(messageId)`**
- Soft-deletes a message (only sender can delete)
- Sets `isDeleted` flag to true
- Message still exists in DB but won't be returned by `listMessages`
- Error: `NOT_AUTHENTICATED`, `NOT_FOUND`, `FORBIDDEN`

**Function: `getConversation(conversationId)`**
- Returns a specific conversation with validation
- Validates user is a participant
- Error: `NOT_AUTHENTICATED`, `NOT_FOUND`, `FORBIDDEN`

### 4. Frontend Service Layer

#### File: `src/lib/multi-tenant-profiles-service.ts`
Wrapper functions for profile operations:
- `initializeUserProfile()` - Call on app load
- `fetchMyProfile()` - Get current user's profile
- `updateUserProfile(data)` - Update profile
- `fetchPublicProfile(memberId)` - Get another user's public profile

#### File: `src/lib/multi-tenant-messaging-service.ts`
Wrapper functions for messaging operations:
- `startConversation(otherMemberId)` - Create/get conversation
- `getMyConversations(limit, cursor)` - List user's conversations
- `sendMessageToConversation(conversationId, text, attachments)` - Send message
- `getConversationMessages(conversationId, limit, cursor)` - Get messages
- `removeMessage(messageId)` - Delete message
- `fetchConversation(conversationId)` - Get specific conversation

### 5. Frontend Integration

#### App Initialization
```typescript
import { initializeUserProfile } from '@/lib/multi-tenant-profiles-service';

// In your app's main component or Router
useEffect(() => {
  initializeUserProfile().catch(error => {
    if (error.message === 'NOT_AUTHENTICATED') {
      // Redirect to login
    }
  });
}, []);
```

#### Profile Page Example
```typescript
import { fetchMyProfile, updateUserProfile } from '@/lib/multi-tenant-profiles-service';

function ProfilePage() {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyProfile()
      .then(setProfile)
      .catch(error => console.error('Failed to load profile:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleUpdateProfile = async (data) => {
    try {
      const updated = await updateUserProfile(data);
      setProfile(updated);
    } catch (error) {
      console.error('Failed to update profile:', error);
    }
  };

  return (
    // Render profile with update form
  );
}
```

#### Inbox/Conversations Page Example
```typescript
import { getMyConversations, startConversation } from '@/lib/multi-tenant-messaging-service';

function InboxPage() {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyConversations(50)
      .then(result => setConversations(result.items))
      .catch(error => console.error('Failed to load conversations:', error))
      .finally(() => setLoading(false));
  }, []);

  const handleStartConversation = async (otherMemberId) => {
    try {
      const conversation = await startConversation(otherMemberId);
      // Navigate to chat page with conversationId
    } catch (error) {
      console.error('Failed to start conversation:', error);
    }
  };

  return (
    // Render conversations list
  );
}
```

#### Chat Page Example
```typescript
import { 
  getConversationMessages, 
  sendMessageToConversation 
} from '@/lib/multi-tenant-messaging-service';

function ChatPage({ conversationId }) {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getConversationMessages(conversationId, 50)
      .then(result => setMessages(result.items))
      .catch(error => console.error('Failed to load messages:', error))
      .finally(() => setLoading(false));
  }, [conversationId]);

  const handleSendMessage = async (text) => {
    try {
      const newMessage = await sendMessageToConversation(conversationId, text);
      setMessages([...messages, newMessage]);
    } catch (error) {
      console.error('Failed to send message:', error);
    }
  };

  return (
    // Render messages and input form
  );
}
```

### 6. Error Handling

All backend functions throw errors with specific codes:

| Error Code | Meaning | Action |
|-----------|---------|--------|
| `NOT_AUTHENTICATED` | User not logged in | Redirect to login |
| `NOT_FOUND` | Resource doesn't exist | Show 404 or empty state |
| `FORBIDDEN` | User lacks permission | Show error message |
| `INVALID_OPERATION` | Operation not allowed | Show error message |

### 7. Security Best Practices

✅ **Implemented**:
- All data access validated on backend
- User identity obtained from `currentMember.getMember()` (not frontend)
- Conversation participants verified before message access
- Soft-delete for messages (audit trail)
- Unique index on `memberId` in UserProfiles
- Pagination to prevent data dumps

❌ **Never**:
- Trust `memberId` from frontend
- Allow direct collection access from frontend
- Skip authentication checks
- Return sensitive data in public profiles

### 8. Indexing Strategy

For optimal performance, create indexes on:
- `userprofiles.memberId` (UNIQUE)
- `conversations.participants` (REGULAR)
- `conversations.createdBy` (REGULAR)
- `messages-1.conversationId` (REGULAR)
- `messages-1.senderId` (REGULAR)
- `messages-1.isDeleted` (REGULAR)

### 9. Testing Checklist

- [ ] User A cannot see User B's profile (except public fields)
- [ ] User A cannot see User B's conversations
- [ ] User A cannot read messages from conversations they're not in
- [ ] User A cannot send messages to conversations they're not in
- [ ] User A can only delete their own messages
- [ ] Unauthenticated users get `NOT_AUTHENTICATED` error
- [ ] Pagination works correctly for conversations and messages
- [ ] Soft-deleted messages don't appear in message lists
- [ ] Creating conversation with self returns error
- [ ] Conversation list is sorted by most recent message

### 10. Future Enhancements

- [ ] Group conversations (more than 2 participants)
- [ ] Message reactions/emojis
- [ ] Read receipts
- [ ] Typing indicators
- [ ] Message search
- [ ] Conversation archiving
- [ ] Message encryption
- [ ] File upload/download
- [ ] Voice/video call integration
- [ ] Message forwarding
