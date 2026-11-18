
import type { Message } from '../types/chat.types';

interface Props {
  message: Message;
  customerId: string;
}

export default function MessageBubble({
  message,
  customerId,
}: Props) {
  const isAdmin = message.senderId !== customerId;

  const time = new Date(message.createdAt).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  return (
    <div className={`flex ${isAdmin ? 'justify-end' : 'justify-start'}`}>
      <div
        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
          isAdmin
            ? 'rounded-br-sm bg-indigo-600'
            : 'rounded-bl-sm bg-slate-800'
        }`}
      >
        <p className="break-words text-sm">{message.content}</p>

        <p className="mt-2 text-right text-[10px] text-white/60">
          {time}
        </p>
      </div>
    </div>
  );
}
