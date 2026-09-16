export function Logo({ size = 'md', showName = true }) {
  const h = size === 'lg' ? 40 : size === 'sm' ? 32 : 36;
  return (
    <div style={{ display: 'flex', alignItems: 'center' }}>
      <svg viewBox="0 0 48 80" style={{ height: h, width: 'auto', display: showName ? 'none' : 'block', color: 'var(--mq-text)' }}>
        <text x="2" y="55" fontFamily="var(--mq-font)" fontSize="48" fontWeight="800" letterSpacing="-1.2" fill="currentColor">m</text>
        <rect x="0" y="61" width="47" height="5" rx="2.5" fill="var(--mq-accent)" />
      </svg>
      {showName && (
        <svg viewBox="0 0 88 80" style={{ height: h, width: 'auto', color: 'var(--mq-text)' }}>
          <text x="2" y="55" fontFamily="var(--mq-font)" fontSize="48" fontWeight="800" letterSpacing="-1.2" fill="currentColor">maı</text>
          <circle cx="79" cy="15" r="4" fill="var(--mq-accent)" />
          <rect x="0" y="61" width="87" height="5" rx="2.5" fill="var(--mq-accent)" />
        </svg>
      )}
    </div>
  );
}
