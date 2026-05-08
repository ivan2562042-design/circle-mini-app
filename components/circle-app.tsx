'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ClubScreen, defaultClubId } from '@/components/circle/club-screen';
import { HomeScreen } from '@/components/circle/home-screen';
import { OnboardingScreen } from '@/components/circle/onboarding-screen';
import { ProfileScreen } from '@/components/circle/profile-screen';
import { useTelegram } from '@/hooks/use-telegram';
import { currentUser } from '@/lib/mock-data';
import { circleClubs, useCircleStore } from '@/store/circle-store';

type Screen = 'onboarding' | 'home' | 'club' | 'profile';

export function CircleApp() {
  const onboarded = useCircleStore((state) => state.onboarded);
  const start = useCircleStore((state) => state.start);
  const selectedClubId = useCircleStore((state) => state.selectedClubId);
  const selectClub = useCircleStore((state) => state.selectClub);
  const simulateLiveActivity = useCircleStore((state) => state.simulateLiveActivity);
  const initializeTelegramUser = useCircleStore((state) => state.initializeTelegramUser);
  const setStorageKey = useCircleStore((state) => state.setStorageKey);
  const storageReady = useCircleStore((state) => state.storageReady);
  const { user, initData, isLoading, isTelegram, debug } = useTelegram();
  const [screen, setScreen] = useState<Screen>('onboarding');
  const isDevFallback = !isTelegram;

  useEffect(() => {
    if (!storageReady) return;
    if (!onboarded) setScreen('onboarding');
    if (onboarded && screen === 'onboarding') setScreen('home');
  }, [onboarded, screen, storageReady]);

  useEffect(() => {
    if (!storageReady) return;
    const timer = window.setInterval(simulateLiveActivity, 9000);
    return () => window.clearInterval(timer);
  }, [simulateLiveActivity, storageReady]);

  useEffect(() => {
    if (isLoading) return;

    if (isTelegram && !user?.id) return;

    const storageKey = user?.id ? `circle-store-${user.id}` : `circle-store-local-${currentUser.telegramId}`;
    void setStorageKey(storageKey);
  }, [isLoading, isTelegram, setStorageKey, user?.id]);

  useEffect(() => {
    if (!storageReady) return;
    initializeTelegramUser(user, isDevFallback);
  }, [initializeTelegramUser, isDevFallback, storageReady, user]);

  const openClub = (clubId: string) => {
    selectClub(clubId);
    setScreen('club');
  };

  const openDefaultClub = () => openClub(selectedClubId || defaultClubId || circleClubs[0].id);

  if (isLoading || (isTelegram && !user?.id) || !storageReady) {
    return (
      <main className="telegram-shell min-h-screen px-4 py-5">
        <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-md flex-col justify-center">
          <div className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-5">
            <div className="mx-auto h-24 w-24 animate-pulse rounded-full bg-white/10" />
            <div className="mx-auto mt-5 h-7 w-40 animate-pulse rounded-full bg-white/10" />
            <div className="mx-auto mt-3 h-4 w-28 animate-pulse rounded-full bg-white/10" />
            <div className="mt-5 rounded-2xl bg-white/[0.04] p-3 text-xs text-muted-foreground">
              <p>Telegram Debug</p>
              <p>isTelegram: {String(debug.isTelegram)}</p>
              <p>hasWebApp: {String(debug.hasWebApp)}</p>
              <p>hasUser: {String(debug.hasUser)}</p>
              <p>initDataLength: {debug.initDataLength}</p>
            </div>
            <div className="mt-8 grid grid-cols-3 gap-3">
              <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
              <div className="h-20 animate-pulse rounded-2xl bg-white/10" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="telegram-shell min-h-screen px-4 py-5">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-md flex-col">
        <AnimatePresence mode="wait">
          {screen === 'onboarding' && <OnboardingScreen key="onboarding" onStart={start} />}
          {screen === 'home' && <HomeScreen key="home" onOpenClub={openClub} onProfile={() => setScreen('profile')} />}
          {screen === 'club' && <ClubScreen key="club" clubId={selectedClubId} onBack={() => setScreen('home')} onHome={() => setScreen('home')} onProfile={() => setScreen('profile')} />}
          {screen === 'profile' && <ProfileScreen key="profile" isDevFallback={isDevFallback} initData={initData} debugInfo={debug} onBack={() => setScreen('home')} onHome={() => setScreen('home')} onClub={openDefaultClub} />}
        </AnimatePresence>
      </div>
    </main>
  );
}

