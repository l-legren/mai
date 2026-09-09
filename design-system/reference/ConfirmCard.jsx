export function ConfirmCard({ title, from, to, when, footnote, primaryLabel = 'Do it', secondaryLabel = 'Leave it' }) {
  return (
    <div style={{ background: 'var(--mq-field)', border: '1px solid rgba(240,225,235,0.09)', borderRadius: 'var(--mq-r-lg)', overflow: 'hidden' }}>
      <div style={{ padding: '16px 18px 14px', display: 'flex', flexDirection: 'column', gap: 12 }}>
        <div style={{ font: '600 14px var(--mq-font)', color: 'var(--mq-text)' }}>{title}</div>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 10 }}>
          <span style={{ font: '500 19px var(--mq-font)', color: 'var(--mq-text-5)', textDecoration: 'line-through' }}>{from}</span>
          <span style={{ font: '400 15px var(--mq-font)', color: 'var(--mq-text-5)' }}>&rarr;</span>
          <span style={{ font: '700 24px var(--mq-font)', color: 'var(--mq-text)', letterSpacing: '-0.4px' }}>{to}</span>
          {when && <span style={{ font: '400 13px var(--mq-font)', color: 'var(--mq-text-3)', marginLeft: 'auto' }}>{when}</span>}
        </div>
        {footnote && <div style={{ font: '400 12.5px/1.45 var(--mq-font)', color: 'var(--mq-text-4)' }}>{footnote}</div>}
      </div>
      <div style={{ display: 'flex', gap: 8, padding: '0 14px 14px' }}>
        <div role="button" style={{ height: 42, padding: '0 22px', borderRadius: 21, background: 'var(--mq-accent)', display: 'flex', alignItems: 'center', font: '600 14px var(--mq-font)', color: 'var(--mq-accent-ink)', cursor: 'pointer' }}>{primaryLabel}</div>
        <div role="button" style={{ height: 42, padding: '0 20px', borderRadius: 21, background: 'var(--mq-fill)', display: 'flex', alignItems: 'center', font: '500 14px var(--mq-font)', color: 'var(--mq-text-2)', cursor: 'pointer' }}>{secondaryLabel}</div>
      </div>
    </div>
  );
}
