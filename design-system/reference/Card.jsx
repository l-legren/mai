export function Card({ title, action, accent = false, flush = false, children }) {
  return (
    <div style={{ background: accent ? 'var(--mq-surface-accent)' : 'var(--mq-surface-raised)', border: `1px solid ${accent ? 'var(--mq-accent-border)' : 'var(--mq-border)'}`, borderRadius: 'var(--mq-r-lg)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
      {(title || action) && (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '18px 24px 14px' }}>
          <span style={{ font: '600 15px var(--mq-font)', color: 'var(--mq-text)' }}>{title}</span>
          {action && <span style={{ font: '500 13px var(--mq-font)', color: 'var(--mq-text-3)', cursor: 'pointer' }}>{action}</span>}
        </div>
      )}
      <div style={{ padding: flush ? 0 : title ? '0 24px 20px' : '20px 22px' }}>{children}</div>
    </div>
  );
}
