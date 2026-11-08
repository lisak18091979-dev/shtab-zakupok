import { useEffect, useState } from 'react';
import { DEFAULT_STATE, EXAMPLE_STATE } from './defaults';

const KEY = 'shtab-zakupok-v2';
const fresh = () => structuredClone(DEFAULT_STATE);

// Данные штаба хранятся только в этом браузере
export default function useShtab() {
  const [state, setState] = useState(() => { try { return { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch { return fresh(); } });
  const [isExample, setIsExample] = useState(false);

  useEffect(() => {
    if (!isExample) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, isExample]);

  const patch = (key, val) => setState((s) => ({ ...s, [key]: typeof val === 'function' ? val(s[key]) : val }));
  const loadExample = () => { setState(structuredClone(EXAMPLE_STATE)); setIsExample(true); };
  const returnToMyData = () => {
    let saved = fresh();
    try { saved = { ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }; } catch {}
    setState(saved); setIsExample(false);
  };
  const reset = () => { localStorage.removeItem(KEY); setState(fresh()); setIsExample(false); };

  return { state, patch, reset, isExample, loadExample, returnToMyData };
}