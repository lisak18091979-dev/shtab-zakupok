import { format } from 'date-fns';
import { PLAN_30, STEPS_72 } from './defaults';

export const fmt = (n) => {
  const a = Math.abs(n || 0);
  const s = a >= 1000
    ? (a / 1000).toLocaleString('ru-RU', { maximumFractionDigits: 2 }) + ' млрд ₽'
    : a.toLocaleString('ru-RU', { maximumFractionDigits: 1 }) + ' млн ₽';
  return (n < 0 ? '−' : '') + s;
};
export const fmtNum = (n) => (n || 0).toLocaleString('ru-RU', { maximumFractionDigits: 1 });

const factor = (effect, slow) => (effect === 'Остановит линию' ? 1 : effect === 'Замедлит' ? slow / 100 : 0);
const sum = (rows, k) => rows.reduce((s, r) => s + r[k], 0);

export function analyze(state) {
  const { params: p, three: t } = state;
  const rows = state.items.map((it) => {
    const auto = (+it.onhand || 0) > 0 && (+it.perday || 0) > 0;
    const stock = auto ? Math.round((it.onhand / it.perday) * 10) / 10 : +it.stock || 0, cost = +it.dayCost || 0, f = factor(it.effect, p.slowShare);
    const unc = Math.max(0, (+it.replace || 0) - stock);
    const status = unc === 0 ? 'green' : it.effect === 'Остановит линию' ? 'red' : 'yellow';
    return { ...it, name: it.name || '', auto, stock, unc, status, risk: unc * cost * f, loss: Math.max(0, p.breakDays - stock) * cost * f };
  });
  const valid = rows.filter((r) => r.name.trim());
  const reds = valid.filter((r) => r.status === 'red');
  const ebitda = (t.spend * t.price * t.real) / 10000;
  const cash = (t.spend / 365) * (t.defer + t.stock);
  const interest = (cash * t.rate) / 100;
  const riskCut = Math.max(0, t.d0 - t.d1) * t.dayc;
  const total = ebitda + interest + riskCut;
  const overload = reds.length > p.people * 3;
  const step = (list, done) => list.find((_, i) => !done[i])?.[1];
  return {
    rows, valid, reds,
    greens: valid.filter((r) => r.status === 'green').length,
    risk: sum(valid, 'risk'), loss: sum(valid, 'loss'),
    byOwner: Object.entries(reds.reduce((m, r) => { const k = (r.owner || '').trim() || 'Не назначен'; (m[k] = m[k] || []).push(r); return m; }, {})),
    today: [...reds].sort((a, b) => b.risk - a.risk)[0],
    falling: valid.filter((r) => r.loss > 0).sort((a, b) => a.stock - b.stock)[0],
    ebitda, cash, interest, riskCut, total, perDay: Math.round((total * 1e6) / 365),
    pending: state.decisions.filter((d) => d.status === 'Ждёт решения').length,
    done30: PLAN_30.filter((_, i) => state.done30[i]).length,
    done72: STEPS_72.filter((_, i) => state.done72[i]).length,
    step30: step(PLAN_30, state.done30), step72: step(STEPS_72, state.done72),
    overload, level: reds.length === 0 ? 'stable' : overload ? 'overload' : 'managed',
  };
}

export function briefText(state, a) {
  const last = state.journal.slice(-3).reverse().map((j) => j.text);
  const cond = a.level === 'stable' ? 'стабильное' : a.level === 'overload' ? 'напряжённое, красного больше, чем рук' : 'управляемое';
  return [
    `Сводка по закупкам на ${format(new Date(), 'dd.MM.yyyy')}`, '',
    `Состояние: ${cond}.`, `Красных позиций: ${a.reds.length}.`,
    `Риск, не закрытый запасом: ${fmt(a.risk)}.`,
    ...(a.reds.length ? ['', 'Красные позиции:', ...[...a.reds].sort((x, y) => y.risk - x.risk).map((r) => `• ${r.name}: запас ${fmtNum(r.stock)} дн., замена ${fmtNum(+r.replace)} дн., риск ${fmt(r.risk)}${r.owner ? ', ведёт ' + r.owner : ''}${r.nextStep ? '. ' + r.nextStep : ''}`), ''] : []), `Шагов плана выполнено: ${a.done30} из ${PLAN_30.length}.`, '',
    `Сделано: ${last.length ? last.join('; ') + '.' : 'записей пока нет.'}`,
    `Сегодня делаю: ${a.step30 || 'план закрыт, открываю улучшения'}.`, '',
    `Ждут вашего решения: ${a.pending}. Если ситуация изменится, сообщу сразу и с цифрами.`, '',
    'С уважением,', 'директор по закупкам',
  ].join('\n');
}