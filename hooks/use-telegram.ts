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

export type TelegramDebugInfo = {
  isTelegram: boolean;
  hasWindowTelegram: boolean;
  hasWebApp: boolean;
  hasUser: boolean;
  userId?: number;
  initDataLength: number;
  urlHasLaunchParams: boolean;
  userAgent: string;
};

function hasTelegramLaunchParams() {
  const source = `${window.location.search}&${window.location.hash.replace(/^#/, '')}`;
  return source.includes('tgWebAppData') || source.includes('tgWebAppVersion') || source.includes('tgWebAppPlatform');
}

function getTelegramDebug(app: TelegramWebApp | null, isTelegram: boolean): TelegramDebugInfo {
  return {
    isTelegram,
    hasWindowTelegram: Boolean(window.Telegram),
    hasWebApp: Boolean(app),
    hasUser: Boolean(app?.initDataUnsafe?.user?.id),
    userId: app?.initDataUnsafe?.user?.id,
    initDataLength: app?.initData?.length ?? 0,
    urlHasLaunchParams: hasTelegramLaunchParams(),
    userAgent: navigator.userAgent
  };
}

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
    const userAgentLooksTelegram = /Telegram/i.test(navigator.userAgent);
    const urlLooksTelegram = hasTelegramLaunchParams();
    if (userAgentLooksTelegram || urlLooksTelegram) {
      setIsTelegram(true);
      console.log('[Circle Telegram] Telegram environment hinted before SDK', { userAgentLooksTelegram, urlLooksTelegram, href: window.location.href });
    }

    const load = () => {
      const app = window.Telegram?.WebApp ?? null;
      if (!app) {
        console.log('[Circle Telegram] WebApp not available yet', { hasWindowTelegram: Boolean(window.Telegram), userAgent: navigator.userAgent, href: window.location.href });
        return false;
      }

      setIsTelegram(true);
      app.ready?.();
      app.expand?.();
      document.documentElement.classList.add('dark');
      setWebApp(app);
      setIsLoading(false);
      console.log('[Circle Telegram] WebApp detected', getTelegramDebug(app, true));
      return true;
    };

    if (load()) return;

    const interval = window.setInterval(() => {
      if (load()) window.clearInterval(interval);
    }, 150);
    const timer = window.setTimeout(() => {
      window.clearInterval(interval);
      load();
      setIsLoading(false);
      console.log('[Circle Telegram] SDK detection timeout', getTelegramDebug(window.Telegram?.WebApp ?? null, userAgentLooksTelegram || urlLooksTelegram));
    }, 6000);

    return () => {
      window.clearInterval(interval);
      window.clearTimeout(timer);
    };
  }, []);

  const debug = useMemo(() => getTelegramDebug(webApp, isTelegram), [webApp, isTelegram]);

  return useMemo(() => ({ webApp, user: webApp?.initDataUnsafe?.user, initData: webApp?.initData ?? '', theme: webApp?.themeParams ?? {}, isLoading, isTelegram, debug }), [webApp, isLoading, isTelegram, debug]);
}
