import { buildXlsx } from './core';
import { startSheet, paramsSheet, lightSheet, stressSheet, checklistSheet, teamSheet, phrasesSheet, journalSheet } from './sheetsBuyer';
import { panelSheet, threeSheet, decisionsSheet, summarySheet } from './sheetsOwner';
import { STEPS_72, PLAN_30 } from '@/lib/shtab/defaults';

export function buildShtabXlsx(state) {
  return buildXlsx([
    startSheet(),
    panelSheet(),
    lightSheet(state.items.filter((i) => i.name.trim())),
    stressSheet(),
    threeSheet(state.three),
    decisionsSheet(state.decisions),
    checklistSheet('72 часа', 'Первые 72 часа', 'Назначьте ответственного, срок и зафиксируйте препятствие или нужное решение', STEPS_72, state.done72, state.meta72),
    checklistSheet('План 30 дней', 'План на тридцать дней', 'Улучшения разблокируются только после стабилизации. Внесите ответственного, срок и препятствие', PLAN_30, state.done30, state.meta30, true),
    teamSheet(state.team),
    phrasesSheet(),
    journalSheet(state.journal),
    summarySheet(),
    paramsSheet(state.params),
  ]);
}