import type { UIMessage } from 'ai';

import { isAwaitingReply, turnsForAssistantMessage } from './ask-turns';

const t = (key: string) => key;

function textMessage(id: string, text: string): UIMessage {
  return { id, role: 'assistant', parts: [{ type: 'text', text }] } as UIMessage;
}

function rememberFactMessage(
  id: string,
  state: 'input-available' | 'output-available' | 'output-error',
  extra: Record<string, unknown> = {}
): UIMessage {
  return {
    id,
    role: 'assistant',
    parts: [
      {
        type: 'tool-rememberFact',
        toolCallId: 'call-1',
        state,
        input: { content: 'Wants to cut back on dining out' },
        ...extra,
      },
    ],
  } as unknown as UIMessage;
}

describe('turnsForAssistantMessage', () => {
  it('maps assistant text to an assistant turn with a status line once finished', () => {
    const message = {
      id: '1',
      role: 'assistant',
      parts: [
        { type: 'text', text: 'You spent €80 this week.' },
        { type: 'tool-getRecentSpending', toolCallId: 'x', state: 'output-available' },
      ],
    } as unknown as UIMessage;

    expect(turnsForAssistantMessage(message, true, t)).toEqual([
      {
        kind: 'assistant',
        lines: ['You spent €80 this week.'],
        statusLine: 'ask.statusLine.recentSpending',
      },
    ]);
  });

  it('omits the status line while the message is still streaming', () => {
    const message = {
      id: '1',
      role: 'assistant',
      parts: [
        { type: 'text', text: 'You spent €80 this week.' },
        { type: 'tool-getRecentSpending', toolCallId: 'x', state: 'output-available' },
      ],
    } as unknown as UIMessage;

    expect(turnsForAssistantMessage(message, false, t)).toEqual([
      { kind: 'assistant', lines: ['You spent €80 this week.'], statusLine: undefined },
    ]);
  });

  it('adds a confirm turn for a pending rememberFact proposal', () => {
    const message = rememberFactMessage('1', 'input-available');

    expect(turnsForAssistantMessage(message, true, t)).toEqual([
      { kind: 'confirm', content: 'Wants to cut back on dining out', toolCallId: 'call-1' },
    ]);
  });

  it('drops a rememberFact part whose input fails validation', () => {
    const message = rememberFactMessage('1', 'input-available', { input: { wrong: 'shape' } });

    expect(turnsForAssistantMessage(message, true, t)).toEqual([]);
  });

  it('resolves a saved rememberFact proposal to an assistant note', () => {
    const message = rememberFactMessage('1', 'output-available', { output: { saved: true } });

    expect(turnsForAssistantMessage(message, true, t)).toEqual([
      { kind: 'assistant', lines: ['ask.remember.saved'] },
    ]);
  });

  it('resolves a dismissed rememberFact proposal to an assistant note', () => {
    const message = rememberFactMessage('1', 'output-available', { output: { saved: false } });

    expect(turnsForAssistantMessage(message, true, t)).toEqual([
      { kind: 'assistant', lines: ['ask.remember.dismissed'] },
    ]);
  });

  it('surfaces a rememberFact save failure as an error turn', () => {
    const message = rememberFactMessage('1', 'output-error', { errorText: 'failed' });

    expect(turnsForAssistantMessage(message, true, t)).toEqual([
      { kind: 'error', message: 'ask.error' },
    ]);
  });

  it('maps a quotaExceeded part to an assistant turn', () => {
    const message = {
      id: '1',
      role: 'assistant',
      parts: [{ type: 'data-quotaExceeded', data: {} }],
    } as unknown as UIMessage;

    expect(turnsForAssistantMessage(message, true, t)).toEqual([
      { kind: 'assistant', lines: ['ask.quotaExceeded'] },
    ]);
  });
});

describe('isAwaitingReply', () => {
  it('is false once the chat is ready', () => {
    expect(isAwaitingReply('ready', textMessage('1', 'Hi'))).toBe(false);
  });

  it('is true right after sending, before any assistant message exists', () => {
    expect(isAwaitingReply('submitted', undefined)).toBe(true);
  });

  it('is true while streaming with no assistant content yet', () => {
    const empty = { id: '1', role: 'assistant', parts: [] } as unknown as UIMessage;
    expect(isAwaitingReply('streaming', empty)).toBe(true);
  });

  it('is false once assistant text has started streaming in', () => {
    expect(isAwaitingReply('streaming', textMessage('1', 'You spent'))).toBe(false);
  });

  it('is false once a quotaExceeded part has arrived', () => {
    const message = {
      id: '1',
      role: 'assistant',
      parts: [{ type: 'data-quotaExceeded', data: {} }],
    } as unknown as UIMessage;

    expect(isAwaitingReply('streaming', message)).toBe(false);
  });
});
