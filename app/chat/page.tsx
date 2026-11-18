"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getChatSocket } from "../lib/socket";
import type { Socket } from "socket.io-client";

import CustomerChatWindow, {
  type ChatMessage,
} from "./components/CustomerChatWindow";

import CustomerChatInput from "./components/CustomerChatInput";

const API_URL =
  process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface SendMessageAck {
  success: boolean;
  message?: ChatMessage;
}

interface TypingEvent {
  conversationId: string;
  userId: string;
}

// Subscribe to Socket.IO connection changes.
function subscribeToSocket(callback: () => void) {
  const socket = getChatSocket();

  socket.on("connect", callback);
  socket.on("disconnect", callback);

  return () => {
    socket.off("connect", callback);
    socket.off("disconnect", callback);
  };
}

function getSocketSnapshot() {
  return getChatSocket().connected;
}

function getSocketServerSnapshot() {
  return false;
}

function CustomerChatContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const conversationId = searchParams.get("conversationId");

  const connected = useSyncExternalStore(
    subscribeToSocket,
    getSocketSnapshot,
    getSocketServerSnapshot
  );

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [currentUserId, setCurrentUserId] = useState("");
  const [messageInput, setMessageInput] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [companyTyping, setCompanyTyping] = useState(false);
  const [error, setError] = useState("");

  const socketRef = useRef<Socket | null>(null);
  const typingTimeoutRef =
    useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add a message without creating duplicates.
  const addMessage = useCallback((message: ChatMessage) => {
    setMessages((previous) => {
      if (previous.some((item) => item.id === message.id)) {
        return previous;
      }

      return [...previous, message];
    });
  }, []);

  // Load authenticated user and conversation messages.
  useEffect(() => {
    if (!conversationId) return;

    const controller = new AbortController();

    async function loadConversation() {
      try {
        const [userResponse, messagesResponse] = await Promise.all([
          fetch(`${API_URL}/auth/me`, {
            credentials: "include",
            signal: controller.signal,
          }),

          fetch(
            `${API_URL}/chat/conversations/${conversationId}/messages`,
            {
              credentials: "include",
              signal: controller.signal,
            }
          ),
        ]);

        if (controller.signal.aborted) return;

        if (
          userResponse.status === 401 ||
          messagesResponse.status === 401
        ) {
          router.push("/login");
          return;
        }

        if (!userResponse.ok || !messagesResponse.ok) {
          throw new Error("Unable to load this conversation.");
        }

        const userData = await userResponse.json();
        const messagesData = await messagesResponse.json();

        if (controller.signal.aborted) return;

        // Your API returns userId, not id.
        if (!userData.user) {
          throw new Error("User ID was not returned by the API.");
        }

        setCurrentUserId(userData.user);

        const items: ChatMessage[] = Array.isArray(messagesData)
          ? messagesData
          : messagesData.messages ?? [];

        setMessages(items);
      } catch (err) {
        if (err instanceof Error && err.name === "AbortError") {
          return;
        }

        if (!controller.signal.aborted) {
          setError(
            err instanceof Error
              ? err.message
              : "Unable to load conversation."
          );
        }
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadConversation();

    return () => controller.abort();
  }, [conversationId, router]);

  // Socket.IO connection and conversation events.
  useEffect(() => {
    if (!conversationId) return;

    const socket = getChatSocket();
    socketRef.current = socket;

    const joinConversation = () => {
      socket.emit("join_conversation", { conversationId });
    };

    const handleNewMessage = (message: ChatMessage) => {
      if (message.conversationId === conversationId) {
        addMessage(message);
      }
    };

    const handleTyping = (data: TypingEvent) => {
      if (data.conversationId !== conversationId) return;

      setCompanyTyping(true);

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }

      typingTimeoutRef.current = setTimeout(() => {
        setCompanyTyping(false);
      }, 2000);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("typing", handleTyping);

    if (socket.connected) {
      joinConversation();
    } else {
      socket.connect();
    }

    // Rejoin after reconnecting.
    socket.on("connect", joinConversation);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("typing", handleTyping);
      socket.off("connect", joinConversation);

      if (socket.connected) {
        socket.emit("leave_conversation", { conversationId });
      }

      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
        typingTimeoutRef.current = null;
      }

      socketRef.current = null;
    };
  }, [conversationId, addMessage]);

  // Send message through Socket.IO.
  const sendMessage = () => {
    const content = messageInput.trim();
    const socket = socketRef.current;

    if (
      !content ||
      !conversationId ||
      !socket?.connected ||
      sending
    ) {
      return;
    }

    setSending(true);
    setError("");

    socket.timeout(10000).emit(
      "send_message",
      {
        conversationId,
        content,
      },
      (
        timeoutError: Error | null,
        response: SendMessageAck
      ) => {
        setSending(false);

        if (timeoutError || !response?.success) {
          setError("Message could not be sent. Please try again.");
          return;
        }

        if (response.message) {
          addMessage(response.message);
        }

        setMessageInput("");
      }
    );
  };

  // Notify the company representative while typing.
  const handleTyping = () => {
    if (!conversationId || !socketRef.current?.connected) {
      return;
    }

    socketRef.current.emit("typing", { conversationId });
  };

  if (!conversationId) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <h2 className="text-xl font-semibold">
            Conversation not found
          </h2>

          <p className="mt-2 text-gray-500">
            Please select a product and start a conversation.
          </p>

          <button
            onClick={() => router.push("/")}
            className="mt-4 rounded-lg bg-black px-4 py-2 text-white"
          >
            Back to Home
          </button>
        </div>
      </main>
    );
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-50">
        <p className="text-gray-500">Loading conversation...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8">
      <div className="mx-auto flex h-[80vh] max-w-4xl flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">

        {/* Chat Header */}
        <header className="flex items-center justify-between border-b border-gray-200 px-5 py-4">
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              Company Support
            </h1>

            <p className="text-sm text-gray-500">
              Ask us anything about our products.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <span
              className={`h-2.5 w-2.5 rounded-full ${
                connected ? "bg-green-500" : "bg-red-500"
              }`}
            />

            <span className="text-xs text-gray-500">
              {connected ? "Connected" : "Disconnected"}
            </span>
          </div>
        </header>

        {/* Chat Window */}
        <CustomerChatWindow
          messages={messages}
          currentUserId={currentUserId}
          companyTyping={companyTyping}
          error={error}
        />

        {/* Chat Input */}
        <CustomerChatInput
          value={messageInput}
          connected={connected}
          sending={sending}
          onChange={setMessageInput}
          onSend={sendMessage}
          onTyping={handleTyping}
        />
      </div>
    </main>
  );
}

export default function CustomerChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          Loading chat...
        </div>
      }
    >
      <CustomerChatContent />
    </Suspense>
  );
}
