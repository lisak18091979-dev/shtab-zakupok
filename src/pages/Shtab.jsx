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

const H72 = (p) => <Checklist {...p} kicker="Закупщику · 72 часа" title="Первые 72 часа" note="Порядок записан заранее, чтобы не думать, когда ударило." steps={STEPS_72} doneKey="done72" />;
const P30 = (p) => <Checklist {...p} kicker="Закупщику · 30 дней" title="План на тридцать дней" note="Улучшения разблокируются только после стабилизации." steps={PLAN_30} doneKey="done30" gate />;

const VIEWS = { light: TrafficLight, stress: StressTest, h72: H72, plan30: P30, team: Team, phrases: Phrases, journal: Journal, summary: Summary, panel: OwnerPanel, three: ThreeNumbers, decisions: Decisions };
const TABS = {
  buyer: [['light', 'Светофор'], ['stress', 'Стресс тест'], ['h72', '72 часа'], ['plan30', 'План 30 дней'], ['team', 'Команда'], ['phrases', 'Фразы'], ['journal', 'Журнал'], ['summary', 'Сводка']],
  owner: [['panel', 'Панель'], ['three', 'Три цифры'], ['decisions', 'Решения'], ['summary', 'Сводка']],
};

export default function Shtab() {
  const { state, patch, reset } = useShtab();
  const a = useMemo(() => analyze(state), [state]);
  const [mode, setModeRaw] = useState('buyer');
  const [tab, setTab] = useState('light');
  const setMode = (m) => { setModeRaw(m); setTab(TABS[m][0][0]); };
  const View = VIEWS[tab];

  return (
    <div className="min-h-screen">
      <ShtabTop mode={mode} setMode={setMode} state={state} reset={reset} />
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