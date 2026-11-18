'use client';

import { Suspense } from 'react';
import { useParams } from 'next/navigation';

import { useChat } from './hooks/useChat';

import ConversationList from './components/ConversationList';
import ChatWindow from './components/ChatWindow';

function ChatContent() {
  const { companyId } = useParams<{ companyId: string }>();

  const {
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
  } = useChat(companyId);

  return (
    <div className="mx-auto max-w-7xl text-white">
      {/* Page header */}
      <div className="mb-8">
        <p className="text-sm font-semibold tracking-widest text-indigo-400">
          CUSTOMER SUPPORT
        </p>

        <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-3xl font-bold">Live chat</h1>

            <p className="mt-2 text-sm text-slate-400">
              Manage customer conversations in your workspace.
            </p>
          </div>

          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-slate-900 px-4 py-2 text-sm">
            <span
              className={`size-2 rounded-full ${
                connected ? 'bg-emerald-400' : 'bg-red-400'
              }`}
            />

            {connected ? 'Connected' : 'Disconnected'}
          </div>
        </div>
      </div>

      {/* Chat layout */}
      <section className="grid min-h-[650px] overflow-hidden rounded-2xl border border-white/10 bg-slate-900 md:grid-cols-[300px_1fr]">
        <ConversationList
          conversations={conversations}
          selectedId={selectedConversation?.id || null}
          loading={loading}
          onSelect={selectConversation}
        />

        <ChatWindow
          conversation={selectedConversation}
          messages={messages}
          loading={messagesLoading}
          sending={sending}
          typing={typing}
          connected={connected}
          error={error}
          onSend={sendMessage}
          onTyping={emitTyping}
        />
      </section>
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl p-6 text-slate-400">
          Loading chat...
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}


