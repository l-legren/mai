// @vitest-environment jsdom
import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it } from 'vitest';
import ChatBubble from './ChatBubble';

afterEach(cleanup);

describe('ChatBubble', () => {
  it('renders a user message inside a bubble container', () => {
    render(<ChatBubble from="user">Cancel the gym one</ChatBubble>);

    const text = screen.getByText('Cancel the gym one');
    expect(text.className).toContain('bg-bubble');
  });

  it('renders an agent message bare, with no bubble container', () => {
    render(<ChatBubble from="agent">Done — flagged FitX as cancelled.</ChatBubble>);

    const text = screen.getByText('Done — flagged FitX as cancelled.');
    expect(text.className).not.toContain('bg-bubble');
  });

  it('shows the status line only when one is given', () => {
    const { rerender } = render(<ChatBubble status="Looked at this week's transactions" />);
    expect(screen.getByText("Looked at this week's transactions")).toBeTruthy();

    rerender(<ChatBubble />);
    expect(screen.queryByText("Looked at this week's transactions")).toBeNull();
  });
});
