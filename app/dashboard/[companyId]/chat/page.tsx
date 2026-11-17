
'use client';

import { useState } from 'react';
import { useParams } from 'next/navigation';

export default function ChatPage() {
  const { companyId } = useParams<{ companyId: string }>();
  const [message, setMessage] = useState('');

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    // Messages cannot be sent until the backend chat API
    // and WebSocket events are connected.
    setMessage('');
  }

  return (
    <div className="mx-auto max-w-6xl">
      <p className="text-sm font-semibold text-indigo-400">
        CUSTOMER SUPPORT
      </p>

      <h1 className="mt-2 text-3xl font-bold">Live chat</h1>

      <p className="mt-2 text-slate-400">
        Manage customer conversations in your company workspace.
      </p>

      <section className="mt-8 grid min-h-[520px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 md:grid-cols-[280px_1fr]">
        <aside className="border-b border-white/10 p-5 md:border-b-0 md:border-r">
          <h2 className="font-semibold">Conversations</h2>

          <div className="mt-5 rounded-xl border border-dashed border-white/15 p-4">
            <p className="text-sm font-medium">No conversations loaded</p>
            <p className="mt-2 text-xs leading-5 text-slate-400">
              Conversations will appear here when the chat API is connected.
            </p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col">
          <div className="border-b border-white/10 p-5">
            <h2 className="font-semibold">Customer conversation</h2>
            <p className="mt-1 text-xs text-slate-400">
              Company: {companyId}
            </p>
          </div>

          <div className="flex flex-1 items-center justify-center p-8 text-center">
            <div className="max-w-sm">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl bg-indigo-500/10 text-2xl">
                <span aria-hidden="true">✉</span>
              </div>

              <h3 className="mt-4 text-lg font-semibold">
                Your conversations will appear here
              </h3>

              <p className="mt-2 text-sm leading-6 text-slate-400">
                The interface is ready for integration. Real-time messaging
                needs the backend conversation endpoints, WebSocket
                authentication, and message events.
              </p>
            </div>
          </div>

          <form
            onSubmit={handleSubmit}
            className="border-t border-white/10 p-4"
          >
            <div className="flex gap-3">
              <input
                value={message}
                onChange={(event) => setMessage(event.target.value)}
                placeholder="Chat is not connected yet..."
                disabled
                aria-label="Chat message"
                className="min-w-0 flex-1 rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm disabled:cursor-not-allowed disabled:opacity-60"
              />

              <button
                type="submit"
                disabled
                className="rounded-xl bg-indigo-500 px-5 py-3 text-sm font-semibold opacity-50"
              >
                Send
              </button>
            </div>
          </form>
        </div>
      </section>
    </div>
  );
}
