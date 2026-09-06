export function Pill({ children, dot = true }) {
  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: 9, border: '1px solid var(--mq-border-2)', borderRadius: 'var(--mq-r-pill)', padding: '7px 14px' }}>
      {dot && <span style={{ width: 6, height: 6, borderRadius: 3, background: 'var(--mq-accent)' }}></span>}
      <span style={{ font: '500 12.5px var(--mq-font)', color: 'var(--mq-text-2)' }}>{children}</span>
    </div>
  );
}
