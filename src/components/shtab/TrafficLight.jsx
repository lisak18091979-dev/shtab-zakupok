import { useState } from 'react';
import { ClipboardPaste, Plus } from 'lucide-react';
import Section from './Section';
import ChipGroup from './ChipGroup';
import TrafficRow from './TrafficRow';
import TodayCard from './TodayCard';
import CopyButton from './CopyButton';
import { newItem, uid } from '@/lib/shtab/defaults';
import { fmt, fmtNum } from '@/lib/shtab/calc';

const HEAD = ['Позиция', 'Остаток', 'Расход в сутки', 'Запас, дн.', 'Замена, дн.', 'Цена дня простоя, млн ₽', 'Без поставки', 'Непокрыто', 'Статус', 'Риск, млн ₽', ''];
const FILTERS = ['Все', 'Красное', 'Жёлтое', 'Зелёное'];
const FKEY = { Красное: 'red', Жёлтое: 'yellow', Зелёное: 'green' };
const n = (v) => parseFloat(String(v ?? '').replace(/\s/g, '').replace(',', '.')) || 0;
const effectOf = (t) => { const x = String(t || '').toLowerCase(); return x.startsWith('ост') ? 'Остановит линию' : x.startsWith('зам') && x.includes('сраз') ? 'Заменим сразу' : 'Замедлит'; };

export default function TrafficLight({ state, patch, a }) {
  const [filter, setFilter] = useState('Все');
  const [byRisk, setByRisk] = useState(false);
  const [paste, setPaste] = useState(false);
  const [raw, setRaw] = useState('');
  const upd = (id, k, v) => patch('items', (list) => list.map((it) => (it.id === id ? { ...it, [k]: v } : it)));
  const add = () => patch('items', (list) => [...list, newItem()]);
  const del = (id) => patch('items', (list) => list.filter((it) => it.id !== id));
  const setParam = (k) => (v) => patch('params', (p) => ({ ...p, [k]: v }));

  const importRows = () => {
    const rows = raw.split(/\r?\n/).map((l) => l.split(/\t|;/)).filter((c) => c[0] && c[0].trim());
    const items = rows.map((c) => ({ ...newItem(), id: uid(), name: c[0].trim(), supplier: (c[1] || '').trim(), unit: (c[2] || '').trim(), onhand: n(c[3]), perday: n(c[4]), replace: n(c[5]), dayCost: n(c[6]), effect: effectOf(c[7]) }));
    if (items.length) patch('items', (list) => [...list.filter((it) => it.name.trim()), ...items]);
    setRaw(''); setPaste(false);
  };

  let rows = a.rows.filter((r) => filter === 'Все' || r.status === FKEY[filter] || !r.name.trim());
  if (byRisk) rows = [...rows].sort((x, y) => y.risk - x.risk);
  const plan = a.byOwner.map(([o, list]) => `${o}: ${list.map((r) => r.name + (r.nextStep ? ' (' + r.nextStep + ')' : '')).join('; ')}`).join('\n');

  return (
    <Section
      kicker="Закупщику · Светофор"
      title="Что может остановить линию"
      note="Красное: непокрытые дни есть и позиция остановит линию. Жёлтое: непокрытые дни есть. Зелёное: запаса хватает, не трогаем. Если указаны остаток и расход в сутки, запас в днях считается сам."
      right={<div className="flex gap-6">
        <ChipGroup label="Замедление, % цены дня" options={[25, 50, 75]} value={state.params.slowShare} onChange={setParam('slowShare')} />
        <ChipGroup label="Людей в закупках" options={[1, 2, 3, 4, 5, 6]} value={state.params.people} onChange={setParam('people')} />
      </div>}
    >
      <TodayCard a={a} people={state.params.people} />

      {a.byOwner.length > 0 && (
        <div className="mt-6 bg-cream-paper border border-cream-2 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="kicker">Красное по людям на сегодня</p>
            <CopyButton text={plan} label="Копировать план дня" />
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-3">
            {a.byOwner.map(([o, list]) => (
              <div key={o} className={`border-2 p-3 ${list.length > 3 ? 'border-[#9c1c1c]' : 'border-graph'}`}>
                <p className="font-extrabold">{o} <span className={list.length > 3 ? 'text-[#9c1c1c]' : 'text-mal'}>· {list.length}{list.length > 3 ? ', больше трёх' : ''}</span></p>
                <ul className="mt-1 text-sm space-y-1">
                  {list.map((r) => <li key={r.id}>{r.name}<span className="text-muted-foreground"> · риск {fmt(r.risk)}</span>{r.nextStep ? <span className="block text-xs text-muted-foreground">{r.nextStep}</span> : null}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="mt-6 flex flex-wrap items-end gap-6">
        <ChipGroup label="Показать" options={FILTERS} value={filter} onChange={setFilter} />
        <ChipGroup label="Порядок" options={['Как внесено', 'По риску']} value={byRisk ? 'По риску' : 'Как внесено'} onChange={(v) => setByRisk(v === 'По риску')} />
      </div>

      {a.rows.length === 0 && <p className="mt-4 bg-cream-paper border border-cream-2 p-5 text-sm">Список пуст. Добавьте позицию вручную или вставьте строки из Excel. Готовых цифр здесь нет, всё берётся из ваших данных.</p>}
      <div className="mt-4 overflow-x-auto bg-cream-paper border border-cream-2">
        <table className="w-full min-w-[1000px] text-sm">
          <thead className="bg-graph text-rose-light">
            <tr>{HEAD.map((h) => <th key={h} className="p-2.5 text-left text-[10px] font-extrabold uppercase tracking-[0.1em]">{h}</th>)}</tr>
          </thead>
          <tbody>
            {rows.map((r) => <TrafficRow key={r.id} row={r} onChange={(k, v) => upd(r.id, k, v)} onDelete={() => del(r.id)} />)}
          </tbody>
        </table>
      </div>
      <div className="mt-4 flex flex-wrap gap-3">
        <button onClick={add} className="btn-ghost"><Plus className="w-4 h-4" /> Добавить позицию</button>
        <button onClick={() => setPaste(!paste)} className="btn-ghost"><ClipboardPaste className="w-4 h-4" /> Вставить из таблицы</button>
      </div>
      {paste && (
        <div className="mt-4 bg-cream-paper border border-cream-2 p-5 max-w-3xl">
          <p className="text-sm font-semibold">Скопируйте строки из Excel и вставьте сюда. Порядок столбцов:</p>
          <p className="text-xs text-muted-foreground mt-1">Позиция · Поставщик · Единица · Остаток · Расход в сутки · Дней на замену · Цена дня простоя, млн ₽ · Влияние (остановит, замедлит или заменим сразу)</p>
          <textarea className="field mt-3 min-h-[120px]" value={raw} onChange={(e) => setRaw(e.target.value)} placeholder="Вставьте строки из таблицы" />
          <div className="mt-3 flex gap-3">
            <button onClick={importRows} className="btn-dark">Добавить в светофор</button>
            <button onClick={() => { setRaw(''); setPaste(false); }} className="btn-ghost">Отмена</button>
          </div>
        </div>
      )}
    </Section>
  );
}
