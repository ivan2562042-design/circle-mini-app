import { ActivityItem, ClubView, LeaderboardEntry, MockUser } from '@/types';

export const currentUser: MockUser = {
  id: 'u-you',
  telegramId: '100001',
  username: 'dev_circle',
  firstName: 'Dev User',
  avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=dev-circle',
  streak: 6,
  totalPoints: 420,
  trustScore: 96
};

export const users: MockUser[] = [
  currentUser,
  { id: 'u-1', telegramId: '100002', username: 'mira', firstName: 'Мира', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=mira', streak: 18, totalPoints: 1560, trustScore: 99 },
  { id: 'u-2', telegramId: '100003', username: 'dan_run', firstName: 'Данил', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=dan', streak: 12, totalPoints: 1180, trustScore: 94 },
  { id: 'u-3', telegramId: '100004', username: 'vera_fit', firstName: 'Вера', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=vera', streak: 9, totalPoints: 910, trustScore: 91 },
  { id: 'u-4', telegramId: '100005', username: 'igor_steps', firstName: 'Игорь', avatar: 'https://api.dicebear.com/9.x/notionists/svg?seed=igor', streak: 23, totalPoints: 2020, trustScore: 98 }
];

export const clubs: ClubView[] = [
  {
    id: 'steps-10000',
    title: '10 000 шагов',
    description: 'Ежедневно проходить минимум 10 000 шагов и загружать подтверждение.',
    category: 'steps',
    image: 'https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?auto=format&fit=crop&w=1200&q=80',
    memberLimit: 80,
    proof: ['скриншот из шагомера'],
    challenges: [{ title: '7 дней движения', description: 'Закрой цель шагов 7 дней подряд.', pointsReward: 50 }]
  },
  {
    id: 'workouts',
    title: 'Тренировки',
    description: 'Регулярные тренировки и check-in из зала.',
    category: 'workout',
    image: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?auto=format&fit=crop&w=1200&q=80',
    memberLimit: 60,
    proof: ['фото из зала', 'фото тренировки'],
    challenges: [{ title: 'Сильная неделя', description: 'Сделай 4 тренировки за неделю.', pointsReward: 50 }]
  },
  {
    id: 'running',
    title: 'Бег',
    description: 'Регулярные пробежки и загрузка статистики.',
    category: 'running',
    image: 'https://images.unsplash.com/photo-1502904550040-7534597429ae?auto=format&fit=crop&w=1200&q=80',
    memberLimit: 70,
    proof: ['скрин Strava', 'карта пробежки', 'статистика дистанции'],
    challenges: [{ title: 'Недельный темп', description: 'Собери 15 км за 7 дней.', pointsReward: 50 }]
  }
];

export const leaderboard: LeaderboardEntry[] = clubs.flatMap((club) =>
  users
    .map((user, index) => ({ userId: user.id, clubId: club.id, score: user.totalPoints - index * 70 + club.id.length * 3, rank: index + 1, streak: Math.max(1, user.streak - index), activity: 18 - index * 2 }))
    .sort((a, b) => b.score - a.score)
    .map((entry, index) => ({ ...entry, rank: index + 1 }))
);

export const activityFeed: ActivityItem[] = [
  { id: 'a-1', userId: 'u-1', clubId: 'steps-10000', image: 'https://images.unsplash.com/photo-1486218119243-13883505764c?auto=format&fit=crop&w=900&q=80', note: '12 430 шагов. День закрыт спокойно.', points: 10, createdAt: new Date(Date.now() - 1000 * 60 * 21).toISOString() },
  { id: 'a-2', userId: 'u-2', clubId: 'running', image: 'https://images.unsplash.com/photo-1552674605-db6ffd4facb5?auto=format&fit=crop&w=900&q=80', note: '5.4 км в лёгком темпе.', points: 10, createdAt: new Date(Date.now() - 1000 * 60 * 48).toISOString() },
  { id: 'a-3', userId: 'u-3', clubId: 'workouts', image: 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=900&q=80', note: 'Силовая + растяжка. Streak продолжается.', points: 10, createdAt: new Date(Date.now() - 1000 * 60 * 73).toISOString() },
  { id: 'a-4', userId: 'u-4', clubId: 'steps-10000', image: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=900&q=80', note: 'Прогулка после работы, 14 008 шагов.', points: 10, createdAt: new Date(Date.now() - 1000 * 60 * 130).toISOString() }
];
