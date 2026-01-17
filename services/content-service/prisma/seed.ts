import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const mindfulness = await prisma.bookCategory.upsert({
    where: { name: 'Mindfulness' },
    update: {},
    create: {
      name: 'Mindfulness',
      description: 'Mindfulness and meditation practices',
    },
  });

  await prisma.book.createMany({
    data: [
      {
        title: 'The Miracle of Mindfulness',
        author: 'Thich Nhat Hanh',
        description: 'A gentle introduction to mindfulness practice.',
        categoryId: mindfulness.id,
        isbn: '9780807012390',
      },
      {
        title: 'Wherever You Go, There You Are',
        author: 'Jon Kabat-Zinn',
        description: 'Guidance on integrating mindfulness into daily life.',
        categoryId: mindfulness.id,
        isbn: '9781401307783',
      },
    ],
    skipDuplicates: true,
  });
}

main()
  .catch((error) => {
    console.error('Seed error:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
