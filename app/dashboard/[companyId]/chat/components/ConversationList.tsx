import { useState } from 'react';

import ConversationItem from './ConversationItem';

import type { Conversation } from '../types/chat.types';

interface Props {
  conversations: Conversation[];
  selectedId: string | null;
  loading: boolean;
  onSelect: (conversation: Conversation) => void;
}

export default function ConversationList({
  conversations,
  selectedId,
  loading,
  onSelect,
}: Props) {
  const [search, setSearch] = useState('');

  const filteredConversations = conversations.filter(
    (conversation) => {
      const name = conversation.customer?.name || 'Customer';
      const email = conversation.customer?.email || '';

      const query = search.toLowerCase();

      return (
        name.toLowerCase().includes(query) ||
        email.toLowerCase().includes(query)
      );
    },
  );

  return (
    <aside className="border-b border-white/10 md:border-b-0 md:border-r">
      <div className="border-b border-white/10 p-5">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold">Conversations</h2>

          <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-xs text-indigo-400">
            {conversations.length}
          </span>
        </div>

        <input
          value={search}
          onChange={(event) => setSearch(event.target.value)}
          placeholder="Search customers..."
          className="mt-4 w-full rounded-xl border border-white/10 bg-slate-800 px-4 py-3 text-sm outline-none focus:border-indigo-500"
        />
      </div>

      <div className="max-h-[520px] overflow-y-auto">
        {loading ? (
          <p className="p-5 text-sm text-slate-400">
            Loading conversations...
          </p>
        ) : filteredConversations.length === 0 ? (
          <div className="p-6 text-center">
            <p className="font-medium">No conversations found</p>

            <p className="mt-2 text-xs text-slate-400">
              Customer messages will appear here.
            </p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <ConversationItem
              key={conversation.id}
              conversation={conversation}
              active={selectedId === conversation.id}
              onClick={() => onSelect(conversation)}
            />
          ))
        )}
      </div>
    </aside>
  );
}
