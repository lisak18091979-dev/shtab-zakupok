import { FileSpreadsheet, Printer, RotateCcw } from 'lucide-react';
import { buildShtabXlsx } from '@/lib/export/xlsx';
import { saveBlob } from '@/lib/export/download';

const MODES = [['buyer', 'Закупщику'], ['owner', 'Собственнику']];

export default function ShtabTop({ mode, setMode, state, reset, isExample, loadExample, returnToMyData }) {
  const doReset = () => window.confirm('Очистить все данные? Ваши записи будут стёрты.') && reset();
  const icon = 'p-2 text-rose-light hover:text-white transition-colors';
  return (
    <header className="bg-graph text-rose-light sticky top-0 z-40 no-print">
      <div className="max-w-6xl mx-auto px-5 py-3 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4">
          <span className="text-[11px] font-bold tracking-[0.2em]">ЗАКУПЩИЦА С УРАЛА</span>
          <span className="font-heading text-xl text-cream">Штаб закупок</span>
        </div>
        <div className="flex bg-graph-2 p-1">
          {MODES.map(([id, label]) => (
            <button key={id} onClick={() => setMode(id)} className={`px-4 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] transition-colors ${mode === id ? 'bg-rose-deep text-white' : 'hover:text-white'}`}>{label}</button>
          ))}
        </div>
        <div className="flex items-center gap-1">
          {isExample ? <button onClick={returnToMyData} className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] border border-rose-light hover:bg-graph-2">Вернуться к моим данным</button> : <button onClick={loadExample} className="px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.08em] border border-rose-light hover:bg-graph-2">Загрузить пример</button>}
          <button onClick={() => saveBlob(buildShtabXlsx({ ...state, items: state.items.map((it) => (+it.onhand > 0 && +it.perday > 0 ? { ...it, stock: Math.round((it.onhand / it.perday) * 10) / 10 } : it)) }), 'Штаб закупок.xlsx')} className="flex items-center gap-1.5 bg-mal text-white px-3 py-1.5 text-[11px] font-extrabold uppercase tracking-[0.12em] hover:bg-mal-light">
            <FileSpreadsheet className="w-4 h-4" /> Excel
          </button>
          <button onClick={() => window.print()} title="Распечатать" className={icon}><Printer className="w-4 h-4" /></button>
          <button onClick={doReset} title="Очистить все данные" className={icon}><RotateCcw className="w-4 h-4" /></button>
        </div>
      </div>
    </header>
  );
}