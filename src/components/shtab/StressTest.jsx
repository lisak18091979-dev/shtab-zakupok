import { useState } from 'react';
import Section from './Section';
import ChipGroup from './ChipGroup';
import CopyButton from './CopyButton';
import { fmt, fmtNum } from '@/lib/shtab/calc';

export default function StressTest({ state, patch, a }) {
  const days = state.params.breakDays;
  const [filter, setFilter] = useState('Все позиции');
  const [order, setOrder] = useState('По запасу');
  const ready = days != null && a.valid.length > 0;
  const known = a.valid.filter((r) => r.loss != null);
  const first = ready ? a.valid.filter((r) => r.stockKnown && days > r.stock && ['Остановит линию', 'Замедлит'].includes(r.effect)).sort((x, y) => x.stock - y.stock)[0] : null;
  let rows = a.valid.filter((r) => filter === 'Все позиции' || (filter === 'Не оценены' ? r.loss == null : r.loss > 0));
  rows = [...rows].sort(order === 'По запасу' ? (x, y) => (x.stockKnown ? x.stock : Infinity) - (y.stockKnown ? y.stock : Infinity) : (x, y) => (y.loss ?? -1) - (x.loss ?? -1));
  const assessment = !ready ? 'Не рассчитано' : !known.length ? 'Не оценено' : `${fmt(a.loss)}${a.lossUnknown ? ' · частично' : ''}`;
  const brief = !ready ? 'Добавьте позиции и выберите срок обрыва.' : `Сценарий: нет поставок ${days} дн. Оценённые потери: ${known.length ? fmt(a.loss) : 'нет данных'}${a.lossUnknown ? `. Не оценено позиций: ${a.lossUnknown}` : ''}. ${first ? `Первое ограничение выпуска: ${first.name}, запас ${fmtNum(first.stock)} дн.` : 'По заполненным данным ограничений в выбранном периоде нет.'} Это расчёт по допущениям, а не подтверждённый ущерб.`;
  return (
    <Section kicker="Закупщику · Стресс тест" title="Если поставки оборвутся"
      note="Проверка выбранного сценария, а не прогноз. Считаем дни после исчерпания запаса и потери по каждой позиции. Неоценённые позиции не скрываем."
      right={<ChipGroup label="Нет новых поставок" options={[3, 7, 14, 30]} value={days} suffix=" дн." onChange={(v) => patch('params', (p) => ({ ...p, breakDays: v }))} />}>
      {!a.valid.length ? <div className="bg-cream-paper border border-cream-2 p-8 sm:p-12"><p className="kicker">Расчёт ещё не начат</p><h3 className="font-heading text-2xl mt-3">Сначала внесите позиции в светофор</h3><p className="text-sm text-muted-foreground mt-3 max-w-xl">Нужны запас, влияние на выпуск и согласованная цена дня простоя. Или нажмите «Загрузить пример», чтобы посмотреть механику на условных данных.</p></div> : <>
        <div className="grid lg:grid-cols-3 gap-4">
          <div className="bg-graph text-cream p-6 sm:p-7 border-b-4 border-rose">
            <p className="result-label">Оценённые потери сценария</p>
            <p className="font-heading text-3xl font-bold mt-4 text-rose-light">{assessment}</p>
            <p className="text-xs text-cream/70 mt-4 leading-relaxed">{!ready ? 'Срок обрыва пока не выбран.' : a.lossUnknown ? `В сумму не вошли позиции с неполными данными: ${a.lossUnknown}.` : 'Все внесённые позиции оценены для этого сценария.'}</p>
          </div>
          <div className="bg-cream-paper border border-cream-2 p-6 sm:p-7">
            <p className="kicker">Первое ограничение выпуска</p>
            <p className="font-heading text-xl font-bold mt-4 leading-snug">{!ready ? 'Выберите срок обрыва' : first ? first.name : a.lossUnknown ? 'Сначала уточните данные' : 'В этом периоде не выявлено'}</p>
            {first && <p className="text-sm text-muted-foreground mt-3">Запаса хватит на {fmtNum(first.stock)} дн. · {first.effect}</p>}
          </div>
          <div className="bg-mal text-white p-6 sm:p-7 flex flex-col justify-between gap-5">
            <div><p className="text-[10px] font-extrabold tracking-[0.16em] opacity-70">КАК ЧИТАТЬ РЕЗУЛЬТАТ</p><p className="text-sm mt-4 leading-relaxed">Дни без запаса × согласованные потери за день × доля потери мощности. Для полной остановки доля равна единице. Это не вся дневная выручка автоматически.</p></div>
            <CopyButton text={brief} label="Копировать вывод" className="inline-flex items-center gap-2 border border-white/50 px-4 py-3 text-xs font-bold hover:bg-white/10" />
          </div>
        </div>
        <div className="mt-7 border border-cream-2 bg-cream-paper">
          <div className="p-5 sm:p-6 flex flex-wrap items-end justify-between gap-5 border-b border-cream-2">
            <div><p className="kicker">Последствия по позициям</p><p className="text-xs text-muted-foreground mt-2">Без полос, шкал и ползунков. Только проверяемые значения.</p></div>
            <div className="flex flex-wrap gap-5">
              <ChipGroup label="Показать" options={['Все позиции', 'С последствиями', 'Не оценены']} value={filter} onChange={setFilter} />
              <ChipGroup label="Порядок" options={['По запасу', 'По потерям']} value={order} onChange={setOrder} />
            </div>
          </div>
          <div className="hidden lg:grid grid-cols-[minmax(0,2fr)_1fr_1fr_1fr] gap-5 bg-cream px-6 py-4 text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground"><span>Позиция и влияние</span><span>Запас</span><span>Дней без запаса</span><span className="text-right">Оценка потерь</span></div>
          {rows.map((r) => <div key={r.id} className="grid lg:grid-cols-[minmax(0,2fr)_1fr_1fr_1fr] gap-4 lg:gap-5 p-5 sm:p-6 border-t border-cream-2 items-start">
            <div><p className="text-sm font-bold leading-relaxed">{r.name}</p><p className="text-xs text-muted-foreground mt-1">{r.effect || 'Влияние не задано'}</p></div>
            <div><span className="lg:hidden field-label">Запас</span><p className="text-sm font-semibold tabular-nums">{r.stockKnown ? `${fmtNum(r.stock)} дн.` : 'Не задан'}</p></div>
            <div><span className="lg:hidden field-label">Дней без запаса</span><p className="text-sm font-semibold tabular-nums">{ready && r.stockKnown ? `${fmtNum(Math.max(0, days - r.stock))} дн.` : 'Не рассчитано'}</p></div>
            <div className="lg:text-right"><span className="lg:hidden field-label">Оценка потерь</span><p className={`font-heading text-lg font-bold ${r.loss > 0 ? 'text-rose-deep' : 'text-mal'}`}>{ready && r.loss != null ? fmt(r.loss) : 'Не оценено'}</p></div>
          </div>)}
          {rows.length === 0 && <p className="p-8 text-sm text-muted-foreground text-center">По выбранному условию позиций нет.</p>}
        </div>
        <p className="text-xs text-muted-foreground mt-5 max-w-3xl leading-relaxed">Если позиции останавливают одну и ту же линию одновременно, сумма может дважды учитывать один простой. Для управленческого решения проверьте совместимость сценариев с производством и финансами.</p>
      </>}
    </Section>
  );
}
