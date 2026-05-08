'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { Award, CheckCircle2, Flame, Footprints, Route, Trophy, Users, Zap } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Screen } from './shared';

const screens = [
  {
    title: 'Дисциплина через комьюнити',
    description: 'Выполняй ежедневные цели вместе с другими участниками и не теряй streak.',
    content: <HeroMark />
  },
  {
    title: 'Растущий рейтинг',
    description: 'Каждый день активности увеличивает твой рейтинг.',
    content: <MechanicsGrid />
  },
  {
    title: 'Клубы по твоему ритму',
    description: 'Выбери клуб и начни первый check-in.',
    content: <ClubPreview />
  },
  {
    title: 'Готов начать Circle?',
    description: 'Один check-in в день — и твоя дисциплина становится видимой для комьюнити.',
    content: <FinalPreview />
  }
];

export function OnboardingScreen({ onStart }: { onStart: () => void }) {
  const [index, setIndex] = useState(0);
  const screen = screens[index];
  const next = () => (index === screens.length - 1 ? onStart() : setIndex((value) => value + 1));
  const previous = () => setIndex((value) => Math.max(0, value - 1));

  return (
    <Screen>
      <div className="flex min-h-[calc(100vh-112px)] flex-1 flex-col overflow-hidden">
        <div className="flex items-center justify-between pt-1">
          <div className="flex items-center gap-2">
            {screens.map((item, itemIndex) => <button key={item.title} aria-label={`Onboarding screen ${itemIndex + 1}`} onClick={() => setIndex(itemIndex)} className={`h-1.5 rounded-full transition-all ${itemIndex === index ? 'w-8 bg-emerald-300' : 'w-2 bg-white/15'}`} />)}
          </div>
          <button onClick={onStart} className="text-sm font-bold text-muted-foreground active:scale-95">Skip</button>
        </div>

        <div className="flex flex-1 items-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={screen.title}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              onDragEnd={(_, info) => {
                if (info.offset.x < -80) next();
                if (info.offset.x > 80) previous();
              }}
              initial={{ opacity: 0, x: 42, scale: 0.98 }}
              animate={{ opacity: 1, x: 0, scale: 1 }}
              exit={{ opacity: 0, x: -42, scale: 0.98 }}
              transition={{ duration: 0.28 }}
              className="w-full touch-pan-y select-none text-center"
            >
              <div className="mx-auto max-w-sm">
                {screen.content}
                <h1 className="mt-8 text-balance text-4xl font-black tracking-tight">{screen.title}</h1>
                <p className="mx-auto mt-4 max-w-xs text-balance text-muted-foreground">{screen.description}</p>
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="space-y-3 pb-2">
          <Button onClick={next} className="w-full">{index === screens.length - 1 ? 'Начать' : 'Далее'}</Button>
          {index > 0 && <button onClick={previous} className="w-full rounded-2xl py-3 text-sm font-bold text-muted-foreground active:scale-95">Назад</button>}
        </div>
      </div>
    </Screen>
  );
}

function HeroMark() {
  return (
    <div className="relative mx-auto flex h-64 w-64 items-center justify-center">
      <motion.div animate={{ scale: [1, 1.08, 1], opacity: [0.35, 0.65, 0.35] }} transition={{ repeat: Infinity, duration: 2.6 }} className="absolute inset-4 rounded-full bg-emerald-300/20 blur-2xl" />
      <motion.div animate={{ y: [0, -8, 0], rotate: [-2, 3, -2] }} transition={{ repeat: Infinity, duration: 2.2 }} className="relative flex h-32 w-32 items-center justify-center rounded-[2.25rem] bg-gradient-to-br from-emerald-300 to-cyan-300 text-5xl font-black text-slate-950 shadow-[0_0_48px_rgba(52,211,153,0.28)]">
        C
      </motion.div>
    </div>
  );
}

function MechanicsGrid() {
  const items = [
    { icon: <Flame size={22} />, label: 'streak' },
    { icon: <Trophy size={22} />, label: 'leaderboard' },
    { icon: <CheckCircle2 size={22} />, label: 'check-in' },
    { icon: <Award size={22} />, label: 'rewards' }
  ];

  return (
    <div className="mx-auto grid max-w-xs grid-cols-2 gap-3">
      {items.map((item, itemIndex) => (
        <motion.div key={item.label} initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: itemIndex * 0.08 }}>
          <Card className="flex aspect-square flex-col items-center justify-center gap-3 bg-white/[0.04] text-emerald-300">
            {item.icon}
            <span className="text-sm font-black text-white">{item.label}</span>
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function ClubPreview() {
  const clubs = [
    { icon: <Footprints size={18} />, title: '10 000 шагов' },
    { icon: <Route size={18} />, title: 'Бег' },
    { icon: <Zap size={18} />, title: 'Тренировки' }
  ];

  return (
    <div className="mx-auto w-full max-w-xs space-y-3">
      {clubs.map((club, clubIndex) => (
        <motion.div key={club.title} initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: clubIndex * 0.08 }}>
          <Card className="flex items-center justify-between bg-white/[0.04]">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-emerald-300/15 p-3 text-emerald-300">{club.icon}</div>
              <span className="font-black">{club.title}</span>
            </div>
            <Users className="text-muted-foreground" size={18} />
          </Card>
        </motion.div>
      ))}
    </div>
  );
}

function FinalPreview() {
  return (
    <div className="mx-auto max-w-xs rounded-[2rem] border border-emerald-300/20 bg-gradient-to-br from-emerald-300/15 to-cyan-300/5 p-5 shadow-[0_0_42px_rgba(52,211,153,0.12)]">
      <div className="flex items-center justify-between">
        <div className="text-left">
          <p className="text-sm text-muted-foreground">Сегодня</p>
          <p className="text-4xl font-black">0 🔥</p>
        </div>
        <div className="rounded-3xl bg-emerald-300 px-4 py-3 text-sm font-black text-slate-950">Check-in</div>
      </div>
      <div className="mt-5 h-2 rounded-full bg-white/10">
        <motion.div className="h-2 rounded-full bg-emerald-300" initial={{ width: '0%' }} animate={{ width: '72%' }} transition={{ duration: 1 }} />
      </div>
    </div>
  );
}
