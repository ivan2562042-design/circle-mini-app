'use client';

import { motion } from 'framer-motion';
import { Camera, Flame, Sparkles } from 'lucide-react';
import Image from 'next/image';
import { useMemo, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { triggerHaptic } from '@/lib/telegram-haptics';
import { currentUser } from '@/lib/mock-data';
import { getUserById, useClubData } from '@/services/circle-service';
import { circleClubs, useCircleStore } from '@/store/circle-store';
import { BottomNav } from './bottom-nav';
import { Header, Screen } from './shared';
import { ShareProgressModal } from './share-progress-modal';

export function ClubScreen({ clubId, onBack, onHome, onProfile }: { clubId: string; onBack: () => void; onHome: () => void; onProfile: () => void }) {
  const { club, activities, leaderboard } = useClubData(clubId);
  const streak = useCircleStore((state) => state.streak);
  const reports = useCircleStore((state) => state.reports);
  const submitReport = useCircleStore((state) => state.submitReport);
  const referralBonusClaimed = useCircleStore((state) => state.referralBonusClaimed);
  const claimReferralBonus = useCircleStore((state) => state.claimReferralBonus);
  const [shareOpen, setShareOpen] = useState(false);
  const [lastCheckInPoints, setLastCheckInPoints] = useState(0);
  const [toast, setToast] = useState('');
  const pendingReport = useMemo(() => reports.find((report) => report.clubId === clubId && report.status === 'pending'), [reports, clubId]);
  const userRank = leaderboard.find((entry) => entry.userId === currentUser.id)?.rank ?? 1;

  const shareProgress = () => {
    const message = `🔥 Я держу серию уже ${streak} дней в Circle\n\n🚶 Сегодня:\n${club.title}\n\n🏆 Место в клубе: #${userRank}\n\nПрисоединяйся:\n@circle_habits_bot`;
    const shareUrl = `https://t.me/share/url?url=${encodeURIComponent('https://t.me/circle_habits_bot')}&text=${encodeURIComponent(message)}`;
    const webApp = typeof window !== 'undefined' ? window.Telegram?.WebApp as { openTelegramLink?: (url: string) => void } | undefined : undefined;
    if (webApp?.openTelegramLink) {
      webApp.openTelegramLink(shareUrl);
    } else if (typeof window !== 'undefined') {
      window.open(shareUrl, '_blank', 'noopener,noreferrer');
    }
    const claimed = claimReferralBonus();

    if (claimed) {
      setToast('Реферальный значок получен · +50 баллов');
      triggerHaptic('success');
      window.setTimeout(() => setToast(''), 3400);
    }
  };

  const submitMockReport = () => {
    const result = submitReport(clubId);
    setToast(result.message);
    triggerHaptic(result.ok ? 'success' : 'warning');
    window.setTimeout(() => setToast(''), 3400);
  };

  return (
    <Screen>
      <Header title={club.title} onBack={onBack} />
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
            <div><p className="text-sm text-white/70">Прогресс клуба</p><h1 className="text-3xl font-black">{club.title}</h1></div>
            <div className="rounded-2xl bg-emerald-300 px-3 py-2 text-sm font-black text-slate-950">{streak} 🔥</div>
          </div>
        </div>
        <div className="space-y-4 p-4">
          <p className="text-sm text-muted-foreground">{club.description}</p>
          <Progress value={Math.min(100, streak * 7)} />
          {pendingReport && <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm font-bold text-amber-100">Отчет на проверке ИИ</div>}
          <Button onClick={submitMockReport} disabled={Boolean(pendingReport)} className="w-full">
            <Camera className="mr-2" size={18} />
            {pendingReport ? 'Отчет отправлен' : 'Сдать отчет'}
          </Button>
        </div>
      </Card>
      <Card>
        <div className="mb-3 flex items-center justify-between"><h3 className="font-black">Рейтинг</h3><Flame className="text-emerald-300" size={18} /></div>
        <div className="space-y-3">{leaderboard.slice(0, 5).map((entry) => <motion.div layout key={entry.userId} className="flex items-center justify-between rounded-2xl bg-white/[0.03] p-2"><div className="flex items-center gap-3"><span className="w-7 font-black text-emerald-300">#{entry.rank}</span><Image src={getUserById(entry.userId).avatar} alt="avatar" width={36} height={36} className="rounded-full" /><div><p className="font-bold">{getUserById(entry.userId).firstName}</p><p className="text-xs text-muted-foreground">{entry.streak} дней подряд</p></div></div><p className="font-black">{entry.score}</p></motion.div>)}</div>
      </Card>
      <Card>
        <h3 className="mb-3 font-black">Лента активности</h3>
        <div className="space-y-3">{activities.map((item) => <motion.div layout key={item.id} className="flex gap-3"><Image src={item.image} alt="activity" width={56} height={56} unoptimized className="h-14 w-14 rounded-2xl object-cover" /><div><p className="text-sm font-bold">{getUserById(item.userId).firstName} · +{item.points}</p><p className="text-sm text-muted-foreground">{item.note}</p></div></motion.div>)}</div>
      </Card>
      <BottomNav active="club" onHome={onHome} onClub={() => undefined} onProfile={onProfile} />
      <ShareProgressModal open={shareOpen} streak={streak} points={lastCheckInPoints} rank={userRank} clubTitle={club.title} referralBonusClaimed={referralBonusClaimed} onClose={() => setShareOpen(false)} onShare={shareProgress} />
    </Screen>
  );
}

export const defaultClubId = circleClubs[0].id;
