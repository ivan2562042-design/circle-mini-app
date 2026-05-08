'use client';

import { Award, Flame, Medal } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import { Card } from '@/components/ui/card';
import type { TelegramDebugInfo } from '@/hooks/use-telegram';
import { circleClubs, useCircleStore } from '@/store/circle-store';
import { BottomNav } from './bottom-nav';
import { Header, Screen } from './shared';

export function ProfileScreen({ isDevFallback, initData, debugInfo, onBack, onHome, onClub }: { isDevFallback: boolean; initData: string; debugInfo: TelegramDebugInfo; onBack: () => void; onHome: () => void; onClub: () => void }) {
  const streak = useCircleStore((state) => state.streak);
  const totalPoints = useCircleStore((state) => state.totalPoints);
  const checkIns = useCircleStore((state) => state.checkIns);
  const joinedClubIds = useCircleStore((state) => state.joinedClubIds);
  const telegramUser = useCircleStore((state) => state.telegramUser);
  const referralBonusClaimed = useCircleStore((state) => state.referralBonusClaimed);
  const [avatarFailed, setAvatarFailed] = useState(false);
  const [avatarLoaded, setAvatarLoaded] = useState(false);
  const [debugOpen, setDebugOpen] = useState(false);
  const username = telegramUser?.username || 'telegram_user';
  const fullName = [telegramUser?.first_name, telegramUser?.last_name].filter(Boolean).join(' ') || 'Telegram User';
  const achievements = [streak >= 7, streak >= 30, totalPoints >= 100, checkIns.length >= 1, referralBonusClaimed].filter(Boolean).length;
  const joinedClubs = circleClubs.filter((club) => joinedClubIds.includes(club.id));

  useEffect(() => {
    setAvatarFailed(false);
    setAvatarLoaded(false);
  }, [telegramUser?.photo_url]);

  if (!telegramUser?.id) {
    return (
      <Screen>
        <Header title="Профиль" onBack={onBack} />
        <Card className="text-center">
          <div className="mx-auto h-[104px] w-[104px] animate-pulse rounded-full bg-white/10" />
          <div className="mx-auto mt-5 h-7 w-44 animate-pulse rounded-full bg-white/10" />
          <div className="mx-auto mt-3 h-4 w-28 animate-pulse rounded-full bg-white/10" />
          <div className="mt-5 grid grid-cols-4 gap-2">
            <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
            <div className="h-20 animate-pulse rounded-2xl bg-white/5" />
          </div>
        </Card>
      </Screen>
    );
  }

  return (
    <Screen>
      <Header title="Профиль" onBack={onBack} />
      {isDevFallback && (
        <div className="rounded-2xl border border-amber-300/25 bg-amber-300/10 px-4 py-3 text-sm text-amber-100">
          <span className="font-black">Dev Mode</span> · localhost использует тестовый профиль.
        </div>
      )}
      <Card>
        <button className="flex w-full items-center justify-between text-left text-sm font-black" onClick={() => setDebugOpen((value) => !value)}>
          <span>Telegram Debug</span>
          <span className="text-xs text-muted-foreground">{debugInfo.hasUser ? `user ${debugInfo.userId}` : 'no user'}</span>
        </button>
        {debugOpen && (
          <div className="mt-3 space-y-2 rounded-2xl bg-white/[0.04] p-3 text-xs text-muted-foreground">
            <p>isTelegram: {String(debugInfo.isTelegram)}</p>
            <p>hasWindowTelegram: {String(debugInfo.hasWindowTelegram)}</p>
            <p>hasWebApp: {String(debugInfo.hasWebApp)}</p>
            <p>hasUser: {String(debugInfo.hasUser)}</p>
            <p>userId: {debugInfo.userId ?? 'none'}</p>
            <p>initDataLength: {debugInfo.initDataLength}</p>
            <p>urlHasLaunchParams: {String(debugInfo.urlHasLaunchParams)}</p>
            <p className="break-words">initData: {initData ? `${initData.slice(0, 180)}${initData.length > 180 ? '…' : ''}` : 'empty'}</p>
          </div>
        )}
      </Card>
      <Card className="text-center">
        {telegramUser.photo_url && !avatarFailed ? (
          <div className="relative mx-auto h-[104px] w-[104px]">
            {!avatarLoaded && <div className="absolute inset-0 animate-pulse rounded-full bg-white/10" />}
            <Image src={telegramUser.photo_url} alt="avatar" width={104} height={104} unoptimized onLoad={() => setAvatarLoaded(true)} onError={() => setAvatarFailed(true)} className="h-[104px] w-[104px] rounded-full bg-white/10 object-cover" />
          </div>
        ) : (
          <div className="mx-auto flex h-[104px] w-[104px] items-center justify-center rounded-full bg-gradient-to-br from-emerald-300 via-cyan-300 to-violet-400 text-4xl font-black text-slate-950">
            {fullName.slice(0, 1).toUpperCase()}
          </div>
        )}
        <h2 className="mt-3 text-2xl font-black">{fullName}</h2>
        <p className="text-muted-foreground">@{username}</p>
        <div className="mt-5 grid grid-cols-4 gap-2">
          <Metric icon={<Flame size={18} />} label="Streak" value={streak} />
          <Metric icon={<Medal size={18} />} label="Points" value={totalPoints} />
          <Metric icon={<Award size={18} />} label="Badges" value={achievements} />
          <Metric icon={<Medal size={18} />} label="Check-ins" value={checkIns.length} />
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 font-black">Achievements</h3>
        <div className="grid grid-cols-2 gap-3">
          <Badge title="7 days streak" active={streak >= 7} />
          <Badge title="30 days goal" active={streak >= 30} />
          <Badge title="Top club" active={totalPoints >= 100} />
          <Badge title="Daily discipline" active={checkIns.length >= 1} />
          <Badge title="Referral badge" active={referralBonusClaimed} />
        </div>
      </Card>
      <Card>
        <h3 className="mb-3 font-black">Joined clubs</h3>
        {joinedClubs.length > 0 ? joinedClubs.map((club) => <div key={club.id} className="flex items-center justify-between border-b border-white/5 py-3 last:border-0"><span>{club.title}</span><span className="text-sm text-emerald-300">active</span></div>) : <p className="rounded-2xl bg-white/5 p-4 text-sm text-muted-foreground">Ты пока не вступил ни в один клуб.</p>}
      </Card>
      <BottomNav active="profile" onHome={onHome} onClub={onClub} onProfile={() => undefined} />
    </Screen>
  );
}

function Metric({ icon, label, value }: { icon: ReactNode; label: string; value: ReactNode }) {
  return <div className="rounded-2xl bg-white/5 p-3"><div className="mx-auto mb-2 w-fit text-emerald-300">{icon}</div><p className="text-lg font-black">{value}</p><p className="text-[11px] text-muted-foreground">{label}</p></div>;
}

function Badge({ title, active }: { title: string; active: boolean }) {
  return <div className={`rounded-2xl border p-3 text-sm font-bold ${active ? 'border-emerald-300/30 bg-emerald-300/10 text-emerald-200' : 'border-white/10 bg-white/5 text-muted-foreground'}`}>{title}</div>;
}
