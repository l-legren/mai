// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ThinkingRow from './ThinkingRow';

afterEach(cleanup);

describe('ThinkingRow', () => {
  it('shows the thinking status and fires onStop when Stop is clicked', () => {
    const onStop = vi.fn();
    render(<ThinkingRow onStop={onStop} />);

    expect(screen.getByText('Thinking…')).toBeTruthy();

    fireEvent.click(screen.getByRole('button', { name: 'Stop' }));

    expect(onStop).toHaveBeenCalledTimes(1);
  });
});
