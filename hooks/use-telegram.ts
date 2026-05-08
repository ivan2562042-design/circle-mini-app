'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

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
  initData: string;
  userAgent: string;
};

function hasTelegramLaunchParams() {
  if (typeof window === 'undefined') return false;
  const source = `${window.location.search}&${window.location.hash.replace(/^#/, '')}`;
  return source.includes('tgWebAppData') || source.includes('tgWebAppVersion') || source.includes('tgWebAppPlatform');
}

function getTelegramDebug(app: TelegramWebApp | null, isTelegram: boolean): TelegramDebugInfo {
  const hasBrowser = typeof window !== 'undefined';
  const hasNavigator = typeof navigator !== 'undefined';

  return {
    isTelegram,
    hasWindowTelegram: Boolean(hasBrowser && window.Telegram),
    hasWebApp: Boolean(app),
    hasUser: Boolean(app?.initDataUnsafe?.user?.id),
    userId: app?.initDataUnsafe?.user?.id,
    initDataLength: app?.initData?.length ?? 0,
    urlHasLaunchParams: hasTelegramLaunchParams(),
    initData: app?.initData ?? '',
    userAgent: hasNavigator ? navigator.userAgent : ''
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
  const forceReload = useCallback(() => {
    if (typeof window === 'undefined') return;

    const app = window.Telegram?.WebApp ?? null;
    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    console.log('[Circle Telegram] Force reload SDK requested', getTelegramDebug(app, Boolean(app) || hasTelegramLaunchParams() || /Telegram/i.test(userAgent)));

    if (!app) {
      setWebApp(null);
      setIsTelegram(hasTelegramLaunchParams() || /Telegram/i.test(userAgent));
      return;
    }

    app.ready?.();
    app.expand?.();
    setIsTelegram(true);
    setWebApp({ ...app });
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
    const userAgentLooksTelegram = /Telegram/i.test(userAgent);
    const urlLooksTelegram = hasTelegramLaunchParams();
    if (userAgentLooksTelegram || urlLooksTelegram) {
      setIsTelegram(true);
      console.log('[Circle Telegram] Telegram environment hinted before SDK', { userAgentLooksTelegram, urlLooksTelegram, href: window.location.href });
    }

    const load = () => {
      const app = window.Telegram?.WebApp ?? null;
      if (!app) {
        console.log('[Circle Telegram] WebApp not available yet', { hasWindowTelegram: Boolean(window.Telegram), userAgent, href: window.location.href });
        return false;
      }

      app.ready?.();
      app.expand?.();
      setIsTelegram(true);
      document.documentElement.classList.add('dark');
      setWebApp({ ...app });
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

  return useMemo(() => ({ webApp, user: webApp?.initDataUnsafe?.user, initData: webApp?.initData ?? '', theme: webApp?.themeParams ?? {}, isLoading, isTelegram, debug, forceReload }), [webApp, isLoading, isTelegram, debug, forceReload]);
}
