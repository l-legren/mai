export function Logo({ size = 'md', showName = true }) {
  const s = size === 'lg' ? 30 : size === 'sm' ? 26 : 28;
  const t = size === 'lg' ? 19 : size === 'sm' ? 17 : 17;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: s > 28 ? 11 : 10 }}>
      <div style={{ width: s, height: s, borderRadius: s > 28 ? 9 : 8, background: 'var(--mq-accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `800 ${Math.round(s / 2)}px var(--mq-font)`, color: 'var(--mq-accent-ink)' }}>M</div>
      {showName && <span style={{ font: `700 ${t}px var(--mq-font)`, color: 'var(--mq-text)', letterSpacing: '-0.3px' }}>Mai</span>}
    </div>
  );
}
