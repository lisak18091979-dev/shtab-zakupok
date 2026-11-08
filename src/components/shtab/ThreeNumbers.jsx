import Section from './Section';
import NumInput from './NumInput';
import { THREE_FIELDS } from '@/lib/shtab/defaults';
import { fmt } from '@/lib/shtab/calc';

export default function ThreeNumbers({ state, patch, a }) {
  const t = state.three;
  const set = (k, v) => patch('three', (x) => ({ ...x, [k]: v }));
  const ready = {
    ebitda: ['spend', 'price', 'real'].every((k) => t[k] != null),
    cash: ['spend', 'defer', 'stock', 'rate'].every((k) => t[k] != null),
    risk: ['d0', 'd1', 'dayc'].every((k) => t[k] != null),
  };
  const res = [
    ['1. Вклад в EBITDA в год', a.ebitda, ready.ebitda ? `Экономия ${fmt((t.spend * t.price) / 100)} на бумаге, подтверждено ${t.real}%.` : 'Не рассчитано. Заполните исходные данные ниже.'],
    ['2. Высвобождено из оборота', a.cash, ready.cash ? `Единовременно. При ставке ${t.rate}% это ${fmt(a.interest)} процентов в год.` : 'Не рассчитано. Заполните исходные данные ниже.'],
    ['3. Снижение риска в год', a.riskCut, ready.risk ? `Дней срыва меньше на ${Math.max(0, t.d0 - t.d1)}, каждый стоит ${fmt(t.dayc)}.` : 'Не рассчитано. Заполните исходные данные ниже.'],
  ];
  return (
    <Section kicker="Собственнику · Финансовый расчёт" title="Финансовый эффект отдельно от стабилизации" note="EBITDA (прибыль до налогов, процентов и амортизации), оборотный капитал и сценарное снижение риска. Эти показатели не доказывают устойчивость поставок. Все исходные значения вносите вы.">
      <div className="grid md:grid-cols-3 gap-4">
        {res.map(([k, v, n]) => (
          <div key={k} className="bg-gradient-to-br from-[#3a3d43] to-graph text-cream p-6 border-b-8 border-rose">
            <p className="text-[10px] font-extrabold uppercase tracking-[0.12em]">{k}</p>
            <p className="font-heading text-3xl sm:text-4xl font-extrabold text-rose-light mt-2">{ready[k.startsWith('1.') ? 'ebitda' : k.startsWith('2.') ? 'cash' : 'risk'] ? fmt(v) : 'Не рассчитано'}</p>
            <p className="text-xs text-cream/70 mt-2">{n}</p>
          </div>
        ))}
      </div>
      <p className="mt-5 text-sm"><b>Не складывайте эти показатели автоматически.</b> Подтверждённая экономия, высвобождение денег и сценарное снижение риска имеют разную природу. Проверку на двойной счёт проводите с финансами.</p>
      <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {THREE_FIELDS.map(([k, label, hint, step]) => <NumInput key={k} label={label} hint={hint} step={step} value={t[k]} onChange={(v) => set(k, v)} />)}
      </div>
    </Section>
  );
}