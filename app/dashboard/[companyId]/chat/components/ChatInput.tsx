
import { useState } from 'react';

interface Props {
  closed: boolean;
  connected: boolean;
  sending: boolean;
  onSend: (content: string) => Promise<boolean>;
  onTyping: () => void;
}

export default function ChatInput({
  closed,
  connected,
  sending,
  onSend,
  onTyping,
}: Props) {
  const [message, setMessage] = useState('');

  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>,
  ) {
    event.preventDefault();

    const content = message.trim();

    if (!content || closed || sending) return;

    const success = await onSend(content);

    if (success) {
      setMessage('');
    }
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="border-t border-white/10 p-4"
    >
      {closed ? (
  <p className="text-center text-sm text-slate-400">
    This conversation is closed.
  </p>
) : (
  <div className="flex gap-3">
    <input
      value={message}
      onChange={(event) => {
        setMessage(event.target.value);
        onTyping();
      }}
      disabled={!connected}
      placeholder={
        connected ? 'Type your message...' : 'Connecting...'
      }
      maxLength={5000}
      className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-indigo-500 disabled:opacity-50"
    />

    <button
      type="submit"
      disabled={!message.trim() || sending || !connected}
      className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold disabled:opacity-40"
    >
      {sending ? 'Sending...' : 'Send'}
    </button>
  </div>
)}
    </form>
  );
}
