export function Menu({ items = [], activeIndex = -1 }) {
  return (
    <div style={{ background: 'var(--mq-hover)', borderRadius: 12, padding: 6, boxShadow: 'var(--mq-shadow-pop)', display: 'flex', flexDirection: 'column', gap: 2, minWidth: 200 }}>
      {items.map((it, i) => it === '-'
        ? <div key={i} style={{ height: 1, background: 'rgba(240,225,235,0.09)', margin: '4px 10px' }}></div>
        : <div key={i} role="button" style={{ display: 'flex', alignItems: 'center', height: 38, padding: '0 10px', borderRadius: 8, background: i === activeIndex ? 'var(--mq-fill)' : 'transparent', font: '500 13.5px var(--mq-font)', color: 'var(--mq-text)', cursor: 'pointer' }}>{it}</div>)}
    </div>
  );
}
