type TelegramHapticStyle = 'light' | 'medium' | 'heavy' | 'rigid' | 'soft';
type TelegramNotificationType = 'error' | 'success' | 'warning';

type TelegramWebApp = {
  HapticFeedback?: {
    impactOccurred?: (style: TelegramHapticStyle) => void;
    notificationOccurred?: (type: TelegramNotificationType) => void;
    selectionChanged?: () => void;
  };
};

export function triggerHaptic(type: TelegramNotificationType | TelegramHapticStyle = 'success') {
  if (typeof window === 'undefined') return;

  const telegram = window.Telegram as { WebApp?: TelegramWebApp } | undefined;
  const feedback = telegram?.WebApp?.HapticFeedback;
  if (!feedback) return;

  if (type === 'success' || type === 'warning' || type === 'error') {
    feedback.notificationOccurred?.(type);
    return;
  }

  feedback.impactOccurred?.(type);
}
