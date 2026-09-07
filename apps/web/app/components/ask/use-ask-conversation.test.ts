// @vitest-environment jsdom
import '@/i18n'; // initialises i18next so t() resolves real copy, not the raw key, in assertions below.
import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { sendAskMessage } from '@/lib/ask';
import { useAskConversation } from './use-ask-conversation';

vi.mock('@/lib/ask', () => ({ sendAskMessage: vi.fn() }));

afterEach(() => {
  vi.clearAllMocks();
});

describe('useAskConversation', () => {
  it('streams text deltas into the trailing assistant turn and appends it to the transcript', async () => {
    vi.mocked(sendAskMessage).mockImplementation(async (_messages, _today, onEvent) => {
      onEvent({ type: 'tool', toolName: 'getRecentSpending' });
      onEvent({ type: 'text', text: 'You spent ' });
      onEvent({ type: 'text', text: '€80 this week.' });
    });

    const { result } = renderHook(() => useAskConversation());

    act(() => result.current.sendMessage('How much did I spend this week?'));

    await waitFor(() => expect(result.current.isSending).toBe(false));

    expect(result.current.turns).toEqual([
      {
        kind: 'user',
        text: 'How much did I spend this week?',
        a11yLabel: 'You said: How much did I spend this week?',
      },
      {
        kind: 'assistant',
        text: 'You spent €80 this week.',
        statusLine: 'Looked at your recent spending',
      },
    ]);
  });

  it('replaces the loading placeholder with a visible error turn when the send fails before any text streams', async () => {
    vi.mocked(sendAskMessage).mockRejectedValue(new Error('network error'));
    vi.spyOn(console, 'error').mockImplementation(() => {});

    const { result } = renderHook(() => useAskConversation());

    act(() => result.current.sendMessage('How much did I spend this week?'));

    await waitFor(() => expect(result.current.isSending).toBe(false));

    expect(result.current.turns).toEqual([
      {
        kind: 'user',
        text: 'How much did I spend this week?',
        a11yLabel: 'You said: How much did I spend this week?',
      },
      { kind: 'error' },
    ]);
  });

  it('stop aborts an in-flight send and drops the placeholder without a visible error turn', async () => {
    let capturedSignal: AbortSignal | undefined;
    vi.mocked(sendAskMessage).mockImplementation(
      (_messages, _today, _onEvent, signal) =>
        new Promise((_resolve, reject) => {
          capturedSignal = signal;
          signal?.addEventListener('abort', () =>
            reject(new DOMException('Aborted', 'AbortError'))
          );
        })
    );

    const { result } = renderHook(() => useAskConversation());

    act(() => result.current.sendMessage('How much did I spend this week?'));
    await waitFor(() => expect(capturedSignal).toBeDefined());

    act(() => result.current.stop());
    await waitFor(() => expect(result.current.isSending).toBe(false));

    expect(result.current.turns).toEqual([
      {
        kind: 'user',
        text: 'How much did I spend this week?',
        a11yLabel: 'You said: How much did I spend this week?',
      },
    ]);
  });

  it('reset clears the transcript and aborts an in-flight send', async () => {
    let capturedSignal: AbortSignal | undefined;
    vi.mocked(sendAskMessage).mockImplementation(async (_messages, _today, _onEvent, signal) => {
      capturedSignal = signal;
      await new Promise(() => {}); // never resolves — reset() must abort it, not wait it out.
    });

    const { result } = renderHook(() => useAskConversation());

    act(() => result.current.sendMessage('How much did I spend this week?'));
    await waitFor(() => expect(capturedSignal).toBeDefined());

    act(() => result.current.reset());

    expect(capturedSignal?.aborted).toBe(true);
    expect(result.current.turns).toEqual([]);
    expect(result.current.isSending).toBe(false);
  });
});
