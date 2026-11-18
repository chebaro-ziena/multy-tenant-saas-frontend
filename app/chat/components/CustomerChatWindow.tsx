
"use client";

import { useEffect, useRef } from "react";
import ChatMessageBubble from "./ChatMessageBubble";

export interface ChatMessage {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
}

interface CustomerChatWindowProps {
  messages: ChatMessage[];
  currentUserId: string;
  companyTyping: boolean;
  error: string;
}

export default function CustomerChatWindow({
  messages,
  currentUserId,
  companyTyping,
  error,
}: CustomerChatWindowProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, companyTyping]);

  return (
    <div className="flex-1 space-y-4 overflow-y-auto bg-gray-50 p-5">
      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-3 text-sm text-red-600"
        >
          {error}
        </p>
      )}

      {messages.length === 0 && (
        <div className="flex h-full items-center justify-center text-center">
          <div>
            <h2 className="font-semibold text-gray-800">
              Start a conversation
            </h2>
            <p className="mt-2 text-sm text-gray-500">
              Send us a message and our team will help you.
            </p>
          </div>
        </div>
      )}

      {messages.map((message) => {
  console.log({
    senderId: message.senderId,
    currentUserId,
    isCustomer: message.senderId === currentUserId,
  });

  return (
    <ChatMessageBubble
      key={message.id}
      content={message.content}
      createdAt={message.createdAt}
      isCustomer={message.senderId === currentUserId}
    />
  );
})}

      {companyTyping && (
        <p className="text-sm italic text-gray-500">
          Company representative is typing...
        </p>
      )}

      <div ref={messagesEndRef} />
    </div>
  );
}
