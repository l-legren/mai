export function Field({ label, value, placeholder, focused = false, trailing, aside, hint }) {
  return (
    <div>
      {(label || aside) && (
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
          {label && <label style={{ font: '500 12.5px var(--mq-font)', color: 'var(--mq-text-3)' }}>{label}</label>}
          {aside && <span style={{ font: '500 12.5px var(--mq-font)', color: 'var(--mq-accent)', cursor: 'pointer' }}>{aside}</span>}
        </div>
      )}
      <div style={{ height: 54, borderRadius: 'var(--mq-r-md)', background: focused ? 'var(--mq-field-focus)' : 'var(--mq-field)', border: focused ? '1.5px solid var(--mq-accent)' : '1px solid var(--mq-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 16px', boxSizing: 'border-box' }}>
        <span style={{ font: '500 15px var(--mq-font)', color: value ? 'var(--mq-text)' : 'var(--mq-text-5)' }}>{value || placeholder}</span>
        {trailing && <span style={{ font: '500 12.5px var(--mq-font)', color: 'var(--mq-text-3)', cursor: 'pointer' }}>{trailing}</span>}
      </div>
      {hint && <div style={{ font: '400 12px var(--mq-font)', color: 'var(--mq-text-3)', marginTop: 9 }}>{hint}</div>}
    </div>
  );
}
