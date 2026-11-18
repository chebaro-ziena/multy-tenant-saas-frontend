
import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react';

import { getChatSocket } from '../../../../lib/socket';

import type {
  Conversation,
  Message,
  SocketAck,
  TypingEvent,
} from '../types/chat.types';

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';

export function useChat(companyId: string) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);

  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [sending, setSending] = useState(false);

  const [connected, setConnected] = useState(false);
  const [typing, setTyping] = useState(false);
  const [error, setError] = useState('');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);

  const selectedConversationRef = useRef<string | null>(null);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(
    null,
  );
  const messageAudioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound and load current user
  useEffect(() => {
    messageAudioRef.current = new Audio('/sounds/message.mp3');
    messageAudioRef.current.volume = 0.5;

    const loadCurrentUser = async () => {
      try {
        const response = await fetch(`${API_URL}/auth/me`, {
          credentials: 'include',
        });

        if (!response.ok) {
          throw new Error('Failed to load current user');
        }

        const data = await response.json();
        const userId = data.user?.userId ?? data.user?.id;

        if (userId) {
          setCurrentUserId(userId);
        }
      } catch (err) {
        console.error('Failed to load current user:', err);
      }
    };

    loadCurrentUser();

    return () => {
      messageAudioRef.current = null;
    };
  }, []);

  // Play notification sound
  const playMessageSound = useCallback(() => {
    const audio = messageAudioRef.current;

    if (!audio) return;

    audio.currentTime = 0;

    audio.play().catch(() => {
      // Browser may block audio until the user interacts with the page.
    });
  }, []);

  // Load company conversations
  const fetchConversations = useCallback(
    async (signal?: AbortSignal) => {
      try {
        const response = await fetch(
          `${API_URL}/chat/company/${companyId}`,
          {
            credentials: 'include',
            signal,
          },
        );

        if (!response.ok) {
          throw new Error('Failed to load conversations');
        }

        const data: Conversation[] = await response.json();

        if (!signal?.aborted) {
          setConversations(data);
          setError('');
        }
      } catch (err) {
        if (signal?.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load conversations',
        );
      } finally {
        if (!signal?.aborted) {
          setLoading(false);
        }
      }
    },
    [companyId],
  );

  // Load messages
  const fetchMessages = useCallback(
    async (conversationId: string, signal?: AbortSignal) => {
      try {
        const response = await fetch(
          `${API_URL}/chat/conversations/${conversationId}/messages`,
          {
            credentials: 'include',
            signal,
          },
        );

        if (!response.ok) {
          throw new Error('Failed to load messages');
        }

        const data: Message[] = await response.json();

        if (
          !signal?.aborted &&
          selectedConversationRef.current === conversationId
        ) {
          setMessages(data);
          setError('');
        }
      } catch (err) {
        if (signal?.aborted) return;

        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load messages',
        );
      } finally {
        if (!signal?.aborted) {
          setMessagesLoading(false);
        }
      }
    },
    [],
  );

  // Initial conversations request
  useEffect(() => {
    const controller = new AbortController();

    const loadConversations = async () => {
      await fetchConversations(controller.signal);
    };

    loadConversations();

    return () => {
      controller.abort();
    };
  }, [fetchConversations]);

  // Socket connection and listeners
  useEffect(() => {
    const socket = getChatSocket();

    const handleConnect = () => {
      setConnected(true);

      const conversationId = selectedConversationRef.current;

      if (conversationId) {
        socket.emit('join_conversation', { conversationId });
      }
    };

    const handleDisconnect = () => {
      setConnected(false);
    };

    const handleNewMessage = (newMessage: Message) => {
      if (
        newMessage.conversationId === selectedConversationRef.current
      ) {
        setMessages((previous) => {
          // Prevent duplicate messages
          if (previous.some((item) => item.id === newMessage.id)) {
            return previous;
          }

          // Play sound only for messages sent by another user
          if (
            currentUserId &&
            newMessage.senderId !== currentUserId
          ) {
            playMessageSound();
          }

          return [...previous, newMessage];
        });
      }

      // Update conversation order and last message time
      setConversations((previous) => {
        const updated = previous.map((conversation) =>
          conversation.id === newMessage.conversationId
            ? {
                ...conversation,
                lastMessageAt: newMessage.createdAt,
              }
            : conversation,
        );

        return [...updated].sort(
          (a, b) =>
            new Date(b.lastMessageAt || 0).getTime() -
            new Date(a.lastMessageAt || 0).getTime(),
        );
      });
    };

    const handleTyping = (data: TypingEvent) => {
      if (
        data.conversationId !== selectedConversationRef.current ||
        data.userId === currentUserId
      ) {
        return;
      }

      setTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setTyping(false);
        typingTimeoutRef.current = null;
      }, 2000);
    };

    socket.on('connect', handleConnect);
    socket.on('disconnect', handleDisconnect);
    socket.on('new_message', handleNewMessage);
    socket.on('typing', handleTyping);

    if (socket.connected) {
      setConnected(true);

      const conversationId = selectedConversationRef.current;

      if (conversationId) {
        socket.emit('join_conversation', { conversationId });
      }
    } else {
      socket.connect();
    }

    return () => {
      socket.off('connect', handleConnect);
      socket.off('disconnect', handleDisconnect);
      socket.off('new_message', handleNewMessage);
      socket.off('typing', handleTyping);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      socket.disconnect();
    };
  }, [currentUserId, playMessageSound]);

  // Select conversation
  const selectConversation = useCallback(
    (conversation: Conversation) => {
      const socket = getChatSocket();
      const previousId = selectedConversationRef.current;

      if (previousId && socket.connected) {
        socket.emit('leave_conversation', {
          conversationId: previousId,
        });
      }

      selectedConversationRef.current = conversation.id;

      setSelectedConversation(conversation);
      setMessages([]);
      setTyping(false);
      setMessagesLoading(true);
      setError('');

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }
    },
    [],
  );

  // Load messages and join selected conversation
  useEffect(() => {
    if (!selectedConversation) return;

    const controller = new AbortController();
    const socket = getChatSocket();
    const conversationId = selectedConversation.id;

    const loadMessages = async () => {
      await fetchMessages(conversationId, controller.signal);
    };

    loadMessages();

    if (socket.connected) {
      socket.emit('join_conversation', { conversationId });
    }

    return () => {
      controller.abort();

      if (socket.connected) {
        socket.emit('leave_conversation', { conversationId });
      }
    };
  }, [selectedConversation, fetchMessages]);

  // Send message
  const sendMessage = useCallback(
    (content: string) => {
      return new Promise<boolean>((resolve) => {
        const socket = getChatSocket();

        if (
          !selectedConversation ||
          !socket.connected ||
          !content.trim() ||
          sending
        ) {
          setError('Unable to send message. Check your connection.');
          resolve(false);
          return;
        }

        if (selectedConversation.status === 'CLOSED') {
          setError('This conversation is closed.');
          resolve(false);
          return;
        }

        setSending(true);
        setError('');

        socket.timeout(10000).emit(
          'send_message',
          {
            conversationId: selectedConversation.id,
            content: content.trim(),
          },
          (
            timeoutError: Error | null,
            response: SocketAck,
          ) => {
            setSending(false);

            if (timeoutError || !response?.success) {
              setError(
                response?.message || 'Failed to send message',
              );
              resolve(false);
              return;
            }

            resolve(true);
          },
        );
      });
    },
    [selectedConversation, sending],
  );

  // Typing indicator
  const emitTyping = useCallback(() => {
    if (!selectedConversation) return;

    const socket = getChatSocket();

    if (socket.connected) {
      socket.emit('typing', {
        conversationId: selectedConversation.id,
      });
    }
  }, [selectedConversation]);

  return {
    conversations,
    selectedConversation,
    messages,
    loading,
    messagesLoading,
    sending,
    connected,
    typing,
    error,
    selectConversation,
    sendMessage,
    emitTyping,
  };
}

