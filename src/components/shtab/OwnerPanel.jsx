import Section from './Section';
import DelayCounter from './DelayCounter';
import { fmt } from '@/lib/shtab/calc';
import { PLAN_30 } from '@/lib/shtab/defaults';

export default function OwnerPanel({ state, a }) {
  const kpi = [
    ['Красных позиций', a.reds.length, true],
    ['Риск не закрыт запасом', fmt(a.risk), true],
    [`Потери при обрыве на ${state.params.breakDays} дн.`, fmt(a.loss), true],
    ['Ждут вашего решения', a.pending, true],
    ['1. Вклад в EBITDA в год', fmt(a.ebitda)],
    ['2. Деньги из оборота', fmt(a.cash)],
    ['3. Снижение риска в год', fmt(a.riskCut)],
    ['Шагов плана стабилизации', `${a.done30} из ${PLAN_30.length}`],
  ];
  return (
    <Section kicker="Собственнику · Панель" title="Всё на одном экране" note="Ничего вводить не нужно: цифры берутся из светофора, стресс теста и расчёта трёх цифр.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map(([k, v, risk]) => (
          <div key={k} className={`p-5 ${risk ? 'bg-graph text-cream border-b-8 border-rose' : 'bg-cream-paper border border-cream-2 border-b-8 border-b-mal'}`}>
            <p className={`text-[10px] font-extrabold uppercase tracking-[0.12em] ${risk ? 'text-rose-light' : 'text-mal'}`}>{k}</p>
            <p className="font-heading text-2xl sm:text-3xl font-extrabold mt-3 leading-tight">{v}</p>
          </div>
        ))}
      </div>
      <p className="mt-8 font-heading italic text-2xl max-w-3xl">
        {a.falling ? `При обрыве первой падает «${a.falling.name}». Цена бездействия за ${state.params.breakDays} дн.: ${fmt(a.loss)}.` : 'При выбранном сроке обрыва линия держится на запасах.'}
      </p>
      <div className="mt-8"><DelayCounter perDay={a.perDay} /></div>
    </Section>
  );
}