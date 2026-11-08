import { useEffect, useState } from 'react';
import { DEFAULT_STATE, EXAMPLE_STATE } from './defaults';

const KEY = 'shtab-zakupok-v3';
const LEGACY = 'shtab-zakupok-v2';
const HANDLED = 'shtab-zakupok-legacy-handled';
const fresh = () => structuredClone(DEFAULT_STATE);
const readState = (key) => {
  try {
    const saved = JSON.parse(localStorage.getItem(key) || '{}');
    const base = fresh();
    return { ...base, ...saved, params: { ...base.params, ...saved.params }, three: { ...base.three, ...saved.three } };
  } catch {
    return fresh();
  }
};
const loadSaved = () => readState(KEY);

// Данные штаба хранятся только в этом браузере
export default function useShtab() {
  const [state, setState] = useState(loadSaved);
  const [isExample, setIsExample] = useState(false);
  const [legacyAvailable, setLegacyAvailable] = useState(() => !!localStorage.getItem(LEGACY) && !localStorage.getItem(HANDLED));

  useEffect(() => {
    if (!isExample) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, isExample]);

  const patch = (key, val) => setState((s) => ({ ...s, [key]: typeof val === 'function' ? val(s[key]) : val }));
  const loadExample = () => { setState(structuredClone(EXAMPLE_STATE)); setIsExample(true); };
  const returnToMyData = () => {
    setState(loadSaved()); setIsExample(false);
  };
  const reset = () => { localStorage.removeItem(KEY); setState(fresh()); setIsExample(false); };
  const dismissLegacy = () => { localStorage.setItem(HANDLED, '1'); setLegacyAvailable(false); };
  const restoreLegacy = () => {
    setState(readState(LEGACY)); setIsExample(false); dismissLegacy();
  };

  return { state, patch, reset, isExample, loadExample, returnToMyData, legacyAvailable, restoreLegacy, dismissLegacy };
}