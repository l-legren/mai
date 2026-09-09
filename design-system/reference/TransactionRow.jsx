export function TransactionRow({ name, meta, amount, past = false, divider = true }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '14px 24px', borderTop: divider ? '1px solid rgba(240,225,235,0.06)' : 'none', opacity: past ? 0.62 : 1 }}>
      <div style={{ width: 38, height: 38, borderRadius: 19, background: 'var(--mq-fill)', flex: 'none' }}></div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ font: '500 15px var(--mq-font)', color: 'var(--mq-text)' }}>{name}</div>
        {meta && <div style={{ font: '400 12.5px var(--mq-font)', color: 'var(--mq-text-4)', marginTop: 3 }}>{meta}</div>}
      </div>
      <div style={{ font: '600 15px var(--mq-font)', color: 'var(--mq-text)' }}>{amount}</div>
    </div>
  );
}
