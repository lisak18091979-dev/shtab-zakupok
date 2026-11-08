import { useState } from 'react';
import { Check, Copy } from 'lucide-react';

export default function CopyButton({ text, label = 'Копировать', className = 'btn-ghost' }) {
  const [ok, setOk] = useState(false);
  const copy = () => navigator.clipboard.writeText(text).then(() => { setOk(true); setTimeout(() => setOk(false), 1500); });
  return (
    <button onClick={copy} className={className}>
      {ok ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />} {ok ? 'Скопировано' : label}
    </button>
  );
}