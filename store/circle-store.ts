'use client';

import { create } from 'zustand';
import { createJSONStorage, persist, type StateStorage } from 'zustand/middleware';
import type { TelegramUser } from '@/hooks/use-telegram';
import { activityFeed, clubs, currentUser, leaderboard, users } from '@/lib/mock-data';
import { ActivityItem, CheckInItem, LeaderboardEntry, ReportItem, ReportStatus } from '@/types';

const DAY = 1000 * 60 * 60 * 24;
export const ADMIN_ID = 5780353059;

const noopStorage: StateStorage = {
  getItem: () => null,
  setItem: () => undefined,
  removeItem: () => undefined
};

function getPersistStorage() {
  if (typeof window === 'undefined') return noopStorage;
  return window.localStorage;
}

function dateKey(value = new Date()) {
  return value.toISOString().slice(0, 10);
}

function daysBetween(from: string, to: string) {
  const start = new Date(`${from}T00:00:00`).getTime();
  const end = new Date(`${to}T00:00:00`).getTime();
  return Math.round((end - start) / DAY);
}

function nextStreak(currentStreak: number, lastCheckInDate: string | null) {
  if (!lastCheckInDate) return 1;

  const diff = daysBetween(lastCheckInDate, dateKey());
  if (diff === 0) return currentStreak;
  if (diff === 1) return currentStreak + 1;
  return 1;
}

function currentStreak(streak: number, lastCheckInDate: string | null) {
  if (!lastCheckInDate) return streak;
  return daysBetween(lastCheckInDate, dateKey()) > 1 ? 0 : streak;
}

const liveNotes = [
  'Закрыл цель и держу темп.',
  'Мини-победа дня ✅',
  'Без нулевых дней.',
  'Подтверждение загружено, серия живёт.',
  'Спокойный, но стабильный день.'
];

const liveImages = [
  'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=900&q=80',
  'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80'
];

type CircleState = {
  onboarded: boolean;
  selectedClubId: string;
  streak: number;
  totalPoints: number;
  activities: ActivityItem[];
  leaderboard: LeaderboardEntry[];
  checkIns: CheckInItem[];
  reports: ReportItem[];
  joinedClubIds: string[];
  lastCheckInDate: string | null;
  telegramUser: TelegramUser | null;
  referralBonusClaimed: boolean;
  storageReady: boolean;
  storageKey: string;
  setStorageKey: (storageKey: string) => Promise<void>;
  initializeTelegramUser: (user: TelegramUser | undefined, isDevFallback: boolean) => void;
  submitReport: (clubId: string) => { ok: boolean; message: string };
  moderateReport: (reportId: string, status: Extract<ReportStatus, 'approved' | 'rejected'>) => void;
  claimReferralBonus: () => boolean;
  simulateLiveActivity: () => void;
  start: () => void;
  selectClub: (clubId: string) => void;
  addCheckIn: (clubId: string, image: string, note: string) => Promise<{ ok: boolean; message: string; points: number; streak: number; milestone: boolean }>;
};

