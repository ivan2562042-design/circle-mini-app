'use client';

import { motion } from 'framer-motion';
import { Dumbbell, Footprints, Route } from 'lucide-react';
import { Card } from '@/components/ui/card';

type Goal = {
  label: string;
  value: number;
  target: number;
  unit: string;
  color: string;
  icon: JSX.Element;
};

export function WeeklyGoalRings({ checkInCount, streak }: { checkInCount: number; streak: number }) {
  const goals: Goal[] = [
    { label: 'Steps goal', value: Math.min(70000, checkInCount * 10000 + streak * 1200), target: 70000, unit: 'steps', color: '#34d399', icon: <Footprints size={16} /> },
    { label: 'Running', value: Math.min(15, checkInCount * 2.5 + streak * 0.4), target: 15, unit: 'km', color: '#22d3ee', icon: <Route size={16} /> },
    { label: 'Training', value: Math.min(4, checkInCount), target: 4, unit: 'sessions', color: '#a78bfa', icon: <Dumbbell size={16} /> }
  ];

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-300">Weekly goals</p>
          <h3 className="text-lg font-black">Retention rings</h3>
        </div>
        <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-muted-foreground">live</span>
      </div>
      <div className="grid grid-cols-3 gap-3">
        {goals.map((goal) => <GoalRing key={goal.label} goal={goal} />)}
      </div>
    </Card>
  );
}

function GoalRing({ goal }: { goal: Goal }) {
  const progress = Math.min(100, Math.round((goal.value / goal.target) * 100));
  const radius = 34;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="rounded-3xl bg-white/[0.03] p-3 text-center">
      <div className="relative mx-auto h-24 w-24">
        <svg className="h-24 w-24 -rotate-90" viewBox="0 0 88 88">
          <circle cx="44" cy="44" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="8" fill="none" />
          <motion.circle cx="44" cy="44" r={radius} stroke={goal.color} strokeWidth="8" strokeLinecap="round" fill="none" strokeDasharray={circumference} initial={{ strokeDashoffset: circumference }} animate={{ strokeDashoffset: offset }} transition={{ duration: 0.9, ease: 'easeOut' }} />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <div className="mb-1 text-emerald-200">{goal.icon}</div>
          <span className="text-lg font-black">{progress}%</span>
        </div>
      </div>
      <p className="mt-2 text-xs font-bold">{goal.label}</p>
      <p className="text-[11px] text-muted-foreground">{Math.round(goal.value)}/{goal.target} {goal.unit}</p>
    </div>
  );
}
