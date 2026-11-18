
"use client";

interface CustomerChatInputProps {
  value: string;
  connected: boolean;
  sending: boolean;
  onChange: (value: string) => void;
  onSend: () => void;
  onTyping: () => void;
}

export default function CustomerChatInput({
  value,
  connected,
  sending,
  onChange,
  onSend,
  onTyping,
}: CustomerChatInputProps) {
  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSend();
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="flex gap-3 border-t border-gray-200 bg-white p-4"
    >
      <input
        value={value}
        onChange={(event) => {
          onChange(event.target.value);
          onTyping();
        }}
        maxLength={5000}
        placeholder={
          connected ? "Type your message..." : "Connecting..."
        }
        disabled={!connected || sending}
        className="min-w-0 flex-1 rounded-xl border border-gray-300 px-4 py-3 text-sm text-gray-900 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 disabled:bg-gray-100"
      />

      <button
        type="submit"
        disabled={!connected || sending || !value.trim()}
        className="rounded-xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {sending ? "Sending..." : "Send"}
      </button>
    </form>
  );
}
