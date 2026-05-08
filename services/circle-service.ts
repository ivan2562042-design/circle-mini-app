import { circleClubs, circleUsers, useCircleStore } from '@/store/circle-store';

export function getClubById(clubId: string) {
  return circleClubs.find((club) => club.id === clubId) ?? circleClubs[0];
}

export function getUserById(userId: string) {
  return circleUsers.find((user) => user.id === userId) ?? circleUsers[0];
}

export function useClubData(clubId: string) {
  const activities = useCircleStore((state) => state.activities).filter((item) => item.clubId === clubId);
  const leaderboard = useCircleStore((state) => state.leaderboard).filter((item) => item.clubId === clubId).sort((a, b) => b.score - a.score).map((item, index) => ({ ...item, rank: index + 1 }));
  return { club: getClubById(clubId), activities, leaderboard };
}
