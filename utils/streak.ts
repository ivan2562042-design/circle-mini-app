export function isSameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export function isYesterday(date: Date, now = new Date()) {
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  return isSameDay(date, yesterday);
}

export function nextStreak(lastCheckIn: Date | null, currentStreak: number) {
  if (!lastCheckIn) return 1;
  if (isSameDay(lastCheckIn, new Date())) return currentStreak;
  if (isYesterday(lastCheckIn)) return currentStreak + 1;
  return 1;
}

export function pointsForCheckIn(streak: number) {
  return 10 + (streak > 0 && streak % 7 === 0 ? 50 : 0);
}