export const useCircleStore = create<CircleState>()(
  persist(
    (set, get) => ({
      onboarded: false,
      selectedClubId: clubs[0].id,
      streak: 0,
      totalPoints: 0,
      activities: activityFeed,
      leaderboard,
      checkIns: [],
      reports: [],
      joinedClubIds: [],
      lastCheckInDate: null,
      telegramUser: null,
      referralBonusClaimed: false,
      storageReady: false,
      storageKey: 'circle-store-pending',
      start: () => set({ onboarded: true }),
      selectClub: (clubId) => set({ selectedClubId: clubId, joinedClubIds: Array.from(new Set([...get().joinedClubIds, clubId])) }),
      setStorageKey: async (storageKey) => {
        if (!storageKey) return;
        if (get().storageReady && get().storageKey === storageKey) return;

        useCircleStore.persist.setOptions({ name: storageKey });
        set({
          onboarded: false,
          selectedClubId: clubs[0].id,
          streak: 0,
          totalPoints: 0,
          activities: activityFeed,
          leaderboard,
          checkIns: [],
          reports: [],
          joinedClubIds: [],
          lastCheckInDate: null,
          telegramUser: null,
          referralBonusClaimed: false,
          storageReady: false,
          storageKey
        });
        await useCircleStore.persist.rehydrate();
        set({ storageReady: true, storageKey });
      },
      initializeTelegramUser: (user, isDevFallback) => {
        if (!get().storageReady) return;
        if (!user?.id && !isDevFallback) return;

        const normalizedUser: TelegramUser = !isDevFallback && user?.id ? {
          id: user.id,
          first_name: user.first_name,
          last_name: user.last_name,
          username: user.username,
          photo_url: user.photo_url
        } : {
          id: Number(currentUser.telegramId),
          first_name: currentUser.firstName,
          username: currentUser.username,
          photo_url: currentUser.avatar
        };
        const currentTelegramUser = get().telegramUser;

        if (!currentTelegramUser || currentTelegramUser.id !== normalizedUser.id) {
          set({
            telegramUser: normalizedUser,
            streak: isDevFallback ? currentUser.streak : 0,
            totalPoints: isDevFallback ? currentUser.totalPoints : 0,
            checkIns: [],
            reports: [],
            joinedClubIds: [],
            lastCheckInDate: null,
            referralBonusClaimed: false
          });
          return;
        }

        set((state) => ({
          telegramUser: normalizedUser,
          streak: isDevFallback ? state.streak || currentUser.streak : state.streak,
          totalPoints: isDevFallback ? state.totalPoints || currentUser.totalPoints : state.totalPoints
        }));
      },
      submitReport: (clubId) => {
        const today = dateKey();
        const user = get().telegramUser;
        const userId = String(user?.id ?? currentUser.telegramId);
        const existing = get().reports.find((report) => report.clubId === clubId && report.userId === userId && report.createdAt.slice(0, 10) === today && report.status === 'pending');

        if (existing) return { ok: false, message: 'Отчет уже на проверке ИИ' };

        const fullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || currentUser.firstName;
        const report: ReportItem = {
          id: `report-${Date.now()}`,
          clubId,
          userId,
          userName: fullName,
          image: 'https://api.dicebear.com/9.x/shapes/svg?seed=report-placeholder',
          note: 'Отчет отправлен на проверку.',
          points: 10,
          status: 'pending',
          createdAt: new Date().toISOString()
        };

        // TODO: AI Verification Hook
        set((state) => ({ reports: [report, ...state.reports] }));
        return { ok: true, message: 'Отчет отправлен на проверку ИИ' };
      },
      moderateReport: (reportId, status) => {
        const report = get().reports.find((item) => item.id === reportId);
        if (!report || report.status !== 'pending') return;

        if (status === 'rejected') {
          set((state) => ({
            reports: state.reports.map((item) => item.id === reportId ? { ...item, status, reviewedAt: new Date().toISOString() } : item)
          }));
          return;
        }

        const today = report.createdAt.slice(0, 10);
        const actualStreak = currentStreak(get().streak, get().lastCheckInDate);
        const next = nextStreak(actualStreak, get().lastCheckInDate);
        const checkIn: CheckInItem = { id: `checkin-${report.id}`, clubId: report.clubId, image: report.image, note: report.note, points: report.points, createdAt: report.createdAt };
        const activity: ActivityItem = { id: `activity-${report.id}`, userId: currentUser.id, clubId: report.clubId, image: report.image, note: report.note, points: report.points, createdAt: report.createdAt };

        set((state) => ({
          reports: state.reports.map((item) => item.id === reportId ? { ...item, status, reviewedAt: new Date().toISOString() } : item),
          streak: next,
          totalPoints: state.totalPoints + report.points,
          lastCheckInDate: today,
          checkIns: [checkIn, ...state.checkIns],
          joinedClubIds: Array.from(new Set([...state.joinedClubIds, report.clubId])),
          activities: [activity, ...state.activities].slice(0, 40)
        }));
      },
      claimReferralBonus: () => {
        if (get().referralBonusClaimed) return false;

        set((state) => ({
          referralBonusClaimed: true,
          totalPoints: state.totalPoints + 50
        }));

        return true;
      },
      simulateLiveActivity: () => {
        const mockUsers = users.filter((user) => user.id !== currentUser.id);
        const user = mockUsers[Math.floor(Math.random() * mockUsers.length)];
        const club = clubs[Math.floor(Math.random() * clubs.length)];
        const points = 8 + Math.floor(Math.random() * 8);
        const activity: ActivityItem = {
          id: `live-${Date.now()}`,
          userId: user.id,
          clubId: club.id,
          image: liveImages[Math.floor(Math.random() * liveImages.length)],
          note: liveNotes[Math.floor(Math.random() * liveNotes.length)],
          points,
          createdAt: new Date().toISOString()
        };

        set((state) => ({
          activities: [activity, ...state.activities].slice(0, 40),
          leaderboard: state.leaderboard.map((entry) => (entry.userId === user.id && entry.clubId === club.id ? { ...entry, score: entry.score + points, streak: entry.streak + 1, activity: entry.activity + 1 } : entry))
        }));
      },
      addCheckIn: async (clubId, image, note) => {
        const today = dateKey();
        const alreadyToday = get().checkIns.some((item) => item.clubId === clubId && item.createdAt.slice(0, 10) === today);
        if (alreadyToday) return { ok: false, message: 'Сегодняшний check-in уже засчитан', points: 0, streak: get().streak, milestone: false };

        const duplicateImage = get().checkIns.some((item) => item.image === image);
        if (duplicateImage) return { ok: false, message: 'Это изображение уже использовалось', points: 0, streak: get().streak, milestone: false };

        const actualStreak = currentStreak(get().streak, get().lastCheckInDate);
        const next = nextStreak(actualStreak, get().lastCheckInDate);
        const milestone = next > 0 && next % 7 === 0;
        const points = 10 + (milestone ? 50 : 0);
        const createdAt = new Date().toISOString();
        const checkIn: CheckInItem = { id: `checkin-${Date.now()}`, clubId, image, note, points, createdAt };
        const activity: ActivityItem = { id: `local-${Date.now()}`, userId: currentUser.id, clubId, image, note, points, createdAt };

        set((state) => ({
          streak: next,
          totalPoints: state.totalPoints + points,
          lastCheckInDate: today,
          checkIns: [checkIn, ...state.checkIns],
          joinedClubIds: Array.from(new Set([...state.joinedClubIds, clubId])),
          activities: [activity, ...state.activities].slice(0, 40),
          leaderboard: state.leaderboard.map((entry) => (entry.userId === currentUser.id && entry.clubId === clubId ? { ...entry, score: entry.score + points, streak: next, activity: entry.activity + 1 } : entry))
        }));

        return { ok: true, message: milestone ? `${next} дней подряд! Weekly bonus открыт` : 'Check-in принят. Streak обновлён', points, streak: next, milestone };
      }
    }),
    {
      name: 'circle-retention-v1',
      storage: createJSONStorage(getPersistStorage),
      partialize: (state) => ({
        onboarded: state.onboarded,
        selectedClubId: state.selectedClubId,
        streak: state.streak,
        totalPoints: state.totalPoints,
        activities: state.activities,
        leaderboard: state.leaderboard,
        checkIns: state.checkIns,
        reports: state.reports,
        joinedClubIds: state.joinedClubIds,
        lastCheckInDate: state.lastCheckInDate,
        telegramUser: state.telegramUser,
        referralBonusClaimed: state.referralBonusClaimed
      }),
      skipHydration: true
    }
  )
);

export const circleUsers = users;
export const circleClubs = clubs;
