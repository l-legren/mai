export function Avatar({ initial = 'C', size = 30 }) {
  return (
    <div style={{ width: size, height: size, borderRadius: size / 2, background: 'var(--mq-accent-tint-strong)', display: 'flex', alignItems: 'center', justifyContent: 'center', font: `700 ${Math.round(size * 0.43)}px var(--mq-font)`, color: 'var(--mq-accent)', flex: 'none' }}>{initial}</div>
  );
}
