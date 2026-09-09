function Spark({ size = 15 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M11.1 3.4a.6.6 0 0 1 1.13 0l1.1 2.94a3 3 0 0 0 1.77 1.77l2.94 1.1a.6.6 0 0 1 0 1.13l-2.94 1.1a3 3 0 0 0-1.77 1.77l-1.1 2.94a.6.6 0 0 1-1.13 0l-1.1-2.94a3 3 0 0 0-1.77-1.77l-2.94-1.1a.6.6 0 0 1 0-1.13l2.94-1.1a3 3 0 0 0 1.77-1.77z"></path>
    </svg>
  );
}

export function AgentNote({ message, primaryLabel = 'Do it', secondaryLabel = 'Talk about it', showActions = true, showByline = true }) {
  return (
    <div style={{ background: 'var(--mq-surface-accent)', border: '1px solid var(--mq-accent-border)', borderRadius: 'var(--mq-r-lg)', padding: '20px 22px', display: 'flex', flexDirection: 'column', gap: 12 }}>
      {showByline && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ color: 'var(--mq-accent)', display: 'flex' }}><Spark /></span>
          <span style={{ font: '600 12.5px var(--mq-font)', color: 'var(--mq-text-2)' }}>Mai</span>
        </div>
      )}
      <div style={{ font: '400 14.5px/1.5 var(--mq-font)', color: 'var(--mq-text)', textWrap: 'pretty' }}>{message}</div>
      {showActions && (
        <div style={{ display: 'flex', gap: 8 }}>
          <div role="button" style={{ height: 38, padding: '0 16px', borderRadius: 19, background: 'var(--mq-accent)', display: 'flex', alignItems: 'center', font: '600 13.5px var(--mq-font)', color: 'var(--mq-accent-ink)', cursor: 'pointer' }}>{primaryLabel}</div>
          <div role="button" style={{ height: 38, padding: '0 16px', borderRadius: 19, background: 'var(--mq-fill)', display: 'flex', alignItems: 'center', font: '500 13.5px var(--mq-font)', color: 'var(--mq-text-2)', cursor: 'pointer' }}>{secondaryLabel}</div>
        </div>
      )}
    </div>
  );
}
