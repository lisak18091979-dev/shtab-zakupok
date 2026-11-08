import { ACTIONS } from '@/lib/shtab/defaults';
import { fmt } from '@/lib/shtab/calc';

export default function TodayCard({ a, people }) {
  return (
    <div className="grid md:grid-cols-[1.4fr_1fr] gap-4">
      <div className="bg-graph text-cream p-6 border-b-8 border-rose">
        <p className="text-[10px] font-extrabold tracking-[0.2em] text-rose-light">СЕГОДНЯ БЕРУ В РАБОТУ</p>
        <p className="font-heading text-3xl font-bold mt-2">{a.today ? a.today.name : 'Красного нет'}</p>
        <p className="mt-2 text-sm text-cream/75">{a.today ? `${ACTIONS.red} Риск ${fmt(a.today.risk)}.` : 'Держим жёлтое на неделе, зелёное не трогаем.'}</p>
      </div>
      <div className="grid grid-cols-3 gap-px bg-cream-2 border border-cream-2">
        {[['Красных', a.reds.length], ['Жёлтых', a.valid.length - a.reds.length - a.greens], ['Не трогать', a.greens]].map(([k, v]) => (
          <div key={k} className="bg-cream-paper p-4 flex flex-col justify-between">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em] text-muted-foreground">{k}</p>
            <p className="font-heading text-4xl font-extrabold">{v}</p>
          </div>
        ))}
        <p className={`col-span-3 bg-cream-paper px-4 py-2 text-xs font-bold ${a.overload ? 'text-[#9c1c1c]' : 'text-mal'}`}>
          {a.overload ? `Перегруз: ${a.reds.length} красных на ${people} чел. Просите помощь или режьте список.` : `Не больше трёх красных на человека. Нагрузка держится.`}
        </p>
      </div>
    </div>
  );
}