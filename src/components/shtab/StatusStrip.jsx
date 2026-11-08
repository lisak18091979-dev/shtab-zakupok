import { LEVELS } from '@/lib/shtab/defaults';
import { fmt } from '@/lib/shtab/calc';

export default function StatusStrip({ a, state }) {
  const lv = LEVELS[a.level];
  const items = [
    ['Красных', `${a.reds.length} на ${state.params.people} чел.`],
    ['Риск не закрыт', fmt(a.risk)],
    [`Обрыв на ${state.params.breakDays} дн.`, fmt(a.loss)],
    ['Ждут решения', a.pending],
  ];
  return (
    <div className={`${lv.cls} text-white transition-colors duration-500`}>
      <div className="max-w-6xl mx-auto px-5 py-4 flex flex-wrap items-center justify-between gap-x-8 gap-y-3">
        <p className="text-xs font-extrabold tracking-[0.2em]">{lv.label}</p>
        <div className="flex flex-wrap gap-x-7 gap-y-2">
          {items.map(([k, v]) => (
            <div key={k}>
              <p className="text-[10px] uppercase tracking-[0.14em] opacity-75">{k}</p>
              <p className="font-heading text-lg font-bold leading-tight">{v}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}