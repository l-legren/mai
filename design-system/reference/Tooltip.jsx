export function Tooltip({ label, children, side = 'right' }) {
  const pos = side === 'right' ? { left: 52 } : { bottom: 52 };
  return (
    <div style={{ position: 'relative', display: 'inline-flex', alignItems: 'center' }}>
      {children}
      <div style={{ position: 'absolute', ...pos, whiteSpace: 'nowrap', background: 'var(--mq-hover)', borderRadius: 'var(--mq-r-xs)', padding: '7px 11px', font: '500 12.5px var(--mq-font)', color: 'var(--mq-text)', boxShadow: 'var(--mq-shadow-tip)', zIndex: 2 }}>{label}</div>
    </div>
  );
}
