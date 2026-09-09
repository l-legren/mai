const SIZES = { sm: { h: 38, px: 15, fs: 13 }, md: { h: 42, px: 20, fs: 14 }, lg: { h: 54, px: 28, fs: 15.5 } };

export function Button({ variant = 'primary', size = 'md', full = false, children, onClick }) {
  const s = SIZES[size] || SIZES.md;
  const base = {
    height: s.h, borderRadius: s.h / 2, padding: full ? 0 : `0 ${s.px}px`, border: 'none',
    display: 'flex', alignItems: 'center', justifyContent: 'center', width: full ? '100%' : 'auto',
    font: `600 ${s.fs}px var(--mq-font)`, cursor: 'pointer', boxSizing: 'border-box', whiteSpace: 'nowrap'
  };
  const looks = {
    primary: { background: 'var(--mq-accent)', color: 'var(--mq-accent-ink)' },
    secondary: { background: 'var(--mq-fill)', color: 'var(--mq-text-2)', fontWeight: 500 },
    outline: { background: 'transparent', color: 'var(--mq-text)', border: '1px solid var(--mq-border-3)' },
    quiet: { background: 'transparent', color: 'var(--mq-text-2)', border: '1px solid var(--mq-border-2)', fontWeight: 500 }
  };
  return <button style={{ ...base, ...(looks[variant] || looks.primary) }} onClick={onClick}>{children}</button>;
}
