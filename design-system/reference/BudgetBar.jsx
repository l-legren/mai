export function BudgetBar({ category, spent, limit, currency = '€' }) {
  const pct = Math.min(100, Math.round((spent / limit) * 100));
  const over = spent > limit;
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span style={{ font: '500 13.5px var(--mq-font)', color: 'var(--mq-text-2)' }}>{category}</span>
        <span style={{ font: '500 13.5px var(--mq-font)', color: 'var(--mq-text)' }}>{currency}{spent} / {limit}</span>
      </div>
      <div style={{ height: 5, borderRadius: 3, background: 'var(--mq-track)', overflow: 'hidden' }}>
        <div style={{ width: pct + '%', height: '100%', background: over ? 'var(--mq-over)' : 'var(--mq-accent)' }}></div>
      </div>
    </div>
  );
}
