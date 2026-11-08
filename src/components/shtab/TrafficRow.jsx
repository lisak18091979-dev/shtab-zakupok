import { Trash2 } from 'lucide-react';
import { useLayoutEffect, useRef } from 'react';
import { EFFECTS, STATUS_META } from '@/lib/shtab/defaults';
import { fmt, fmtNum } from '@/lib/shtab/calc';

export default function TrafficRow({ row, index, onChange, onDelete }) {
  const nameRef = useRef(null), actionRef = useRef(null);
  useLayoutEffect(() => {
    const fit = () => [nameRef, actionRef].forEach((ref) => {
      if (!ref.current) return;
      ref.current.style.height = '0px';
      ref.current.style.height = `${ref.current.scrollHeight + 2}px`;
    });
    fit();
    document.fonts?.ready.then(fit);
    window.addEventListener('resize', fit);
    return () => window.removeEventListener('resize', fit);
  }, [row.name, row.nextStep]);
  const mode = row.inventoryMode;
  const st = STATUS_META[row.status];
  const filled = !!row.name.trim();
  const label = (text, field, wide = false) => <label className={`block min-w-0 ${wide ? 'sm:col-span-2' : ''}`}><span className="field-label">{text}</span>{field}</label>;
  const number = (k, text) => <input aria-label={text} type="number" min="0" step="any" placeholder="Не внесено" className="field text-right tabular-nums" value={(k === 'stock' ? row.manualStock : row[k]) ?? ''} onChange={(e) => onChange(k, e.target.value === '' ? null : Math.max(0, +e.target.value))} />;
  const text = (k, name) => <input aria-label={name} className="field" placeholder="Не внесено" value={row[k] || ''} onChange={(e) => onChange(k, e.target.value)} />;
  return (
    <article className="supply-card">
      <header className="flex flex-wrap sm:flex-nowrap items-start gap-3 sm:gap-5 border-b border-cream-2 px-5 py-5 sm:px-7">
        <span className="hidden sm:grid place-items-center w-9 h-9 shrink-0 bg-cream-2 text-mal font-bold text-sm">{String(index + 1).padStart(2, '0')}</span>
        <label className="order-2 sm:order-none basis-full sm:basis-auto flex-1 min-w-0">
          <span className="field-label">Позиция</span>
          <textarea ref={nameRef} aria-label="Позиция" rows={2} placeholder="Наименование материала или комплектующего" className="field font-bold text-base resize-y min-h-[76px]" value={row.name} onChange={(e) => onChange('name', e.target.value)} />
        </label>
        <div className="order-1 sm:order-none flex sm:flex-col items-center sm:items-end justify-between gap-3 shrink-0 w-full sm:w-auto">
          {filled && <span className={`status-badge ${st.cls}`}>{st.label}</span>}
          <button onClick={onDelete} title="Удалить позицию" aria-label={`Удалить позицию ${row.name || index + 1}`} className="p-2 text-muted-foreground hover:text-rose-deep border border-cream-2 hover:border-rose"><Trash2 className="w-4 h-4" /></button>
        </div>
      </header>
      <div className="grid lg:grid-cols-[minmax(0,1fr)_250px]">
        <div className="p-5 sm:p-7">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
            <p className="kicker">Запас и влияние</p>
            <div role="group" aria-label="Способ расчёта запаса" className="flex flex-wrap gap-1 bg-cream p-1">
              {[['quantity', 'Остаток и расход'], ['days', 'Запас в днях']].map(([id, title]) => <button key={id} aria-pressed={mode === id} onClick={() => onChange('stockMode', id)} className={`px-3 py-2 text-xs font-bold ${mode === id ? 'bg-mal text-white' : 'hover:bg-cream-2'}`}>{title}</button>)}
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-x-5 gap-y-4">
            {mode === 'quantity' ? <>
              {label('Остаток на складе', number('onhand', 'Остаток на складе'))}
              {label('Расход за сутки', number('perday', 'Расход за сутки'))}
            </> : label('Запас, дней', number('stock', 'Запас, дней'))}
            {label('Единица измерения', text('unit', 'Единица измерения'))}
            {label('Полный срок замены, дней', number('replace', 'Полный срок замены, дней'))}
            {label('Что произойдёт без поставки', <select aria-label="Что произойдёт без поставки" className="field" value={row.effect} onChange={(e) => onChange('effect', e.target.value)}><option value="">Выберите влияние</option>{EFFECTS.map((e) => <option key={e}>{e}</option>)}</select>)}
            {label('Потери за день простоя, млн ₽', number('dayCost', 'Потери за день простоя, млн ₽'))}
          </div>
          <p className="text-xs text-muted-foreground mt-4 leading-relaxed">Срок замены включает согласование, изготовление, доставку и входной контроль. Цену дня простоя подтвердите с производством и финансами.</p>
        </div>
        <aside className="bg-graph text-cream p-6 lg:my-6 lg:mr-6 grid grid-cols-2 lg:grid-cols-1 gap-5">
          <div><p className="result-label">Запаса хватит</p><p className="result-value">{filled && row.stockKnown ? `${fmtNum(row.stock)} дн.` : 'Не задано'}</p></div>
          <div><p className="result-label">Разрыв покрытия</p><p className="result-value text-rose-light">{filled && row.unc != null ? `${fmtNum(row.unc)} дн.` : 'Не рассчитан'}</p></div>
          <div className="col-span-2 lg:col-span-1 border-t border-white/15 pt-4"><p className="result-label">Оценка риска</p><p className="font-heading font-bold text-2xl mt-2">{filled && row.risk != null ? fmt(row.risk) : 'Не оценён'}</p></div>
        </aside>
      </div>
      <footer className="border-t border-cream-2 bg-cream/40 px-5 py-5 sm:px-7">
        <p className="kicker mb-4">Ответственность и действие</p>
        <div className="grid sm:grid-cols-2 gap-4 sm:gap-x-5">
          {label('Поставщик', text('supplier', 'Поставщик'))}
          {label('Ответственный', text('owner', 'Ответственный'))}
          {label('Следующее действие и срок', <textarea ref={actionRef} aria-label="Следующее действие и срок" rows={2} className="field resize-y min-h-[76px]" placeholder="Что сделать, к какому сроку и какой результат получить" value={row.nextStep || ''} onChange={(e) => onChange('nextStep', e.target.value)} />, true)}
        </div>
        {filled && row.missing.length > 0 && <p className="mt-4 text-xs leading-relaxed text-rose-deep"><b>Уточнить:</b> {row.missing.join('; ')}.</p>}
      </footer>
    </article>
  );
}
