import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import Section from './Section';
import { TEAM_DECISIONS, uid } from '@/lib/shtab/defaults';

const COLORS = { 'Оставить': 'bg-rose-deep text-white border-rose-deep', 'Передать': 'bg-mal text-white border-mal', 'Отложить': 'bg-[#e7b84a] border-[#e7b84a]', 'Убрать': 'bg-graph text-cream border-graph' };

export default function Team({ state, patch, a }) {
  const [text, setText] = useState('');
  const add = (e) => { e.preventDefault(); if (!text.trim()) return; patch('team', (t) => [...t, { id: uid(), text, decision: 'Оставить' }]); setText(''); };
  const set = (id, decision) => patch('team', (t) => t.map((x) => (x.id === id ? { ...x, decision } : x)));
  const del = (id) => patch('team', (t) => t.filter((x) => x.id !== id));
  const p = state.params.people;

  return (
    <Section kicker="Закупщику · Команда" title="Разгрузка команды" note="Решите по каждому делу недели. Люди важнее красивых планов. Скажите вслух, что вы сознательно не делаете.">
      <div className="flex flex-wrap gap-3 mb-6">
        {TEAM_DECISIONS.map((d) => <span key={d} className={`px-3 py-1.5 text-xs font-extrabold border-2 ${COLORS[d]}`}>{d}: {state.team.filter((t) => t.decision === d).length}</span>)}
        <span className={`px-3 py-1.5 text-xs font-bold ${a.overload ? 'text-[#9c1c1c]' : 'text-mal'}`}>Красных {p == null ? `${a.reds.length}, число людей не задано.` : `${a.reds.length} на ${p} чел. ${a.overload ? 'Перегруз.' : 'Нагрузка держится.'}`}</span>
      </div>
      <ul className="divide-y divide-cream-2 bg-cream-paper border border-cream-2">
        {state.team.map((t) => (
          <li key={t.id} className="p-4 flex flex-wrap items-center gap-3 justify-between">
            <span className={`font-semibold ${t.decision === 'Убрать' ? 'line-through text-muted-foreground' : ''}`}>{t.text}</span>
            <div className="flex items-center gap-1.5">
              {TEAM_DECISIONS.map((d) => (
                <button key={d} onClick={() => set(t.id, d)} className={`px-2.5 py-1 text-[11px] font-extrabold border-2 transition-colors ${t.decision === d ? COLORS[d] : 'border-cream-2 hover:border-graph'}`}>{d}</button>
              ))}
              <button onClick={() => del(t.id)} className="p-1.5 text-muted-foreground hover:text-rose-deep"><Trash2 className="w-4 h-4" /></button>
            </div>
          </li>
        ))}
      </ul>
      <form onSubmit={add} className="mt-4 flex gap-2 max-w-xl">
        <input className="field" placeholder="Новое дело недели" value={text} onChange={(e) => setText(e.target.value)} />
        <button className="btn-dark shrink-0"><Plus className="w-4 h-4" /> Добавить</button>
      </form>
    </Section>
  );
}