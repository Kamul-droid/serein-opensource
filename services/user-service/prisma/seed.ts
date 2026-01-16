import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding user service database...');

  // Create a test user profile
  const profile = await prisma.userProfile.upsert({
    where: { userId: 'test-user-id' },
    update: {},
    create: {
      userId: 'test-user-id',
      name: 'Test User',
      bio: 'This is a test user profile',
      beliefs: {
        create: [
          { belief: 'Buddhism' },
          { belief: 'Mindfulness' },
        ],
      },
      interests: {
        create: [
          { interest: 'Meditation' },
          { interest: 'Yoga' },
        ],
      },
    },
  });

  // Create user preferences
  await prisma.userPreference.upsert({
    where: { userId: 'test-user-id' },
    update: {},
    create: {
      userId: 'test-user-id',
      voiceGender: 'female',
      communicationMode: 'both',
    },
  });

  console.log('Created test user profile:', profile.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
