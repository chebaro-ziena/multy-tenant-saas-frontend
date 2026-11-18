
'use client';

import { useEffect, useRef } from 'react';

import MessageBubble from './MessageBubble';
import ChatInput from './ChatInput';

import type {
  Conversation,
  Message,
} from '../types/chat.types';

interface Props {
  conversation: Conversation | null;
  messages: Message[];
  loading: boolean;
  sending: boolean;
  typing: boolean;
  connected: boolean;
  error: string;
  onSend: (content: string) => Promise<boolean>;
  onTyping: () => void;
}

export default function ChatWindow({
  conversation,
  messages,
  loading,
  sending,
  typing,
  connected,
  error,
  onSend,
  onTyping,
}: Props) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: 'smooth',
    });
  }, [messages]);

  if (!conversation) {
    return (
      <div className="flex min-h-[650px] items-center justify-center p-8 text-center">
        <div className="max-w-sm">
          <div className="mx-auto flex size-16 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
            ✉
          </div>

          <h3 className="mt-5 text-lg font-semibold">
            Select a conversation
          </h3>

          <p className="mt-2 text-sm leading-6 text-slate-400">
            Select a customer from the sidebar to view messages and
            start chatting.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-[650px] min-w-0 flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-white/10 p-5">
        <div>
          <h2 className="font-semibold">
            {conversation.customer?.name || 'Customer'}
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {conversation.customer?.email || 'Customer'}
          </p>
        </div>

        <span
          className={`rounded-full px-3 py-1 text-xs ${
            conversation.status === 'OPEN'
              ? 'bg-emerald-500/10 text-emerald-400'
              : 'bg-slate-700 text-slate-400'
          }`}
        >
          {conversation.status}
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 space-y-4 overflow-y-auto p-5">
        {loading ? (
          <p className="text-center text-sm text-slate-400">
            Loading messages...
          </p>
        ) : messages.length === 0 ? (
          <p className="py-10 text-center text-sm text-slate-400">
            No messages yet. Start the conversation!
          </p>
        ) : (
          messages.map((message) => (
            <MessageBubble
              key={message.id}
              message={message}
              customerId={conversation.customerId}
            />
          ))
        )}

        {typing && (
          <p className="text-xs text-slate-400">
            Customer is typing...
          </p>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error and connection */}
      {error && (
        <p className="px-5 pb-2 text-sm text-red-400">
          {error}
        </p>
      )}

      {!connected && (
        <p className="px-5 pb-2 text-xs text-amber-400">
          Reconnecting to chat...
        </p>
      )}

      {/* Input */}
      <ChatInput
  closed={conversation.status === 'CLOSED'}
  connected={connected}
  sending={sending}
  onSend={onSend}
  onTyping={onTyping}
/>
    </div>
  );
}
