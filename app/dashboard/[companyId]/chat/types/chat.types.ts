export type ConversationStatus = 'OPEN' | 'CLOSED';

export interface Customer {
  id: string;
  name: string;
  email: string;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  companyId: string;
  customerId: string;
  status: 'OPEN' | 'CLOSED';
  lastMessageAt: string | null;
  customer: {
    id: string;
    name: string;
    email: string;
  } | null;
}

export interface SocketAck {
  success: boolean;
  message?: string;
  conversationId?: string;
  messageData?: Message;
}

export interface TypingEvent {
  conversationId: string;
  userId: string;
}
