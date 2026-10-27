import type { UIMessage } from 'ai';
import { latestUserMessageText } from './latestUserMessageText.ts';

function userMessage(parts: UIMessage['parts']): UIMessage {
  return { id: 'm1', role: 'user', parts };
}

describe('latestUserMessageText', () => {
  it('returns the text of the latest user message', () => {
    const messages: UIMessage[] = [
      userMessage([{ type: 'text', text: 'first question' }]),
      { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'first answer' }] },
      userMessage([{ type: 'text', text: 'how much did I spend on rent' }]),
    ];

    expect(latestUserMessageText(messages)).toBe('how much did I spend on rent');
  });

  it('joins multiple text parts of the latest user message', () => {
    const messages: UIMessage[] = [
      userMessage([
        { type: 'text', text: 'saving for a house' },
        { type: 'text', text: 'down payment' },
      ]),
    ];

    expect(latestUserMessageText(messages)).toBe('saving for a house down payment');
  });

  it('ignores non-text parts', () => {
    const messages: UIMessage[] = [
      userMessage([
        { type: 'file', url: 'file://x', mediaType: 'text/plain' },
        { type: 'text', text: 'rent' },
      ]),
    ];

    expect(latestUserMessageText(messages)).toBe('rent');
  });

  it('returns an empty string when there is no user message', () => {
    const messages: UIMessage[] = [
      { id: 'a1', role: 'assistant', parts: [{ type: 'text', text: 'hi' }] },
    ];

    expect(latestUserMessageText(messages)).toBe('');
  });
});
