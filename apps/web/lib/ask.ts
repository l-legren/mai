/**
 * Browser-side call to this app's own `/api/ask-mai/remember` proxy route (not the agent service
 * directly — see that route's doc comment). The streaming side of Ask Mai (`/api/ask-mai` itself)
 * is handled by `useChat` (see AskChatView.tsx) — this is only the separate, non-streaming
 * confirm-persist call for a `rememberFact` proposal.
 */

export async function confirmMemory(content: string): Promise<void> {
  const response = await fetch('/api/ask-mai/remember', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ content }),
  });
  if (!response.ok) throw new Error(`ask-mai remember request failed (${response.status})`);
}
