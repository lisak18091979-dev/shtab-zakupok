export default function Tabs({ tabs, tab, setTab }) {
  return (
    <div className="bg-cream-2/60 border-b border-cream-2 no-print">
      <div className="max-w-6xl mx-auto px-5 flex gap-1 overflow-x-auto">
        {tabs.map(([id, label]) => (
          <button
            key={id}
            onClick={() => setTab(id)}
            className={`shrink-0 px-4 py-3.5 text-[11px] font-extrabold uppercase tracking-[0.12em] border-b-[3px] transition-colors ${tab === id ? 'border-rose-deep text-graph' : 'border-transparent text-muted-foreground hover:text-graph'}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}