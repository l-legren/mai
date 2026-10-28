import type { TextUIPart, UIMessage } from 'ai';

function isTextPart(part: UIMessage['parts'][number]): part is TextUIPart {
  return part.type === 'text';
}

/** The latest user turn's plain text, used as the semantic-search query for relevant memories. */
export function latestUserMessageText(messages: UIMessage[]): string {
  const lastUserMessage = messages.filter((message) => message.role === 'user').at(-1);
  if (!lastUserMessage) {
    return '';
  }
  return lastUserMessage.parts
    .filter(isTextPart)
    .map((part) => part.text)
    .join(' ');
}
