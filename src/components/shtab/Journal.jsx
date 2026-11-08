import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';
import Section from './Section';
import { uid } from '@/lib/shtab/defaults';

export default function Journal({ state, patch }) {
  const [text, setText] = useState('');
  const add = (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    patch('journal', (j) => [...j, { id: uid(), date: format(new Date(), 'dd.MM.yyyy'), text: text.trim() }]);
    setText('');
  };
  const del = (id) => patch('journal', (j) => j.filter((x) => x.id !== id));

  return (
    <Section kicker="Закупщику · Журнал" title="Один шаг в день" note="Записывайте сделанное. Три последние записи попадают в утреннюю сводку собственнику.">
      <form onSubmit={add} className="flex gap-2 max-w-2xl">
        <input className="field" placeholder="Что сделано сегодня" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-dark shrink-0"><Plus className="w-4 h-4" /> Записать</button>
      </form>
      {state.journal.length === 0 ? (
        <p className="mt-10 font-heading italic text-2xl text-muted-foreground">Записей пока нет. Один закрытый шаг лучше двадцати начатых.</p>
      ) : (
        <ol className="mt-8 border-l-2 border-rose ml-2 space-y-5">
          {[...state.journal].reverse().map((j) => (
            <li key={j.id} className="pl-6 relative group">
              <span className="absolute -left-[7px] top-1.5 w-3 h-3 bg-rose-deep" />
              <p className="text-[11px] font-extrabold tracking-[0.15em] text-mal">{j.date}</p>
              <div className="flex items-start justify-between gap-3">
                <p className="font-semibold">{j.text}</p>
                <button onClick={() => del(j.id)} className="opacity-0 group-hover:opacity-100 p-1 text-muted-foreground hover:text-rose-deep"><Trash2 className="w-4 h-4" /></button>
              </div>
            </li>
          ))}
        </ol>
      )}
    </Section>
  );
}