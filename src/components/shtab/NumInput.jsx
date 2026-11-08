export default function NumInput({ label, hint, value, step = 1, onChange }) {
  const set = (v) => onChange(Math.max(0, +(+v).toFixed(2)));
  return (
    <div className="bg-graph text-cream p-4 border-t-4 border-rose">
      <p className="text-[11px] font-extrabold uppercase tracking-[0.12em] text-rose-light">{label}</p>
      {hint && <p className="text-xs text-cream/55 mt-1 min-h-[2rem]">{hint}</p>}
      <div className="flex mt-2">
        <button onClick={() => set(value - step)} className="w-10 bg-rose-deep text-white font-extrabold text-lg hover:bg-rose transition-colors">−</button>
        <input type="number" value={value} onChange={(e) => onChange(+e.target.value || 0)} className="flex-1 min-w-0 text-center font-extrabold text-lg bg-cream text-graph py-2 outline-none" />
        <button onClick={() => set(value + step)} className="w-10 bg-rose-deep text-white font-extrabold text-lg hover:bg-rose transition-colors">+</button>
      </div>
    </div>
  );
}