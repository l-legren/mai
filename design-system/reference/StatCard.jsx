export function StatCard({ label, value, note, size = 'md' }) {
  const fs = size === 'lg' ? 46 : size === 'sm' ? 34 : 42;
  return (
    <div style={{ background: 'var(--mq-surface-raised)', border: '1px solid var(--mq-border)', borderRadius: 'var(--mq-r-lg)', padding: '22px 24px' }}>
      <div style={{ font: '600 11px var(--mq-font)', letterSpacing: '.8px', textTransform: 'uppercase', color: 'var(--mq-text-4)' }}>{label}</div>
      <div style={{ font: `700 ${fs}px var(--mq-font)`, color: 'var(--mq-text)', letterSpacing: '-1.3px', marginTop: 8 }}>{value}</div>
      {note && <div style={{ font: '400 13.5px var(--mq-font)', color: 'var(--mq-text-3)', marginTop: 4 }}>{note}</div>}
    </div>
  );
}
