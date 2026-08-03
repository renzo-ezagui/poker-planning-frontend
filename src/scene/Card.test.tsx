import { render } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import type { ReactNode } from 'react';
import { Card } from './Card';

// Card is a React Three Fiber leaf component: `useFrame` requires a live
// <Canvas> render loop (WebGL context), which jsdom cannot provide. For this
// unit test we only care that Card mounts/unmounts without throwing given
// `revealed`/`value` props, so the r3f/drei hooks are stubbed out.
vi.mock('@react-three/fiber', () => ({
  useFrame: () => {},
}));
vi.mock('@react-three/drei', () => ({
  Text: ({ children }: { children?: ReactNode }) => <>{children}</>,
}));

describe('Card', () => {
  it('renders without crashing when face-down', () => {
    const { container } = render(<Card revealed={false} value="5" />);
    expect(container).toBeTruthy();
  });

  it('renders without crashing when revealed', () => {
    const { container } = render(<Card revealed={true} value="5" />);
    expect(container).toBeTruthy();
  });
});
