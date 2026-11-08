import { useState } from 'react';
import { Check, Lock, Unlock, ChevronDown, ChevronUp } from 'lucide-react';
import Section from './Section';

const STATES = ['Не начато', 'В работе', 'Ждёт решения', 'Готово'];

export default function Checklist({ state, patch, a, kicker, title, note, steps, doneKey, gate }) {
  const done = state[doneKey] || [];
  const metaKey = doneKey === 'done30' ? 'meta30' : 'meta72';
  const meta = state[metaKey] || {};
  const [opened, setOpened] = useState({});
  const statusAt = (i) => meta[i]?.status || (done[i] ? 'Готово' : 'Не начато');
  const count = steps.filter((_, i) => statusAt(i) === 'Готово').length;
  const todayIdx = steps.findIndex((_, i) => statusAt(i) !== 'Готово');
  const all = count === steps.length;
  const patchTask = (i, key, value) => patch(metaKey, (m) => ({
    ...(m || {}),
    [i]: { ...(m || {})[i], [key]: value },
  }));
  const setStatus = (i, value) => {
    patchTask(i, 'status', value);
    patch(doneKey, (d) => {
      const next = [...(d || [])];
      next[i] = value === 'Готово';
      return next;
    });
  };
  const stages = [...new Set(steps.map((s) => s[0]))];
  const now = new Date();
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
  const late = steps.filter((_, i) => meta[i]?.due && meta[i].due < today && statusAt(i) !== 'Готово').length;
  const unassigned = steps.filter((_, i) => statusAt(i) !== 'Готово' && !meta[i]?.owner?.trim()).length;
  const waiting = steps.filter((_, i) => statusAt(i) === 'Ждёт решения').length;
  const supplyReady = !!a?.valid.length && !a.reds.length && !a.yellows && !a.unknown.length;
  const gateOpen = all && supplyReady;
  const gateReasons = [
    !all ? `шагов выполнено ${count} из ${steps.length}` : null,
    !a?.valid.length ? 'светофор не заполнен' : null,
    a?.reds.length ? `красных позиций ${a.reds.length}` : null,
    a?.yellows ? `жёлтых позиций ${a.yellows}` : null,
    a?.unknown.length ? `непроверенных позиций ${a.unknown.length}` : null,
  ].filter(Boolean).join('; ');

  return (
    <Section kicker={kicker} title={title} note={note}>
      {gate && (
        <div className={`mb-6 flex items-center gap-3 px-5 py-3 text-sm font-bold ${gateOpen ? 'bg-mal text-white' : 'bg-graph text-rose-light'}`}>
          {gateOpen ? <Unlock className="w-4 h-4 shrink-0" /> : <Lock className="w-4 h-4 shrink-0" />}
          {gateOpen ? 'План выполнен, в проверенном светофоре нет разрывов. Можно обсуждать улучшения.' : `Улучшения заморожены: ${gateReasons}. Сначала стабилизация.`}
        </div>
      )}
      <div className="bg-cream-paper border border-cream-2 p-4 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="font-heading text-xl font-bold">Исполнение плана</p>
          <div className="flex flex-wrap gap-2 text-xs font-extrabold">
            <span className="bg-mal text-white px-3 py-1.5">Готово: {count} из {steps.length}</span>
            <span className="bg-cream px-3 py-1.5">Без ответственного: {unassigned}</span>
            <span className={`px-3 py-1.5 ${late ? 'bg-[#9c1c1c] text-white' : 'bg-cream'}`}>Просрочено: {late}</span>
            <span className={`px-3 py-1.5 ${waiting ? 'bg-[#e7b84a]' : 'bg-cream'}`}>Ждёт решения: {waiting}</span>
          </div>
        </div>
        <div className="mt-4 h-2 bg-cream-2"><div className="h-full bg-mal transition-all" style={{ width: `${(count / steps.length) * 100}%` }} /></div>
        {!all && <p className="mt-3 text-sm"><span className="kicker mr-2">Следующий шаг</span><b>{steps[todayIdx][1]}</b></p>}
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {stages.map((stage) => {
          const indices = steps.map((_, i) => i).filter((i) => steps[i][0] === stage);
          const finished = indices.filter((i) => statusAt(i) === 'Готово').length;
          return (
            <div key={stage} className="bg-cream-paper border-2 border-graph p-4">
              <p className="font-heading text-xl font-bold border-b-2 border-graph pb-2">{stage}</p>
              <p className="mt-1 mb-3 text-[10px] font-extrabold tracking-[0.15em] text-mal">{finished} ИЗ {indices.length} ВЫПОЛНЕНО</p>
              <ul className="space-y-3">
                {indices.map((i) => {
                  const [s, text] = steps[i];
                  const status = statusAt(i);
                  const isLate = meta[i]?.due && meta[i].due < today && status !== 'Готово';
                  const expanded = !!opened[i];
                  return (
                    <li key={`${s}-${i}`} className={`border-b border-cream-2 pb-3 ${i === todayIdx ? 'bg-rose-light/60 border-l-4 border-l-rose-deep px-2 py-2' : ''}`}>
                      <div className="flex items-start gap-2">
                        <button onClick={() => setStatus(i, status === 'Готово' ? 'В работе' : 'Готово')} aria-label={status === 'Готово' ? 'Снять отметку' : 'Отметить готовым'} className={`mt-0.5 w-6 h-6 shrink-0 border-2 border-graph flex items-center justify-center ${status === 'Готово' ? 'bg-mal border-mal text-white' : ''}`}>
                          {status === 'Готово' && <Check className="w-4 h-4" />}
                        </button>
                        <div className="min-w-0 flex-1">
                          <p className={`text-sm font-semibold ${status === 'Готово' ? 'line-through text-muted-foreground' : ''}`}>{text}</p>
                          <div className="mt-2 flex flex-wrap items-center gap-2">
                            <select value={status} onChange={(e) => setStatus(i, e.target.value)} className={`border border-cream-2 px-2 py-1 text-[11px] font-bold ${isLate ? 'bg-[#9c1c1c] text-white' : 'bg-cream'}`}>
                              {STATES.map((x) => <option key={x}>{x}</option>)}
                            </select>
                            {isLate && <span className="text-[10px] font-extrabold text-[#9c1c1c]">СРОК ПРОШЁЛ</span>}
                            <button onClick={() => setOpened((o) => ({ ...o, [i]: !o[i] }))} className="inline-flex items-center gap-1 text-[11px] font-extrabold text-mal">
                              {expanded ? 'Скрыть детали' : 'Ответственный и срок'}
                              {expanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                            </button>
                          </div>
                        </div>
                      </div>
                      {expanded && (
                        <div className="mt-3 ml-8 space-y-2">
                          <input className="field" value={meta[i]?.owner || ''} onChange={(e) => patchTask(i, 'owner', e.target.value)} placeholder="Ответственный" />
                          <label className="block text-[10px] font-extrabold uppercase tracking-[0.1em] text-muted-foreground">Срок
                            <input type="date" className="field mt-1" value={meta[i]?.due || ''} onChange={(e) => patchTask(i, 'due', e.target.value)} />
                          </label>
                          <textarea className="field min-h-[68px]" value={meta[i]?.blocker || ''} onChange={(e) => patchTask(i, 'blocker', e.target.value)} placeholder="Что мешает или какое решение нужно" />
                        </div>
                      )}
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        })}
      </div>
    </Section>
  );
}
