import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import useShtab from '@/lib/shtab/useShtab';
import { analyze } from '@/lib/shtab/calc';
import { STEPS_72, PLAN_30 } from '@/lib/shtab/defaults';
import ShtabTop from '@/components/shtab/ShtabTop';
import StatusStrip from '@/components/shtab/StatusStrip';
import Tabs from '@/components/shtab/Tabs';
import TrafficLight from '@/components/shtab/TrafficLight';
import StressTest from '@/components/shtab/StressTest';
import Checklist from '@/components/shtab/Checklist';
import Team from '@/components/shtab/Team';
import Phrases from '@/components/shtab/Phrases';
import Journal from '@/components/shtab/Journal';
import Summary from '@/components/shtab/Summary';
import OwnerPanel from '@/components/shtab/OwnerPanel';
import ThreeNumbers from '@/components/shtab/ThreeNumbers';
import Decisions from '@/components/shtab/Decisions';

const H72 = (p) => <Checklist {...p} kicker="Закупщику · 72 часа" title="Первые 72 часа" note="Внесите ответственного, срок и то, что мешает выполнить шаг. Порядок действий записан заранее." steps={STEPS_72} doneKey="done72" />;
const P30 = (p) => <Checklist {...p} kicker="Закупщику · 30 дней" title="План на тридцать дней" note="Сначала удержать производство. По каждому шагу назначьте ответственного, срок и решение, которое мешает, если оно есть." steps={PLAN_30} doneKey="done30" gate />;

const VIEWS = { light: TrafficLight, stress: StressTest, h72: H72, plan30: P30, team: Team, phrases: Phrases, journal: Journal, summary: Summary, panel: OwnerPanel, three: ThreeNumbers, decisions: Decisions };
const TABS = {
  buyer: [['plan30', 'План 30 дней'], ['light', 'Светофор'], ['stress', 'Стресс тест'], ['h72', '72 часа'], ['team', 'Команда'], ['phrases', 'Фразы'], ['journal', 'Журнал'], ['summary', 'Сводка']],
  owner: [['panel', 'Панель'], ['decisions', 'Решения'], ['summary', 'Сводка'], ['three', 'Финансы']],
};

export default function Shtab() {
  const { state, patch, reset, isExample, loadExample, returnToMyData, legacyAvailable, restoreLegacy, dismissLegacy } = useShtab();
  const a = useMemo(() => analyze(state), [state]);
  const [mode, setModeRaw] = useState('buyer');
  const [tab, setTab] = useState('plan30');
  const setMode = (m) => { setModeRaw(m); setTab(TABS[m][0][0]); };
  const View = VIEWS[tab];

  return (
    <div className="min-h-screen">
      <ShtabTop mode={mode} setMode={setMode} state={state} reset={reset} isExample={isExample} loadExample={loadExample} returnToMyData={returnToMyData} />
      {legacyAvailable && !isExample && <aside className="bg-cream-paper border-b border-cream-2">
        <div className="max-w-6xl mx-auto px-5 py-5 flex flex-wrap items-center justify-between gap-4">
          <div className="max-w-2xl"><p className="font-bold text-sm">Чистый старт без старых учебных цифр</p><p className="text-xs text-muted-foreground mt-1">Прежние записи сохранены отдельно. Они могли содержать учебный набор, поэтому автоматически их не загружаем.</p></div>
          <div className="flex flex-wrap gap-2">
            <button className="btn-ghost" onClick={() => window.confirm('Восстановить прежние записи вместо текущих? В них могут быть старые учебные цифры. Исходная копия прежних записей останется сохранённой.') && restoreLegacy()}>Восстановить прежние записи</button>
            <button className="btn-ghost" onClick={dismissLegacy}>Оставить текущие</button>
          </div>
        </div>
      </aside>}
      {isExample && <div className="bg-[#fff3cd] border-b-2 border-[#c9962b] px-5 py-3 text-center text-sm font-bold text-graph">Учебный пример. Все позиции и цифры условные, не данные ЧКПЗ или другого предприятия. Ваши данные сохранены отдельно. Нажмите «Вернуться к моим данным», чтобы восстановить их.</div>}
      <StatusStrip a={a} state={state} />
      <Tabs tabs={TABS[mode]} tab={tab} setTab={setTab} />
      <main className="max-w-6xl mx-auto px-5 py-12">
        <AnimatePresence mode="wait">
          <motion.div key={tab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -6 }} transition={{ duration: 0.25 }}>
            <View state={state} patch={patch} a={a} />
          </motion.div>
        </AnimatePresence>
      </main>
      <p className="text-center text-[11px] font-bold tracking-[0.25em] text-muted-foreground pb-10">ДАННЫЕ ХРАНЯТСЯ ТОЛЬКО В ЭТОМ БРАУЗЕРЕ</p>
    </div>
  );
}