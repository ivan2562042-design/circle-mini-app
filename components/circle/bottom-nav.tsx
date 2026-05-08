'use client';

import { Flame, Home, UserRound } from 'lucide-react';

export type CircleTab = 'home' | 'club' | 'profile';

export function BottomNav({ active, onHome, onClub, onProfile }: { active: CircleTab; onHome: () => void; onClub: () => void; onProfile: () => void }) {
  const itemClass = (tab: CircleTab) => `flex flex-col items-center gap-1 rounded-2xl py-2 text-[11px] font-bold transition active:scale-95 ${active === tab ? 'bg-white/10 text-emerald-300' : 'text-muted-foreground'}`;

  return (
    <nav className="sticky bottom-3 mt-auto grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-slate-950/85 p-2 shadow-2xl backdrop-blur-xl">
      <button onClick={onHome} className={itemClass('home')}><Home size={20} />Главная</button>
      <button onClick={onClub} className={itemClass('club')}><Flame size={20} />Клубы</button>
      <button onClick={onProfile} className={itemClass('profile')}><UserRound size={20} />Профиль</button>
    </nav>
  );
}
