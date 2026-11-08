import { useEffect, useState } from 'react';
import { DEFAULT_STATE, EXAMPLE_STATE } from './defaults';

const KEY = 'shtab-zakupok-v2';
const fresh = () => structuredClone(DEFAULT_STATE);
const loadSaved = () => {
  try {
    const saved = JSON.parse(localStorage.getItem(KEY) || '{}');
    if (saved.three && Object.values(saved.three).every((v) => Number(v) === 0)) {
      saved.three = Object.fromEntries(Object.keys(DEFAULT_STATE.three).map((k) => [k, null]));
    }
    return { ...fresh(), ...saved };
  } catch {
    return fresh();
  }
};

// Данные штаба хранятся только в этом браузере
export default function useShtab() {
  const [state, setState] = useState(loadSaved);
  const [isExample, setIsExample] = useState(false);

  useEffect(() => {
    if (!isExample) localStorage.setItem(KEY, JSON.stringify(state));
  }, [state, isExample]);

  const patch = (key, val) => setState((s) => ({ ...s, [key]: typeof val === 'function' ? val(s[key]) : val }));
  const loadExample = () => { setState(structuredClone(EXAMPLE_STATE)); setIsExample(true); };
  const returnToMyData = () => {
    setState(loadSaved()); setIsExample(false);
  };
  const reset = () => { localStorage.removeItem(KEY); setState(fresh()); setIsExample(false); };

  return { state, patch, reset, isExample, loadExample, returnToMyData };
}