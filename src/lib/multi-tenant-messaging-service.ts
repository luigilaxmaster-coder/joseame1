import { 
  createConversation, 
  listMyConversations, 
  sendMessage, 
  listMessages, 
  deleteMessage,
  getConversation 
} from '@/backend/multi-tenant-messaging.jsw';

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
    return await getConversation(conversationId);
  } catch (error) {
    console.error('Failed to fetch conversation:', error);
    throw error;
  }
}
