import { useEffect, useState } from 'react';
import { DEFAULT_STATE } from './defaults';

const KEY = 'shtab-zakupok-v2';
const fresh = () => structuredClone(DEFAULT_STATE);

// Данные штаба хранятся только в этом браузере
export default function useShtab() {
  const [state, setState] = useState(() => ({ ...fresh(), ...JSON.parse(localStorage.getItem(KEY) || '{}') }));

  useEffect(() => {
    localStorage.setItem(KEY, JSON.stringify(state));
  }, [state]);

  const patch = (key, val) => setState((s) => ({ ...s, [key]: typeof val === 'function' ? val(s[key]) : val }));
  const reset = () => setState(fresh());

  return { state, patch, reset };
}