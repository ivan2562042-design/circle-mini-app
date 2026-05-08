'use client';

import { AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { ClubScreen, defaultClubId } from '@/components/circle/club-screen';
import { HomeScreen } from '@/components/circle/home-screen';
import { OnboardingScreen } from '@/components/circle/onboarding-screen';
import { ProfileScreen } from '@/components/circle/profile-screen';
import { useTelegram } from '@/hooks/use-telegram';
import { circleClubs, useCircleStore } from '@/store/circle-store';

type Screen = 'onboarding' | 'home' | 'club' | 'profile';

export function CircleApp() {
  const onboarded = useCircleStore((state) => state.onboarded);
  const start = useCircleStore((state) => state.start);
  const selectedClubId = useCircleStore((state) => state.selectedClubId);
  const selectClub = useCircleStore((state) => state.selectClub);
  const simulateLiveActivity = useCircleStore((state) => state.simulateLiveActivity);
  const initializeTelegramUser = useCircleStore((state) => state.initializeTelegramUser);
  const { user } = useTelegram();
  const [screen, setScreen] = useState<Screen>('onboarding');

  useEffect(() => {
    if (onboarded && screen === 'onboarding') setScreen('home');
  }, [onboarded, screen]);

  useEffect(() => {
    const timer = window.setInterval(simulateLiveActivity, 9000);
    return () => window.clearInterval(timer);
  }, [simulateLiveActivity]);

  useEffect(() => {
    initializeTelegramUser(user);
  }, [initializeTelegramUser, user]);

  const openClub = (clubId: string) => {
    selectClub(clubId);
    setScreen('club');
  };

  const openDefaultClub = () => openClub(selectedClubId || defaultClubId || circleClubs[0].id);

  return (
    <main className="telegram-shell min-h-screen px-4 py-5">
      <div className="mx-auto flex min-h-[calc(100vh-40px)] w-full max-w-md flex-col">
        <AnimatePresence mode="wait">
          {screen === 'onboarding' && <OnboardingScreen key="onboarding" onStart={start} />}
          {screen === 'home' && <HomeScreen key="home" onOpenClub={openClub} onProfile={() => setScreen('profile')} />}
          {screen === 'club' && <ClubScreen key="club" clubId={selectedClubId} onBack={() => setScreen('home')} onHome={() => setScreen('home')} onProfile={() => setScreen('profile')} />}
          {screen === 'profile' && <ProfileScreen key="profile" onBack={() => setScreen('home')} onHome={() => setScreen('home')} onClub={openDefaultClub} />}
        </AnimatePresence>
      </div>
    </main>
  );
}

