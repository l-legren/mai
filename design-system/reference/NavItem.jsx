const PATHS = {
  home: ['M4 10.5 12 4l8 6.5V19a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1z', 'M9.5 20v-5.5h5V20'],
  recurring: ['M4 8h13l-3-3', 'M20 16H7l3 3'],
  insights: ['M5 20v-6', 'M12 20V8', 'M19 20V4']
};

function Icon({ name, size = 19 }) {
  if (name === 'agent') {
    return (
      <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
        <path d="M11.1 3.4a.6.6 0 0 1 1.13 0l1.1 2.94a3 3 0 0 0 1.77 1.77l2.94 1.1a.6.6 0 0 1 0 1.13l-2.94 1.1a3 3 0 0 0-1.77 1.77l-1.1 2.94a.6.6 0 0 1-1.13 0l-1.1-2.94a3 3 0 0 0-1.77-1.77l-2.94-1.1a.6.6 0 0 1 0-1.13l2.94-1.1a3 3 0 0 0 1.77-1.77z"></path>
        <path d="M18.4 15.2a.4.4 0 0 1 .75 0l.5 1.32a1.6 1.6 0 0 0 .94.94l1.31.49a.4.4 0 0 1 0 .75l-1.31.49a1.6 1.6 0 0 0-.94.94l-.5 1.32a.4.4 0 0 1-.75 0l-.49-1.32a1.6 1.6 0 0 0-.94-.94l-1.32-.49a.4.4 0 0 1 0-.75l1.32-.49a1.6 1.6 0 0 0 .94-.94z"></path>
      </svg>
    );
  }
  const d = PATHS[name] || PATHS.home;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round">
      {d.map((p, i) => <path key={i} d={p}></path>)}
    </svg>
  );
}

export function NavItem({ icon = 'home', label, active = false, count, dot = false, collapsed = false }) {
  const color = active ? 'var(--mq-accent)' : 'var(--mq-text-2)';
  if (collapsed) {
    return (
      <div role="button" style={{ width: 44, height: 44, borderRadius: 12, background: active ? 'var(--mq-accent-tint)' : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', color: active ? 'var(--mq-accent)' : '#8E888E', position: 'relative', cursor: 'pointer' }}>
        <Icon name={icon} />
        {dot && <span style={{ position: 'absolute', top: 9, right: 10, width: 6, height: 6, borderRadius: 3, background: 'var(--mq-accent)' }}></span>}
      </div>
    );
  }
  return (
    <div role="button" style={{ display: 'flex', alignItems: 'center', gap: 12, height: 44, padding: '0 12px', borderRadius: 'var(--mq-r-sm)', background: active ? 'var(--mq-accent-tint)' : 'transparent', cursor: 'pointer' }}>
      <span style={{ color: active ? 'var(--mq-accent)' : '#8E888E', display: 'flex' }}><Icon name={icon} /></span>
      <span style={{ font: `${active ? 600 : 500} 14.5px var(--mq-font)`, color: active ? 'var(--mq-text)' : color }}>{label}</span>
      {count != null && <span style={{ marginLeft: 'auto', font: '500 12px var(--mq-font)', color: 'var(--mq-text-4)' }}>{count}</span>}
      {dot && <span style={{ marginLeft: 'auto', width: 6, height: 6, borderRadius: 3, background: 'var(--mq-accent)' }}></span>}
    </div>
  );
}
