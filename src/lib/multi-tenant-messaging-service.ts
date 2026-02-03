// Lazy import backend functions to support dynamic module loading
let backendFunctions: any = null;

async function getBackendFunctions() {
  if (!backendFunctions) {
    const module = await import('@/backend/multi-tenant-messaging.jsw');
    backendFunctions = module;
  }
  return backendFunctions;
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  attachments: any[];
  createdAt: string;
  isDeleted: boolean;
}

export interface Conversation {
  _id: string;
  participants: string;
  createdAt: string;
  lastMessageAt: string | null;
  lastMessageText: string;
  createdBy: string;
  title: string;
}

export interface PaginatedResult<T> {
  items: T[];
  hasMore: boolean;
  nextCursor: string | null;
  totalCount: number;
}

/**
 * Create or get existing 1:1 conversation
 */
export async function startConversation(otherMemberId: string): Promise<Conversation> {
  try {
    const { createConversation } = await getBackendFunctions();
    return await createConversation(otherMemberId);
  } catch (error) {
    console.error('Failed to create conversation:', error);
    throw error;
  }
}

/**
 * Get all conversations for current user
 */
export async function getMyConversations(
  limit: number = 50,
  cursor: string | null = null
): Promise<PaginatedResult<Conversation>> {
  try {
    const { listMyConversations } = await getBackendFunctions();
    return await listMyConversations(limit, cursor);
  } catch (error) {
    console.error('Failed to fetch conversations:', error);
    throw error;
  }
}

/**
 * Send a message in a conversation
 */
export async function sendMessageToConversation(
  conversationId: string,
  text: string,
  attachments: any[] = []
): Promise<Message> {
  try {
    const { sendMessage } = await getBackendFunctions();
    return await sendMessage(conversationId, text, attachments);
  } catch (error) {
    console.error('Failed to send message:', error);
    throw error;
  }
}

/**
 * Get messages in a conversation
 */
export async function getConversationMessages(
  conversationId: string,
  limit: number = 50,
  cursor: string | null = null
): Promise<PaginatedResult<Message>> {
  try {
    const { listMessages } = await getBackendFunctions();
    return await listMessages(conversationId, limit, cursor);
  } catch (error) {
    console.error('Failed to fetch messages:', error);
    throw error;
  }
}

/**
 * Delete a message (soft delete)
 */
export async function removeMessage(messageId: string): Promise<{ success: boolean }> {
  try {
    const { deleteMessage } = await getBackendFunctions();
    return await deleteMessage(messageId);
  } catch (error) {
    console.error('Failed to delete message:', error);
    throw error;
  }
}

/**
 * Get a specific conversation with validation
 */
export async function fetchConversation(conversationId: string): Promise<Conversation> {
  try {
    const { getConversation } = await getBackendFunctions();
    return await getConversation(conversationId);
  } catch (error) {
    console.error('Failed to fetch conversation:', error);
    throw error;
  }
}
