import type { Socket } from 'socket.io-client';

/**
 * Placeholder stub — real implementation lands in Task 16.
 * Kept minimal so RoomScene (Task 15) can compile and render without
 * depending on unimplemented chat UI/logic.
 */
export function ChatPanel({ socket: _socket, name: _name }: { socket: Socket | null; name: string }) {
  return null;
}
