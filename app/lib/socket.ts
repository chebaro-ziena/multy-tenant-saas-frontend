import { io, Socket } from 'socket.io-client';

let socket: Socket | null = null;

export function getChatSocket(): Socket {
  if (!socket) {
    socket = io(process.env.NEXT_PUBLIC_API_URL!, {
      withCredentials: true,
      autoConnect: false,
      transports: ['websocket'],
    });
  }

  return socket;
}