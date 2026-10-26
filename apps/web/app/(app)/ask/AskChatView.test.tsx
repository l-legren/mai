// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const sendMessage = vi.fn();
const stop = vi.fn();
const setMessages = vi.fn();
const clearError = vi.fn();
vi.mock('@ai-sdk/react', () => ({ useChat: vi.fn() }));

import { useChat } from '@ai-sdk/react';
import AskChatView from './AskChatView';

afterEach(cleanup);

type MockUseChatOptions = {
  messages?: unknown[];
  status?: 'submitted' | 'streaming' | 'ready' | 'error';
  error?: Error;
};

function mockUseChat({ messages = [], status = 'ready', error }: MockUseChatOptions = {}) {
  vi.mocked(useChat).mockReturnValue({
    messages,
    status,
    error,
    sendMessage,
    stop,
    setMessages,
    clearError,
  } as never);
}

function textMessage(id: string, role: 'user' | 'assistant', text: string) {
  return { id, role, parts: [{ type: 'text', text }] };
}

function rememberFactMessage(
  id: string,
  state: 'input-available' | 'output-available' | 'output-error',
  extra: Record<string, unknown> = {}
) {
  return {
    id,
    role: 'assistant' as const,
    parts: [
      {
        type: 'tool-rememberFact',
        toolCallId: 'call-1',
        state,
        input: { content: 'Wants to cut back on dining out' },
        ...extra,
      },
    ],
  };
}

describe('AskChatView', () => {
  it('shows the empty state and starter prompts with no messages', () => {
    mockUseChat();
    render(<AskChatView />);

    expect(screen.getByText('Ask me anything about your money.')).not.toBeNull();
  });

  it('sends the selected starter prompt', () => {
    mockUseChat();
    render(<AskChatView />);

    fireEvent.click(screen.getByRole('button', { name: 'How much have I spent this week?' }));

    expect(clearError).toHaveBeenCalled();
    expect(sendMessage).toHaveBeenCalledWith({ text: 'How much have I spent this week?' });
  });

  it('renders a user message with the a11y label carrying the announcement', () => {
    mockUseChat({ messages: [textMessage('1', 'user', 'How much did I spend?')] });
    render(<AskChatView />);

    expect(screen.getByRole('group', { name: 'You said: How much did I spend?' })).not.toBeNull();
  });

  it('renders assistant text in a bubble', () => {
    mockUseChat({ messages: [textMessage('1', 'assistant', 'You spent less this week.')] });
    render(<AskChatView />);

    expect(screen.getByText('You spent less this week.')).not.toBeNull();
  });

  it('shows the thinking row while a reply is streaming with no content yet', () => {
    mockUseChat({ messages: [textMessage('1', 'user', 'Hi')], status: 'submitted' });
    render(<AskChatView />);

    expect(screen.getByRole('status')).not.toBeNull();
    expect(screen.getByRole('textbox', { name: 'Ask about your money…' })).toHaveProperty(
      'disabled',
      true
    );
  });

  it('renders nothing for a rememberFact call still in flight', () => {
    mockUseChat({ messages: [rememberFactMessage('1', 'input-available')] });
    render(<AskChatView />);

    expect(screen.queryByText('Saved to memory.')).toBeNull();
    expect(screen.queryByRole('alert')).toBeNull();
  });

  it('renders a saved note once rememberFact resolves — it saves immediately, no confirm step', () => {
    mockUseChat({
      messages: [rememberFactMessage('1', 'output-available', { output: { saved: true } })],
    });
    render(<AskChatView />);

    expect(screen.getByText('Saved to memory.')).not.toBeNull();
  });

  it('renders an error line when saving the memory failed', () => {
    mockUseChat({
      messages: [rememberFactMessage('1', 'output-error', { errorText: 'failed' })],
    });
    render(<AskChatView />);

    expect(screen.getByRole('alert').textContent).toBe('Something went wrong. Please try again.');
  });

  it('clears the conversation and stops any in-flight request on End chat', () => {
    mockUseChat({ messages: [textMessage('1', 'user', 'Hi')] });
    render(<AskChatView />);

    fireEvent.click(screen.getByRole('button', { name: 'End chat, clear the conversation' }));

    expect(stop).toHaveBeenCalled();
    expect(setMessages).toHaveBeenCalledWith([]);
  });
});
