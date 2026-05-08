import { PrismaClient } from '@prisma/client';
import { activityFeed, clubs, leaderboard, users } from '../lib/mock-data';

const prisma = new PrismaClient();

async function main() {
  await prisma.leaderboard.deleteMany();
  await prisma.checkIn.deleteMany();
  await prisma.challenge.deleteMany();
  await prisma.clubMember.deleteMany();
  await prisma.club.deleteMany();
  await prisma.user.deleteMany();

  for (const user of users) {
    await prisma.user.create({ data: user });
  }

  for (const club of clubs) {
    await prisma.club.create({
      data: {
        id: club.id,
        title: club.title,
        description: club.description,
        category: club.category,
        image: club.image,
        memberLimit: club.memberLimit,
        challenges: { create: club.challenges }
      }
    });
  }

  for (const club of clubs) {
    for (const user of users) {
      await prisma.clubMember.create({
        data: {
          userId: user.id,
          clubId: club.id,
          currentStreak: Math.max(1, user.streak - 2),
          points: Math.max(100, user.totalPoints - 120)
        }
      });
    }
  }

  for (const activity of activityFeed) {
    await prisma.checkIn.create({ data: { ...activity, imageHash: activity.image } });
  }

  for (const entry of leaderboard) {
    await prisma.leaderboard.create({
      data: {
        userId: entry.userId,
        clubId: entry.clubId,
        score: entry.score,
        rank: entry.rank
      }
    });
  }
}

main()
  .then(async () => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
