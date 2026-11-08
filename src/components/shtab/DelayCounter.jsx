import { useEffect, useState } from 'react';

export default function DelayCounter({ perDay }) {
  const [sec, setSec] = useState(0);
  useEffect(() => {
    const t0 = Date.now();
    const t = setInterval(() => setSec((Date.now() - t0) / 1000), 200);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="bg-mal text-white p-8 text-center">
      <p className="text-[10px] font-extrabold tracking-[0.25em] opacity-85">УТЕКЛО ЗА ЭТОТ ВИЗИТ, РУБЛЕЙ</p>
      <p className="font-heading text-5xl sm:text-7xl font-extrabold mt-3 tabular-nums">{Math.round((perDay / 86400) * sec).toLocaleString('ru-RU')}</p>
      <p className="mt-3 text-sm opacity-85">Цена промедления: {perDay.toLocaleString('ru-RU')} ₽ в сутки. Покажите на планёрке.</p>
    </div>
  );
}