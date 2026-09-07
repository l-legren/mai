// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import EmptyState from './EmptyState';

afterEach(cleanup);

describe('EmptyState', () => {
  it('sends the exact prompt text when a starter prompt is clicked', () => {
    const onSelectPrompt = vi.fn();
    render(<EmptyState onSelectPrompt={onSelectPrompt} />);

    const button = screen.getByRole('button', { name: 'How much have I spent this week?' });
    fireEvent.click(button);

    expect(onSelectPrompt).toHaveBeenCalledWith('How much have I spent this week?');
  });

  it('renders all four starter prompts', () => {
    render(<EmptyState onSelectPrompt={vi.fn()} />);

    expect(screen.getAllByRole('button')).toHaveLength(4);
  });
});
