import Section from './Section';
import NumInput from './NumInput';
import { THREE_FIELDS, SCENARIOS } from '@/lib/shtab/defaults';
import { fmt } from '@/lib/shtab/calc';

export default function ThreeNumbers({ state, patch, a }) {
  const t = state.three;
  const set = (k, v) => patch('three', (x) => ({ ...x, [k]: v }));
  const active = Object.keys(SCENARIOS).find((n) => THREE_FIELDS.every(([k]) => SCENARIOS[n][k] === t[k]));
  const res = [
    ['1. Вклад в EBITDA в год', a.ebitda, `Экономия ${fmt((t.spend * t.price) / 100)} на бумаге, подтверждено ${t.real}%.`],
    ['2. Высвобождено из оборота', a.cash, `Единовременно. При ставке ${t.rate}% это ${fmt(a.interest)} процентов в год.`],
    ['3. Снижение риска в год', a.riskCut, `Дней срыва меньше на ${Math.max(0, t.d0 - t.d1)}, каждый стоит ${fmt(t.dayc)}.`],
  ];
  return (
    <Section kicker="Собственнику · Три цифры" title="Вместо «экономии к цене»" note="Директор по закупкам отчитывается вкладом в EBITDA, деньгами из оборота и риском в рублях."
      right={<div className="flex gap-1.5">{Object.keys(SCENARIOS).map((n) => (
        <button key={n} onClick={() => patch('three', { ...SCENARIOS[n] })} className={`px-3 py-1.5 text-xs font-extrabold border-2 ${active === n ? 'bg-mal border-mal text-white' : 'border-graph hover:bg-graph hover:text-cream'}`}>{n}</button>
      ))}</div>}>
      <div className="grid md:grid-cols-3 gap-4">
        {res.map(([k, v, n]) => (
          <div key={k} className="bg-gradient-to-br from-[#3a3d43] to-graph text-cream p-6 border-b-8 border-rose">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em]">{k}</p>
            <p className="font-heading text-4xl font-extrabold text-rose-light mt-2">{fmt(v)}</p>
            <p className="text-xs text-cream/70 mt-2">{n}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm"><b>Совокупный эффект:</b> {fmt(a.total)} в год, то есть {a.perDay.toLocaleString('ru-RU')} ₽ в сутки.</p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {THREE_FIELDS.map(([k, label, hint, step]) => <NumInput key={k} label={label} hint={hint} step={step} value={t[k]} onChange={(v) => set(k, v)} />)}
      </div>
    </Section>
  );
}