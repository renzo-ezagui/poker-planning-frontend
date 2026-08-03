import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { describe, it, expect } from 'vitest';
import { JoinRoom } from './JoinRoom';

describe('JoinRoom', () => {
  it('requires a non-empty name before enabling the join button', () => {
    render(
      <MemoryRouter initialEntries={['/?room=ABCD1234']}>
        <Routes>
          <Route path="/" element={<JoinRoom />} />
        </Routes>
      </MemoryRouter>,
    );

    const joinButton = screen.getByRole('button', { name: /join/i });
    expect(joinButton).toBeDisabled();

    fireEvent.change(screen.getByLabelText(/your name/i), { target: { value: 'Alice' } });
    expect(joinButton).toBeEnabled();
  });
});
