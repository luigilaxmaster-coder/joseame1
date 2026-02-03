export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  receiverId: string;
  text: string;
  attachments: string;
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

export function createConversation(otherMemberId: string): Promise<Conversation>;
export function listMyConversations(limit?: number, cursor?: string | null): Promise<PaginatedResult<Conversation>>;
export function sendMessage(conversationId: string, text: string, attachments?: any[]): Promise<Message>;
export function listMessages(conversationId: string, limit?: number, cursor?: string | null): Promise<PaginatedResult<Message>>;
export function deleteMessage(messageId: string): Promise<{ success: boolean }>;
export function getConversation(conversationId: string): Promise<Conversation>;
