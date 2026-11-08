export default function ChipGroup({ label, options, value, onChange, suffix = '' }) {
  return (
    <div>
      {label && <p className="text-[10px] font-extrabold uppercase tracking-[0.15em] text-muted-foreground mb-1.5">{label}</p>}
      <div className="flex flex-wrap gap-1.5">
        {options.map((o) => (
          <button
            key={o}
            onClick={() => onChange(o)}
            className={`px-3 py-1.5 text-xs font-extrabold border-2 transition-colors ${value === o ? 'bg-mal border-mal text-white' : 'border-graph hover:bg-graph hover:text-cream'}`}
          >
            {o}{suffix}
          </button>
        ))}
      </div>
    </div>
  );
}