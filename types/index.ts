export type ClubCategory = 'steps' | 'workout' | 'running';

export type MockUser = {
  id: string;
  telegramId: string;
  username: string;
  firstName: string;
  avatar: string;
  streak: number;
  totalPoints: number;
  trustScore: number;
};

export type ActivityItem = {
  id: string;
  userId: string;
  clubId: string;
  image: string;
  note: string;
  points: number;
  createdAt: string;
};

export type CheckInItem = {
  id: string;
  clubId: string;
  image: string;
  note: string;
  points: number;
  createdAt: string;
};

export type ClubView = {
  id: string;
  title: string;
  description: string;
  category: ClubCategory;
  image: string;
  memberLimit: number;
  proof: string[];
  challenges: { title: string; description: string; pointsReward: number }[];
};

export type LeaderboardEntry = {
  userId: string;
  clubId: string;
  score: number;
  rank: number;
  streak: number;
  activity: number;
};
