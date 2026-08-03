import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { AdminControls } from './AdminControls';

describe('AdminControls', () => {
  it('emits round:start with the typed topic', () => {
    const emit = vi.fn();
    const socket = { emit } as any;

    render(<AdminControls socket={socket} roomCode="ABCD1234" />);
    fireEvent.change(screen.getByLabelText(/topic/i), { target: { value: 'Story 1' } });
    fireEvent.click(screen.getByRole('button', { name: /start round/i }));

    expect(emit).toHaveBeenCalledWith('round:start', { roomCode: 'ABCD1234', topic: 'Story 1' });
  });

  it('emits round:reveal on reveal click', () => {
    const emit = vi.fn();
    const socket = { emit } as any;

    render(<AdminControls socket={socket} roomCode="ABCD1234" />);
    fireEvent.click(screen.getByRole('button', { name: /reveal/i }));

    expect(emit).toHaveBeenCalledWith('round:reveal', { roomCode: 'ABCD1234' });
  });
});
