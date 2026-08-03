import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { AdminLogin } from './AdminLogin';

const mockFetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ ok: true }) });

beforeEach(() => {
  globalThis.fetch = mockFetch as unknown as typeof fetch;
  mockFetch.mockClear();
});

describe('AdminLogin', () => {
  it('submits username/password to POST /auth/login', async () => {
    render(
      <MemoryRouter>
        <AdminLogin />
      </MemoryRouter>,
    );

    fireEvent.change(screen.getByLabelText(/username/i), { target: { value: 'renzo' } });
    fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret123' } });
    fireEvent.click(screen.getByRole('button', { name: /log in/i }));

    await waitFor(() => {
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/auth/login'),
        expect.objectContaining({ method: 'POST', credentials: 'include' }),
      );
    });
  });
});
