'use client';

import { motion } from 'framer-motion';
import { Activity, Award, Flame, Trophy, UserRound, Users, Zap } from 'lucide-react';
import Image from 'next/image';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { currentUser } from '@/lib/mock-data';
import { getUserById, useClubData } from '@/services/circle-service';
import { circleClubs, useCircleStore } from '@/store/circle-store';
import { BottomNav } from './bottom-nav';
import { Header, Screen } from './shared';
import { WeeklyGoalRings } from './weekly-goal-rings';

export function HomeScreen({ onOpenClub, onProfile }: { onOpenClub: (id: string) => void; onProfile: () => void }) {
  const streak = useCircleStore((state) => state.streak);
  const totalPoints = useCircleStore((state) => state.totalPoints);
  const checkIns = useCircleStore((state) => state.checkIns);
  const referralBonusClaimed = useCircleStore((state) => state.referralBonusClaimed);
  const achievements = [streak >= 7, streak >= 30, totalPoints >= 100, checkIns.length >= 1, referralBonusClaimed].filter(Boolean).length;

  return (
    <Screen>
      <Header title="Circle" right={<button onClick={onProfile} className="rounded-full bg-white/10 p-2 active:scale-95"><UserRound size={19} /></button>} />
      <Card className="overflow-hidden bg-gradient-to-br from-emerald-300/20 to-cyan-300/10 shadow-[0_0_42px_rgba(52,211,153,0.12)]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-muted-foreground">Твоя серия</p>
            <motion.p className="text-7xl font-black leading-none drop-shadow-[0_0_18px_rgba(52,211,153,0.35)]" animate={{ scale: [1, 1.04, 1] }} transition={{ duration: 1.6, repeat: Infinity }}>{streak}</motion.p>
          </div>
          <motion.div animate={{ y: [0, -4, 0], rotate: [-3, 5, -3] }} transition={{ duration: 1.4, repeat: Infinity }}>
            <Flame className="text-emerald-300 drop-shadow-[0_0_20px_rgba(52,211,153,0.55)]" size={58} />
          </motion.div>
        </div>
        <Progress value={(streak % 7) * 14.28} className="mt-5" />
        <p className="mt-2 text-xs text-muted-foreground">Ещё {7 - (streak % 7 || 7)} дней до недельной награды</p>
      </Card>
      <WeeklyGoalRings checkInCount={checkIns.length} streak={streak} />
      <div className="grid grid-cols-2 gap-3">
        <Metric icon={<Zap size={18} />} label="Баллы" value={totalPoints} />
        <Metric icon={<Award size={18} />} label="Достижения" value={achievements} />
      </div>
      <div className="space-y-3">
        {circleClubs.map((club) => <ClubCard key={club.id} clubId={club.id} onOpen={() => onOpenClub(club.id)} />)}
      </div>
      <BottomNav active="home" onHome={() => undefined} onClub={() => onOpenClub(circleClubs[0].id)} onProfile={onProfile} />
    </Screen>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return <Card className="flex items-center gap-3"><div className="rounded-2xl bg-white/10 p-2 text-emerald-300">{icon}</div><div><p className="text-xs text-muted-foreground">{label}</p><p className="text-lg font-black">{value}</p></div></Card>;
}

function ClubCard({ clubId, onOpen }: { clubId: string; onOpen: () => void }) {
  const { club, activities, leaderboard } = useClubData(clubId);
  const reports = useCircleStore((state) => state.reports);
  const telegramUser = useCircleStore((state) => state.telegramUser);
  const lastReportDate = useCircleStore((state) => state.lastReportDate);
  const leader = leaderboard[0];
  const currentUserId = String(telegramUser?.id ?? currentUser.telegramId);
  const pendingReport = reports.some((report) => report.clubId === clubId && report.userId === currentUserId && report.status === 'pending');
  const reportCompletedToday = lastReportDate[clubId] === new Date().toLocaleDateString('en-CA');
  const reportStatus = pendingReport ? 'На проверке' : reportCompletedToday ? 'Выполнено (До завтра)' : 'Сдать отчет';
  const reportStatusClass = pendingReport ? 'border-amber-300/25 bg-amber-300/10 text-amber-100' : reportCompletedToday ? 'border-emerald-300/25 bg-emerald-300/10 text-emerald-100' : 'border-white/10 bg-white/5 text-muted-foreground';

  return (
    <button onClick={onOpen} className="w-full text-left active:scale-[0.99]">
      <Card className="overflow-hidden p-0">
        <div className="relative h-36">
          <Image src={club.image} alt={club.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />
          <div className="absolute bottom-3 left-3 right-3">
            <h3 className="text-2xl font-black">{club.title}</h3>
            <p className="line-clamp-1 text-sm text-white/75">{club.description}</p>
          </div>
        </div>
        <div className="space-y-3 p-4">
          <div className="grid grid-cols-3 gap-2 text-sm">
            <span className="flex items-center gap-1 text-muted-foreground"><Users size={15} /> {leaderboard.length}/{club.memberLimit}</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Trophy size={15} /> #{leaderboard.find((x) => x.userId === currentUser.id)?.rank ?? 4}</span>
            <span className="flex items-center gap-1 text-muted-foreground"><Activity size={15} /> {activities.length}</span>
          </div>
          <div className={`rounded-2xl border px-3 py-2 text-xs font-bold ${reportStatusClass}`}>{reportStatus}</div>
          {leader && <div className="flex items-center justify-between rounded-2xl bg-white/5 p-3"><span className="text-xs text-muted-foreground">Лидер: {getUserById(leader.userId).firstName}</span><span className="text-sm font-black text-emerald-300">{leader.score}</span></div>}
        </div>
      </Card>
    </button>
  );
}
