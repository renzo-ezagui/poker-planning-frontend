import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useRoomSocket } from './useRoomSocket';

vi.mock('socket.io-client', () => {
  const handlers: Record<string, (payload: any) => void> = {};
  return {
    io: vi.fn(() => ({
      on: (event: string, cb: any) => {
        handlers[event] = cb;
        if (event === 'connect') cb();
      },
      emit: (event: string) => {
        if (event === 'join') {
          handlers['joined']({ participantId: 'p1', token: 'tok-1', role: 'voter', roomState: {} });
        }
      },
      close: vi.fn(),
    })),
  };
});

describe('useRoomSocket', () => {
  beforeEach(() => localStorage.clear());

  it('stores the issued token in localStorage scoped by room code', async () => {
    const { result } = renderHook(() => useRoomSocket('ABCD1234', 'Alice'));
    await waitFor(() => expect(result.current.participantId).toBe('p1'));
    expect(localStorage.getItem('poker-planning:ABCD1234:token')).toBe('tok-1');
  });
});
