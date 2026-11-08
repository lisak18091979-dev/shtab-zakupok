import { Check, Lock, Unlock } from 'lucide-react';
import Section from './Section';

export default function Checklist({ state, patch, kicker, title, note, steps, doneKey, gate }) {
  const done = state[doneKey] || [];
  const count = steps.filter((_, i) => done[i]).length;
  const todayIdx = steps.findIndex((_, i) => !done[i]);
  const all = count === steps.length;
  const toggle = (i) => patch(doneKey, (d) => { const n = [...(d || [])]; n[i] = !n[i]; return n; });
  const stages = [...new Set(steps.map((s) => s[0]))];

  return (
    <Section kicker={kicker} title={title} note={note}>
      {gate && (
        <div className={`mb-6 flex items-center gap-3 px-5 py-3 text-sm font-bold ${all ? 'bg-mal text-white' : 'bg-rose-light text-graph'}`}>
          {all ? <Unlock className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
          {all ? 'Стабилизация пройдена. Можно открывать улучшения.' : 'Улучшения заморожены. Сначала стабилизация.'}
        </div>
      )}
      <div className="flex items-center gap-4">
        <div className="flex-1 h-2 bg-cream-2"><div className="h-full bg-mal transition-all duration-500" style={{ width: `${(count / steps.length) * 100}%` }} /></div>
        <p className="font-heading text-xl font-bold">{count} из {steps.length}</p>
      </div>
      {!all && <p className="mt-4 text-sm"><span className="kicker mr-2">Шаг на сегодня</span><b>{steps[todayIdx][1]}</b></p>}
      <div className="mt-8 grid md:grid-cols-3 gap-6">
        {stages.map((stage) => (
          <div key={stage}>
            <p className="font-heading text-lg font-bold border-b-2 border-graph pb-2">{stage}</p>
            <ul className="mt-3 space-y-2">
              {steps.map(([s, text], i) => s === stage && (
                <li key={text}>
                  <button onClick={() => toggle(i)} className={`w-full flex gap-3 text-left p-3 border transition-all ${done[i] ? 'bg-mal/10 border-mal/30 text-muted-foreground line-through' : i === todayIdx ? 'bg-rose-light border-rose-deep' : 'bg-cream-paper border-cream-2 hover:border-graph'}`}>
                    <span className={`mt-0.5 w-5 h-5 shrink-0 border-2 flex items-center justify-center ${done[i] ? 'bg-mal border-mal text-white' : 'border-graph'}`}>{done[i] && <Check className="w-3 h-3" />}</span>
                    <span className="text-sm font-semibold">{text}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Section>
  );
}