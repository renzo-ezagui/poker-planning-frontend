import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { ChatPanel } from './ChatPanel';

describe('ChatPanel', () => {
  it('emits chat:message with the typed text on submit', () => {
    const emit = vi.fn();
    const socket = { on: vi.fn(), off: vi.fn(), emit } as any;

    render(<ChatPanel socket={socket} name="Alice" roomCode="room-123" />);
    fireEvent.change(screen.getByLabelText(/chat message/i), { target: { value: 'hi team' } });
    fireEvent.click(screen.getByRole('button', { name: /send/i }));

    expect(emit).toHaveBeenCalledWith('chat:message', expect.objectContaining({
      name: 'Alice',
      text: 'hi team',
      roomCode: 'room-123',
    }));
  });
});
