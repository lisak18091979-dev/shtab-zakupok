import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Section from './Section';
import { DECISION_STATUSES, uid } from '@/lib/shtab/defaults';

const COLORS = { 'Ждёт решения': 'bg-[#e7b84a] border-[#e7b84a]', 'Одобрено': 'bg-mal text-white border-mal', 'Отклонено': 'bg-[#9c1c1c] text-white border-[#9c1c1c]', 'Обсуждаем': 'bg-rose-light border-rose-light' };

export default function Decisions({ state, patch }) {
  const [text, setText] = useState('');
  const add = (e) => { e.preventDefault(); if (!text.trim()) return; patch('decisions', (d) => [...d, { id: uid(), text: text.trim(), status: 'Ждёт решения', comment: '' }]); setText(''); };
  const upd = (id, k, v) => patch('decisions', (d) => d.map((x) => (x.id === id ? { ...x, [k]: v } : x)));
  const del = (id) => patch('decisions', (d) => d.filter((x) => x.id !== id));

  return (
    <Section kicker="Собственнику · Решения" title="Ждут вашего слова" note="Закупщик вносит запрос, собственник выбирает статус и оставляет комментарий.">
      <div className="flex flex-wrap gap-2 mb-6">
        {DECISION_STATUSES.map((s) => <span key={s} className={`px-3 py-1.5 text-xs font-extrabold border-2 ${COLORS[s]}`}>{s}: {state.decisions.filter((d) => d.status === s).length}</span>)}
      </div>
      <div className="space-y-3">
        {state.decisions.map((d) => (
          <div key={d.id} className="bg-cream-paper border border-cream-2 p-5">
            <div className="flex items-start justify-between gap-3">
              <p className="font-heading text-xl font-bold">{d.text}</p>
              <button onClick={() => del(d.id)} className="p-1 text-muted-foreground hover:text-rose-deep"><Trash2 className="w-4 h-4" /></button>
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {DECISION_STATUSES.map((s) => (
                <button key={s} onClick={() => upd(d.id, 'status', s)} className={`px-2.5 py-1 text-[11px] font-extrabold border-2 transition-colors ${d.status === s ? COLORS[s] : 'border-cream-2 hover:border-graph'}`}>{s}</button>
              ))}
            </div>
            <input className="field mt-3" placeholder="Комментарий собственника" value={d.comment} onChange={(e) => upd(d.id, 'comment', e.target.value)} />
          </div>
        ))}
      </div>
      <form onSubmit={add} className="mt-5 flex gap-2 max-w-2xl">
        <input className="field" placeholder="Новый запрос, например: разрешить второго поставщика по упаковке" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-dark shrink-0"><Plus className="w-4 h-4" /> Внести</button>
      </form>
    </Section>
  );
}