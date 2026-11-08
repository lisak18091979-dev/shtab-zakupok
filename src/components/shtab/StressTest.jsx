import { motion } from 'framer-motion';
import Section from './Section';
import ChipGroup from './ChipGroup';
import { fmt } from '@/lib/shtab/calc';

export default function StressTest({ state, patch, a }) {
  const days = state.params.breakDays;
  const max = Math.max(...a.valid.map((r) => r.loss), 1);
  return (
    <Section
      kicker="Закупщику · Стресс тест"
      title="Если поставки оборвутся"
      note="Выберите срок обрыва. Это сценарный расчёт, не прогноз: потери зависят от введённой цены дня простоя и выбранной доли для позиций, которые замедляют работу. Проверьте исходные данные с производством и финансами."
      right={<ChipGroup label="Срок обрыва" options={[3, 7, 14, 30]} value={days} suffix=" дн." onChange={(v) => patch('params', (p) => ({ ...p, breakDays: v }))} />}
    >
      <div className="grid md:grid-cols-3 gap-4">
        <div className="bg-graph text-cream p-6 border-b-8 border-rose">
          <p className="text-[10px] font-extrabold tracking-[0.2em] text-rose-light">ПОТЕРИ ЗА {days} ДН.</p>
          <p className="font-heading text-5xl font-extrabold mt-3 text-rose-light">{fmt(a.loss)}</p>
        </div>
        <div className="bg-cream-paper border border-cream-2 p-6">
          <p className="kicker">Падает первой</p>
          <p className="font-heading text-2xl font-bold mt-3">{a.falling ? a.falling.name : 'Ничего не падает'}</p>
          {a.falling && <p className="text-sm text-muted-foreground mt-1">Запаса на {a.falling.stock} дн.</p>}
        </div>
        <div className="bg-mal text-white p-6">
          <p className="text-[10px] font-extrabold tracking-[0.2em] opacity-80">ФРАЗА ДЛЯ СОБСТВЕННИКА</p>
          <p className="font-heading italic text-xl mt-3">Цена бездействия за {days} дн.: {fmt(a.loss)}. С этой цифры начинаю разговор.</p>
        </div>
      </div>
      <div className="mt-10 space-y-5">
        {a.valid.map((r) => (
          <div key={r.id}>
            <div className="flex justify-between gap-4 text-sm"><span className="font-bold">{r.name}</span><span className="font-heading font-bold">{fmt(r.loss)}</span></div>
            <div className="h-3 bg-cream-2 mt-1.5 overflow-hidden">
              <motion.div className="h-full bg-rose-deep" initial={false} animate={{ width: `${(r.loss / max) * 100}%` }} transition={{ duration: 0.6 }} />
            </div>
            <p className="text-xs text-muted-foreground mt-1">Запас {r.stock} дн. · {r.effect}</p>
          </div>
        ))}
      </div>
    </Section>
  );
}