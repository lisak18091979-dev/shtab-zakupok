import Section from './Section';
import { fmt } from '@/lib/shtab/calc';
import { PLAN_30, STEPS_72 } from '@/lib/shtab/defaults';
import CopyButton from './CopyButton';

export default function OwnerPanel({ state, a }) {
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const tasks = [
    ...PLAN_30.map(([, title], i) => ({ ...state.meta30?.[i], id: `p${i}`, title, status: state.meta30?.[i]?.status || (state.done30[i] ? 'Готово' : 'Не начато') })),
    ...STEPS_72.map(([, title], i) => ({ ...state.meta72?.[i], id: `h${i}`, title, status: state.meta72?.[i]?.status || (state.done72[i] ? 'Готово' : 'Не начато') })),
  ];
  const late = tasks.filter((t) => t.due && t.due < today && t.status !== 'Готово');
  const taskAttention = tasks.filter((t) => t.status !== 'Готово' && ((t.due && t.due <= today) || t.status === 'Ждёт решения'));
  const pending = state.decisions.filter((d) => d.status === 'Ждёт решения');
  const noOwner = a.reds.filter((r) => !r.owner?.trim()).length;
  const kpi = [
    ['Красных позиций', a.reds.length],
    ['Позиции с неполными данными', a.unknown.length],
    ['Красное без ответственного', noOwner],
    ['Просроченных шагов', late.length],
    ['Ждут решения собственника', pending.length],
    ['Шаги с препятствием', tasks.filter((t) => t.status === 'Ждёт решения').length],
    ['План стабилизации', `${a.done30} из ${PLAN_30.length}`],
    [state.params.breakDays == null ? 'Стресс-тест' : `Обрыв на ${state.params.breakDays} дн.`, state.params.breakDays == null ? 'Срок не выбран' : `${fmt(a.loss)}${a.lossUnknown ? ', неполная оценка' : ''}`],
  ];
  const actions = a.valid
    .filter((r) => r.status === 'red' || r.incomplete)
    .sort((x, y) => (x.status === 'red' ? 0 : 1) - (y.status === 'red' ? 0 : 1) || (x.stockKnown ? x.stock : Infinity) - (y.stockKnown ? y.stock : Infinity))
    .slice(0, 6);
  const actionText = [
    'Приоритетные позиции:',
    ...actions.map((r) => `${r.name} | ведёт: ${r.owner || 'не назначен'} | запас: ${r.stockKnown ? r.stock + ' дн.' : 'не известен'} | следующий шаг: ${r.nextStep || r.missing.join('; ') || 'не записан'}`),
    '',
    'Шаги на сегодня и препятствия:',
    ...taskAttention.map((t) => `${t.title} | ${t.owner || 'ответственный не назначен'} | срок ${t.due || 'не указан'} | ${t.blocker || t.status}`),
  ].join('\n');

  return (
    <Section kicker="Собственнику · Стабилизация" title="Удерживаем выпуск" note="Поставки с разрывом, непроверенные факты, исполнение плана и решения. Данные находятся в этом браузере, общего доступа между людьми нет. Для передачи собственнику используйте сводку или Excel.">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {kpi.map(([k, v], i) => (
          <div key={k} className={`p-5 ${i < 4 ? 'bg-graph text-cream border-b-8 border-rose' : 'bg-cream-paper border border-cream-2 border-b-8 border-b-mal'}`}>
            <p className={`text-[10px] font-extrabold uppercase tracking-[0.12em] ${i < 4 ? 'text-rose-light' : 'text-mal'}`}>{k}</p>
            <p className="font-heading text-2xl sm:text-3xl font-extrabold mt-3 leading-tight">{v}</p>
          </div>
        ))}
      </div>

      <div className="mt-8 border-2 border-graph bg-cream-paper p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="font-heading text-2xl font-bold">Что требует внимания сегодня</h3>
          <CopyButton text={actionText} label="Копировать для планёрки" />
        </div>
        {actions.length ? (
          <div className="mt-4 space-y-3">
            {actions.map((r) => (
              <div key={r.id} className={`border-l-4 bg-white p-3 ${r.status === 'red' ? 'border-[#9c1c1c]' : 'border-[#e7b84a]'}`}>
                <p className="font-extrabold">{r.name}</p>
                <p className="mt-1 text-sm">Ответственный: <b>{r.owner || 'не назначен'}</b>. {r.stockKnown ? `Запаса на ${r.stock} дн.` : 'Запас не известен.'} {r.replace != null ? `Замена через ${r.replace} дн.` : 'Срок замены не известен.'}</p>
                <p className="mt-1 text-sm">Следующий шаг: <b>{r.nextStep || 'не записан'}</b></p>
                {!!r.missing.length && <p className="mt-1 text-xs text-muted-foreground">Уточнить: {r.missing.join('; ')}.</p>}
              </div>
            ))}
          </div>
        ) : <p className="mt-3 text-sm text-muted-foreground">{a.valid.length ? 'В проверенных позициях нет красного и пробелов данных.' : 'Светофор пуст. Отсутствие записей не означает отсутствия риска: сначала подтвердите запас и сроки поставки.'}</p>}
      </div>

      <div className="mt-6 grid lg:grid-cols-2 gap-6">
        <div className="border-2 border-graph bg-cream-paper p-5">
          <h3 className="font-heading text-xl font-bold">Срок сегодня, срок прошёл или нужно решение</h3>
          <div className="mt-3 space-y-3">
            {taskAttention.length ? taskAttention.map((t) => (
              <div key={t.id} className="border-t border-cream-2 pt-3 text-sm">
                <p className="font-bold">{t.title}</p>
                <p className="mt-1">{t.owner || 'Ответственный не назначен'} · {t.due || 'Срок не указан'} · {t.status}</p>
                {t.blocker && <p className="mt-1 text-muted-foreground">Что мешает: {t.blocker}</p>}
              </div>
            )) : <p className="text-sm text-muted-foreground">Записанных шагов с истёкшим или сегодняшним сроком пока нет. Ответственных и сроки вносят во вкладках «План 30 дней» и «72 часа».</p>}
          </div>
        </div>
        <div className="border-2 border-graph bg-cream-paper p-5">
          <h3 className="font-heading text-xl font-bold">Решения собственника</h3>
          <div className="mt-3 space-y-3">
            {pending.length ? pending.map((d) => (
              <div key={d.id} className="border-t border-cream-2 pt-3 text-sm">
                <p className="font-bold">{d.text}</p>
                {d.comment && <p className="mt-1 text-muted-foreground">{d.comment}</p>}
              </div>
            )) : <p className="text-sm text-muted-foreground">Нерассмотренных запросов нет. Новые запросы вносят во вкладке «Решения».</p>}
          </div>
        </div>
      </div>
    </Section>
  );
}
