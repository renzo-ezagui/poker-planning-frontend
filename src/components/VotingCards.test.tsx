import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { VotingCards } from './VotingCards';

describe('VotingCards', () => {
  it('emits vote:cast with the clicked card value', () => {
    const emit = vi.fn();
    const socket = { emit } as any;

    render(
      <VotingCards
        deckType="fibonacci"
        socket={socket}
        roomCode="ABCD1234"
        participantId="p1"
        disabled={false}
      />,
    );
    fireEvent.click(screen.getByRole('button', { name: '5' }));

    expect(emit).toHaveBeenCalledWith('vote:cast', {
      participantId: 'p1',
      roomCode: 'ABCD1234',
      value: '5',
    });
  });

  it('disables all cards when disabled is true', () => {
    const socket = { emit: vi.fn() } as any;
    render(
      <VotingCards
        deckType="fibonacci"
        socket={socket}
        roomCode="ABCD1234"
        participantId="p1"
        disabled={true}
      />,
    );
    expect(screen.getByRole('button', { name: '5' })).toBeDisabled();
  });
});
