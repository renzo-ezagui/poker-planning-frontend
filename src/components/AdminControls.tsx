import type { Socket } from 'socket.io-client';

/**
 * Placeholder stub — real implementation lands in Task 17.
 * Kept minimal so RoomScene (Task 15) can compile and render without
 * depending on unimplemented admin-controls UI/logic.
 */
export function AdminControls({
  socket: _socket,
  roomCode: _roomCode,
}: {
  socket: Socket | null;
  roomCode: string;
}) {
  return null;
}
