// @vitest-environment jsdom
import '@/i18n';
import { cleanup, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

const sendMessage = vi.fn();
const stop = vi.fn();
const setMessages = vi.fn();
const clearError = vi.fn();
const addToolOutput = vi.fn();

vi.mock('@ai-sdk/react', () => ({ useChat: vi.fn() }));
vi.mock('@/lib/ask', () => ({ confirmMemory: vi.fn() }));

import { useChat } from '@ai-sdk/react';
import { confirmMemory } from '@/lib/ask';
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
    addToolOutput,
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
    mockUseChat({ messages: [textMessage('1', 'assistant', 'You spent €80 this week.')] });
    render(<AskChatView />);

    expect(screen.getByText('You spent €80 this week.')).not.toBeNull();
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

  it('shows the confirm gate for a pending rememberFact proposal and confirms it', async () => {
    mockUseChat({ messages: [rememberFactMessage('1', 'input-available')] });
    vi.mocked(confirmMemory).mockResolvedValue(undefined);
    render(<AskChatView />);

    expect(screen.getByText('Wants to cut back on dining out')).not.toBeNull();

    fireEvent.click(screen.getByRole('button', { name: 'Remember' }));

    await vi.waitFor(() =>
      expect(confirmMemory).toHaveBeenCalledWith('Wants to cut back on dining out')
    );
    expect(addToolOutput).toHaveBeenCalledWith({
      tool: 'rememberFact',
      toolCallId: 'call-1',
      output: { saved: true },
    });
  });

  it('dismisses a pending rememberFact proposal without calling confirmMemory', () => {
    mockUseChat({ messages: [rememberFactMessage('1', 'input-available')] });
    render(<AskChatView />);

    fireEvent.click(screen.getByRole('button', { name: 'Not now' }));

    expect(confirmMemory).not.toHaveBeenCalled();
    expect(addToolOutput).toHaveBeenCalledWith({
      tool: 'rememberFact',
      toolCallId: 'call-1',
      output: { saved: false },
    });
  });

  it('renders a saved note once the tool output resolves to saved', () => {
    mockUseChat({
      messages: [rememberFactMessage('1', 'output-available', { output: { saved: true } })],
    });
    render(<AskChatView />);

    expect(screen.getByText('Saved to memory.')).not.toBeNull();
    expect(screen.queryByRole('button', { name: 'Remember' })).toBeNull();
  });

  it('renders a dismissed note once the tool output resolves to not saved', () => {
    mockUseChat({
      messages: [rememberFactMessage('1', 'output-available', { output: { saved: false } })],
    });
    render(<AskChatView />);

    expect(screen.getByText("Okay, I won't remember that.")).not.toBeNull();
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
