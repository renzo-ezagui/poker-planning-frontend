import type { Socket } from 'socket.io-client';

const DECK_VALUES: Record<string, string[]> = {
  fibonacci: ['0', '1', '2', '3', '5', '8', '13', '20', '40', '100', '?'],
  tshirt: ['XS', 'S', 'M', 'L', 'XL', '?'],
};

export function VotingCards({
  deckType,
  socket,
  roomCode,
  participantId,
  disabled,
}: {
  deckType: string;
  socket: Socket | null;
  roomCode: string;
  participantId: string;
  disabled: boolean;
}) {
  const values = DECK_VALUES[deckType] ?? [];

  return (
    <div style={{ position: 'absolute', bottom: 20, left: '50%', transform: 'translateX(-50%)' }}>
      {values.map((value) => (
        <button
          key={value}
          disabled={disabled}
          onClick={() => socket?.emit('vote:cast', { participantId, roomCode, value })}
        >
          {value}
        </button>
      ))}
    </div>
  );
}
