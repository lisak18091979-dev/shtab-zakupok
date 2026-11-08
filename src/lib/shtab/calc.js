import { format } from 'date-fns';
import { LEVELS, PLAN_30, STEPS_72 } from './defaults';

export const fmt = (n) => {
  const a = Math.abs(n || 0);
  const s = a >= 1000
    ? (a / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + ' млрд ₽'
    : a.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' млн ₽';
  return (n < 0 ? '−' : '') + s;
};
export const fmtNum = (n) => (n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 1 });

const factor = (effect, slow) => (effect === 'Остановит линию' ? 1 : effect === 'Замедлит' ? (slow == null ? null : slow / 100) : 0);
const sumKnown = (rows, k) => rows.reduce((s, r) => s + (Number.isFinite(r[k]) ? r[k] : 0), 0);

export function coverageOf(it) {
  const inventoryMode = it.stockMode || (it.onhand != null && +it.perday > 0 ? 'quantity' : it.stock != null ? 'days' : 'quantity');
  const auto = inventoryMode === 'quantity' && it.onhand != null && +it.perday > 0;
  const stockKnown = inventoryMode === 'quantity' ? auto : it.stock != null;
  const stock = auto ? Math.round((+it.onhand / +it.perday) * 10) / 10 : stockKnown ? +it.stock : 0;
  return { inventoryMode, auto, stockKnown, stock };
}

export function analyze(state) {
  const { params: p, three: t } = state;
  const rows = state.items.map((it) => {
    const { inventoryMode, auto, stockKnown, stock } = coverageOf(it);
    const replacementKnown = it.replace != null, effectKnown = ['Остановит линию', 'Замедлит', 'Заменим сразу'].includes(it.effect);
    const costKnown = it.dayCost != null && +it.dayCost > 0, cost = +it.dayCost || 0, f = factor(it.effect, p.slowShare);
    const complete = stockKnown && replacementKnown && effectKnown;
    const unc = complete ? Math.max(0, (+it.replace || 0) - stock) : null;
    const missing = [];
    if (!stockKnown) missing.push('внести остаток и расход в сутки или запас в днях');
    if (!replacementKnown) missing.push('уточнить срок замены');
    if (!effectKnown) missing.push('уточнить влияние на производство');
    if (complete && unc > 0 && it.effect !== 'Заменим сразу' && !costKnown) missing.push('внести цену дня простоя');
    if (complete && unc > 0 && it.effect === 'Замедлит' && p.slowShare == null) missing.push('выбрать долю потери мощности');
    if (complete && p.breakDays != null && p.breakDays > stock && it.effect === 'Замедлит' && p.slowShare == null && !missing.includes('выбрать долю потери мощности')) missing.push('выбрать долю потери мощности');
    const status = !complete ? 'unknown' : unc === 0 ? 'green' : it.effect === 'Остановит линию' ? 'red' : 'yellow';
    const risk = !complete ? null : unc === 0 || f === 0 ? 0 : f == null || !costKnown ? null : unc * cost * f;
    const lossDays = p.breakDays == null || !stockKnown ? null : Math.max(0, p.breakDays - stock);
    const loss = lossDays == null ? null : lossDays === 0 ? 0 : !complete ? null : f === 0 ? 0 : f == null || !costKnown ? null : lossDays * cost * f;
    return {
      ...it, name: it.name || '', manualStock: it.stock ?? null, inventoryMode, auto, stock, stockKnown, unc, status, missing, incomplete: missing.length > 0,
      risk, loss,
    };
  });
  const valid = rows.filter((r) => r.name.trim());
  const reds = valid.filter((r) => r.status === 'red');
  const unknown = valid.filter((r) => r.incomplete);
  const ebitda = (t.spend * t.price * t.real) / 10000;
  const cash = (t.spend / 365) * (t.defer + t.stock);
  const interest = (cash * t.rate) / 100;
  const riskCut = Math.max(0, t.d0 - t.d1) * t.dayc;
  const riskUnknown = valid.filter((r) => r.risk == null).length;
  const lossUnknown = valid.filter((r) => r.loss == null).length;
  const overload = p.people != null && reds.length > p.people * 3;
  const yellows = valid.filter((r) => r.status === 'yellow').length;
  const uncontrolled = reds.some((r) => !r.owner?.trim() || !r.nextStep?.trim());
  const level = !valid.length ? 'empty'
    : overload ? 'overload'
    : uncontrolled ? 'unassigned'
    : unknown.length ? 'incomplete'
    : reds.length ? 'managed'
    : yellows ? 'watch' : 'stable';
  const step = (list, done) => list.find((_, i) => !done[i])?.[1];
  return {
    rows, valid, reds, unknown,
    yellows,
    greens: valid.filter((r) => r.status === 'green').length,
    risk: sumKnown(valid, 'risk'), loss: sumKnown(valid, 'loss'), riskUnknown, lossUnknown,
    byOwner: Object.entries(reds.reduce((m, r) => { const k = (r.owner || '').trim() || 'Не назначен'; (m[k] = m[k] || []).push(r); return m; }, {})),
    today: [...reds].sort((a, b) => (b.risk || 0) - (a.risk || 0))[0],
    falling: valid.filter((r) => r.loss > 0).sort((a, b) => a.stock - b.stock)[0],
    ebitda, cash, interest, riskCut,
    pending: state.decisions.filter((d) => d.status === 'Ждёт решения').length,
    done30: PLAN_30.filter((_, i) => state.done30[i]).length,
    done72: STEPS_72.filter((_, i) => state.done72[i]).length,
    step30: step(PLAN_30, state.done30), step72: step(STEPS_72, state.done72),
    overload, level,
  };
}

export function briefText(state, a) {
  const last = state.journal.slice(-3).reverse().map((j) => j.text);
  const cond = LEVELS[a.level].label.toLocaleLowerCase('ru-RU');
  return [
    `Сводка по закупкам на ${format(new Date(), 'dd.MM.yyyy')}`, '',
    `Состояние: ${cond}.`, `Красных позиций: ${a.reds.length}.`,
    `Риск, не закрытый запасом: ${fmt(a.risk)}${a.riskUnknown ? `, не оценено позиций: ${a.riskUnknown}` : ''}.`,
    ...(a.reds.length ? ['', 'Красные позиции:', ...[...a.reds].sort((x, y) => (y.risk || 0) - (x.risk || 0)).map((r) => `• ${r.name}: запас ${fmtNum(r.stock)} дн., замена ${fmtNum(+r.replace)} дн., риск ${r.risk == null ? 'не оценён' : fmt(r.risk)}${r.owner ? ', ведёт ' + r.owner : ''}${r.nextStep ? '. ' + r.nextStep : ''}`), ''] : []), `Шагов плана выполнено: ${a.done30} из ${PLAN_30.length}.`, '',
    `Сделано: ${last.length ? last.join('; ') + '.' : 'записей пока нет.'}`,
    `Сегодня делаю: ${a.step30 || 'план закрыт, открываю улучшения'}.`, '',
    `Ждут вашего решения: ${a.pending}. Если ситуация изменится, сообщу сразу и с цифрами.`, '',
    'С уважением,', 'директор по закупкам',
  ].join('\n');
}