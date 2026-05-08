'use client';

import { motion } from 'framer-motion';
import { Camera, CheckCircle2, Flame, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import confetti from 'canvas-confetti';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { triggerHaptic } from '@/lib/telegram-haptics';
import { currentUser } from '@/lib/mock-data';
import { getUserById, useClubData } from '@/services/circle-service';
import { circleClubs, useCircleStore } from '@/store/circle-store';
import { BottomNav } from './bottom-nav';
import { CheckInModal } from './check-in-modal';
import { Header, Screen } from './shared';
import { ShareProgressModal } from './share-progress-modal';

export function ClubScreen({ clubId, onBack, onHome, onProfile }: { clubId: string; onBack: () => void; onHome: () => void; onProfile: () => void }) {
  const { club, activities, leaderboard } = useClubData(clubId);
  const streak = useCircleStore((state) => state.streak);
  const addCheckIn = useCircleStore((state) => state.addCheckIn);
  const checkIns = useCircleStore((state) => state.checkIns);
  const referralBonusClaimed = useCircleStore((state) => state.referralBonusClaimed);
  const claimReferralBonus = useCircleStore((state) => state.claimReferralBonus);
  const [modalOpen, setModalOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [lastCheckInPoints, setLastCheckInPoints] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [toast, setToast] = useState('');
  const [success, setSuccess] = useState(false);
  const alreadyCheckedIn = useMemo(() => {
    const today = new Date().toISOString().slice(0, 10);
    return checkIns.some((item) => item.clubId === clubId && item.createdAt.slice(0, 10) === today);
  }, [checkIns, clubId]);

  const submitCheckIn = async (image: string, note: string) => {
    setSubmitting(true);
    setError('');
    const result = await addCheckIn(clubId, image, note);
    setSubmitting(false);

    if (!result.ok) {
      setError(result.message);
      return;
    }

    setModalOpen(false);
    setSuccess(true);
    setToast(`${result.message} · +${result.points} points`);
    setLastCheckInPoints(result.points);
    setShareOpen(true);
    triggerHaptic('success');

    if (result.milestone) {
      triggerHaptic('heavy');
      confetti({ particleCount: 120, spread: 80, origin: { y: 0.72 } });
    }

    window.setTimeout(() => setSuccess(false), 1400);
    window.setTimeout(() => setToast(''), 3400);
  };
  const userRank = leaderboard.find((entry) => entry.userId === currentUser.id)?.rank ?? 1;

  const shareProgress = () => {
    const message = `🔥 Я держу streak уже ${streak} дней в Circle\n\n🚶 Сегодня:\n${club.title}\n\n🏆 Место в клубе: #${userRank}\n\nПрисоединяйся:\n@circle_habits_bot`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/circle_habits_bot')}&text=${encodeURIComponent(message)}`;
    const webApp = window.Telegram?.WebApp as { openTelegramLink?: (url: string) => void } | undefined;
    webApp?.openTelegramLink?.(shareUrl) ?? window.open(shareUrl, '_blank', 'noopener,noreferrer');
    const claimed = claimReferralBonus();

    if (claimed) {
      setToast('Referral badge получен · +50 points');
      triggerHaptic('success');
      window.setTimeout(() => setToast(''), 3400);
    }
  };

  return (
    <Screen>
      <Header title={club.title} onBack={onBack} />
      {success && (
        <motion.div className="pointer-events-none fixed inset-0 z-40 flex items-center justify-center px-4" initial={{ opacity: 0, scale: 0.85 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 1.08 }}>
          <div className="rounded-[2rem] border border-emerald-300/30 bg-slate-950/90 px-7 py-6 text-center shadow-2xl shadow-emerald-950/40 backdrop-blur">
            <motion.div animate={{ rotate: [0, -8, 8, 0], scale: [1, 1.16, 1] }} transition={{ duration: 0.7 }} className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-300 text-slate-950">
              <CheckCircle2 size={34} />
            </motion.div>
            <p className="text-lg font-black">{success ? 'Check-in подтверждён' : 'Streak растёт'}</p>
            <p className="text-sm text-muted-foreground">Streak и points обновлены</p>
          </div>
        </motion.div>
      )}
      {toast && (
        <motion.div className="fixed left-4 right-4 top-4 z-50 mx-auto flex max-w-md items-center gap-3 rounded-3xl border border-emerald-300/20 bg-slate-950/95 p-3 text-sm shadow-2xl shadow-emerald-950/30 backdrop-blur" initial={{ opacity: 0, y: -18 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -18 }}>
          <Sparkles className="text-emerald-300" size={18} />
          <span className="font-semibold">{toast}</span>
        </motion.div>
      )}
      <Card className="overflow-hidden p-0">
        <div className="relative h-44">
          <Image src={club.image} alt={club.title} fill className="object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
            <div><p className="text-sm text-white/70">Club progress</p><h1 className="text-3xl font-black">{club.title}</h1></div>
            <div className="rounded-2xl bg-emerald-300 px-3 py-2 text-sm font-black text-slate-950">{streak} 🔥</div>
          </div>
        </div>
        <div className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">{club.description}</p>
          <Progress value={Math.min(100, streak * 7)} />
          <Button onClick={() => { setError(''); setModalOpen(true); }} disabled={alreadyCheckedIn} className="w-full">
            <Camera className="mr-2" size={18} />
            {alreadyCheckedIn ? 'Check-in уже выполнен' : 'Check-in сегодня'}
          </Button>
        </div>
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between"><h3 className="font-black">Leaderboard</h3><Flame className="text-emerald-300" size={18} /></div>
        <div className="space-y-3">{leaderboard.slice(0, 5).map((entry) => <motion.div layout key={entry.userId} className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-2"><div className="flex items-center gap-3"><span className="w-7 font-black text-emerald-300">#{entry.rank}</span><Image src={getUserById(entry.userId).avatar} alt="avatar" width={36} height={36} className="rounded-full" /><div><p className="font-bold">{getUserById(entry.userId).firstName}</p><p className="text-xs text-muted-foreground">{entry.streak} day streak</p></div></div><p className="font-black">{entry.score}</p></motion.div>)}</div>
      </Card>
      <Card>
        <h3 className="mb-3 font-black">Activity feed</h3>
        <div className="space-y-3">{activities.map((item) => <motion.div layout key={item.id} className="flex gap-3"><Image src={item.image} alt="activity" width={56} height={56} unoptimized className="h-14 w-14 rounded-2xl object-cover" /><div><p className="text-sm font-bold">{getUserById(item.userId).firstName} · +{item.points}</p><p className="text-sm text-muted-foreground">{item.note}</p></div></motion.div>)}</div>
      </Card>
      <BottomNav active="club" onHome={onHome} onClub={() => undefined} onProfile={onProfile} />
      <CheckInModal open={modalOpen} clubTitle={club.title} submitting={submitting} error={error} onClose={() => { setError(''); setModalOpen(false); }} onSubmit={submitCheckIn} />
      <ShareProgressModal open={shareOpen} streak={streak} points={lastCheckInPoints} rank={userRank} clubTitle={club.title} referralBonusClaimed={referralBonusClaimed} onClose={() => setShareOpen(false)} onShare={shareProgress} />
    </Screen>
  );
}

export const defaultClubId = circleClubs[0].id;
