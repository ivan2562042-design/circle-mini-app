'use client';

import { useEffect, useMemo, useState } from 'react';

export type TelegramUser = {
  id?: number;
  username?: string;
  first_name?: string;
  last_name?: string;
  photo_url?: string;
};

type TelegramWebApp = {
  initData?: string;
  colorScheme?: 'light' | 'dark';
  themeParams?: Record<string, string>;
  ready?: () => void;
  expand?: () => void;
  openTelegramLink?: (url: string) => void;
  BackButton?: { show: () => void; hide: () => void; onClick: (callback: () => void) => void; offClick: (callback: () => void) => void };
  initDataUnsafe?: { user?: TelegramUser };
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TelegramWebApp };
  }
}

export function useTelegram() {
  const [webApp, setWebApp] = useState<TelegramWebApp | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isTelegram, setIsTelegram] = useState(false);

  useEffect(() => {
    const load = () => {
      const app = window.Telegram?.WebApp ?? null;
      if (!app) return false;

      setIsTelegram(true);
      app.ready?.();
      app.expand?.();
      document.documentElement.classList.add('dark');
      setWebApp(app);
      setIsLoading(false);
      return true;
    };

    if (load()) return;

    const interval = window.setInterval(() => {
      if (load()) window.clearInterval(interval);
    }, 100);
    const timer = window.setTimeout(() => {
      window.clearInterval(interval);
      load();
      setIsLoading(false);
    }, 1200);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, []);

  return useMemo(() => ({ webApp, user: webApp?.initDataUnsafe?.user, initData: webApp?.initData ?? '', theme: webApp?.themeParams ?? {}, isLoading, isTelegram }), [webApp, isLoading, isTelegram]);
}
