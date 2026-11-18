
"use client";

interface ChatMessageBubbleProps {
  content: string;
  createdAt: string;
  isCustomer: boolean;
}

export default function ChatMessageBubble({
  content,
  createdAt,
  isCustomer,
}: ChatMessageBubbleProps) {
  return (
    <div
      className={`flex w-full ${
        isCustomer ? "justify-end" : "justify-start"
      }`}
    >
      <div
        className={`w-fit max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
          isCustomer
            ? "rounded-br-sm bg-indigo-600 text-white"
            : "rounded-bl-sm border border-gray-200 bg-white text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm">
          {content}
        </p>

        <p
          className={`mt-2 text-right text-xs ${
            isCustomer ? "text-indigo-200" : "text-gray-400"
          }`}
        >
          {new Date(createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
      </div>
    </div>
  );
}

