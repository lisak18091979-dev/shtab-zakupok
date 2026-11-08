import { Trash2 } from 'lucide-react';
import { EFFECTS, STATUS_META } from '@/lib/shtab/defaults';
import { fmtNum } from '@/lib/shtab/calc';

export default function TrafficRow({ row, onChange, onDelete }) {
  const num = (k, cls = '') => (
    <input type="number" step="any" className={`field text-right ${cls}`} value={row[k] ?? 0} onChange={(e) => onChange(k, +e.target.value)} />
  );
  const txt = (k, ph, cls = '') => (
    <input className={`field ${cls}`} placeholder={ph} value={row[k] ?? ''} onChange={(e) => onChange(k, e.target.value)} />
  );
  const st = STATUS_META[row.status];
  const filled = row.name.trim();
  return (
    <>
      <tr className="border-t-2 border-cream-2 align-middle">
        <td className="p-2 min-w-[230px]">{txt('name', 'Позиция')}</td>
        <td className="p-2 w-28">{num('onhand')}</td>
        <td className="p-2 w-28">{num('perday')}</td>
        <td className="p-2 w-24">
          {row.auto ? <p className="text-right font-extrabold px-3 py-2" title="Считается: остаток делить на расход">{fmtNum(row.stock)}</p> : num('stock')}
        </td>
        <td className="p-2 w-20">{num('replace')}</td>
        <td className="p-2 w-24">{num('dayCost')}</td>
        <td className="p-2 w-40">
          <select className="field" value={row.effect} onChange={(e) => onChange('effect', e.target.value)}>
            {EFFECTS.map((e) => <option key={e}>{e}</option>)}
          </select>
        </td>
        <td className="p-2 text-center font-bold">{filled ? fmtNum(row.unc) : '—'}</td>
        <td className="p-2">{filled && <span className={`inline-block px-2 py-1 text-[10px] font-extrabold tracking-[0.1em] ${st.cls}`}>{st.label}</span>}</td>
        <td className="p-2 text-right font-extrabold font-heading text-base">{filled ? fmtNum(row.risk) : '—'}</td>
        <td className="p-2 text-right"><button onClick={onDelete} title="Удалить" className="p-1.5 text-muted-foreground hover:text-rose-deep"><Trash2 className="w-4 h-4" /></button></td>
      </tr>
      <tr className="bg-cream/60">
        <td colSpan={11} className="px-2 pb-3 pt-0">
          <div className="grid gap-2 md:grid-cols-[1.2fr_.9fr_.5fr_2fr]">
            {txt('supplier', 'Поставщик')}
            {txt('owner', 'Кто ведёт')}
            {txt('unit', 'Ед.')}
            {txt('nextStep', 'Следующий шаг: что делаем и когда')}
          </div>
        </td>
      </tr>
    </>
  );
}
