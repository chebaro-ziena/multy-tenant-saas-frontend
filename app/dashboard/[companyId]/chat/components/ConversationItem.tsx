import type { Conversation } from '../types/chat.types';

interface Props {
  conversation: Conversation;
  active: boolean;
  onClick: () => void;
}

export default function ConversationItem({
  conversation,
  active,
  onClick,
}: Props) {
  const customerName = conversation.customer?.name || 'Customer';

  const time = conversation.lastMessageAt
    ? new Date(conversation.lastMessageAt).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : '';

  return (
    <button
      onClick={onClick}
      className={`w-full border-b border-white/5 p-4 text-left transition hover:bg-slate-800 ${
        active
          ? 'border-l-2 border-l-indigo-500 bg-indigo-500/10'
          : ''
      }`}
    >
      <div className="flex items-center gap-3">
        <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-indigo-500/20 font-semibold text-indigo-300">
          {customerName.charAt(0).toUpperCase()}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex justify-between gap-2">
            <p className="truncate text-sm font-semibold">
              {customerName}
            </p>

            <span className="shrink-0 text-[10px] text-slate-500">
              {time}
            </span>
          </div>

          <p className="mt-1 truncate text-xs text-slate-400">
            {conversation.customer?.email || 'Customer conversation'}
          </p>

          <span
            className={`mt-2 inline-block rounded-full px-2 py-0.5 text-[10px] ${
              conversation.status === 'OPEN'
                ? 'bg-emerald-500/10 text-emerald-400'
                : 'bg-slate-700 text-slate-400'
            }`}
          >
            {conversation.status}
          </span>
        </div>
      </div>
    </button>
  );
}
