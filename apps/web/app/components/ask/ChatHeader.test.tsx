// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import ChatHeader from './ChatHeader';

afterEach(cleanup);

describe('ChatHeader', () => {
  it('shows "Nothing yet" and no End chat button when there is no conversation', () => {
    render(<ChatHeader hasConversation={false} onEndChat={vi.fn()} />);

    expect(screen.getByText('Nothing yet')).toBeTruthy();
    expect(screen.queryByRole('button', { name: /end chat/i })).toBeNull();
  });

  it('shows the End chat button once there is a conversation, and fires onEndChat on click', () => {
    const onEndChat = vi.fn();
    render(<ChatHeader hasConversation onEndChat={onEndChat} />);

    expect(screen.queryByText('Nothing yet')).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: /end chat/i }));

    expect(onEndChat).toHaveBeenCalledTimes(1);
  });
});
