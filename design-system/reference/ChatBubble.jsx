export function ChatBubble({ from = 'agent', children, status }) {
  if (from === 'user') {
    return (
      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
        <div style={{ maxWidth: '70%', background: 'var(--mq-bubble)', borderRadius: '18px 18px 6px 18px', padding: '13px 17px', font: '400 15.5px/1.45 var(--mq-font)', color: 'var(--mq-text)' }}>{children}</div>
      </div>
    );
  }
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ font: '400 15.5px/1.55 var(--mq-font)', color: 'var(--mq-text)', textWrap: 'pretty' }}>{children}</div>
      {status && <div style={{ font: '500 12px var(--mq-font)', color: 'var(--mq-text-5)', paddingTop: 2 }}>{status}</div>}
    </div>
  );
}
