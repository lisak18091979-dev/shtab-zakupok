import { useEffect, useState } from 'react';
import { Printer } from 'lucide-react';
import Section from './Section';
import CopyButton from './CopyButton';
import { briefText } from '@/lib/shtab/calc';

export default function Summary({ state, a }) {
  const auto = briefText(state, a);
  const [text, setText] = useState(auto);
  useEffect(() => setText(auto), [auto]);

  return (
    <Section kicker="Сводка" title="Утренняя сводка собственнику" note="Собирается сама из светофора, плана, журнала и решений. Можно поправить перед отправкой.">
      <div className="grid lg:grid-cols-[1fr_260px] gap-8">
        <textarea value={text} onChange={(e) => setText(e.target.value)} className="w-full min-h-[440px] bg-cream-paper border border-cream-2 border-l-8 border-l-mal p-6 text-[15px] leading-relaxed outline-none focus:border-mal" />
        <div className="space-y-3 no-print">
          <CopyButton text={text} label="Копировать сводку" className="btn-dark w-full justify-center" />
          <button onClick={() => window.print()} className="btn-ghost w-full justify-center"><Printer className="w-4 h-4" /> Распечатать</button>
          <p className="text-xs text-muted-foreground">Полстраницы, без драм и без оправданий: сколько красного, на сколько рублей не закрыт риск, что сделано, что делаю сегодня.</p>
        </div>
      </div>
    </Section>
  );
}