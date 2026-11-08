import Section from './Section';
import CopyButton from './CopyButton';
import { PHRASES } from '@/lib/shtab/defaults';

export default function Phrases() {
  return (
    <Section kicker="Закупщику · Фразы" title="Для трудных разговоров" note="Спокойно, с цифрами и с одной просьбой. Скопируйте и подставьте свои суммы.">
      <div className="grid md:grid-cols-2 gap-5">
        {PHRASES.map(([who, sit, text]) => (
          <div key={text} className="bg-cream-paper border border-cream-2 border-l-8 border-l-rose-deep p-6 flex flex-col">
            <p className="kicker">{who}</p>
            <p className="font-heading text-xl font-bold mt-1">{sit}</p>
            <p className="mt-3 text-[15px] leading-relaxed flex-1">«{text}»</p>
            <CopyButton text={text} className="btn-ghost self-start mt-5" />
          </div>
        ))}
      </div>
    </Section>
  );
}