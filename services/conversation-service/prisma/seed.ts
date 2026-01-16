import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding conversation service database...');

  const conversation = await prisma.conversation.create({
    data: {
      userId: 'test-user-id',
      title: 'Welcome conversation',
      messages: {
        create: [
          {
            role: 'user',
            content: 'Hello, I want to start a conversation.',
          },
          {
            role: 'assistant',
            content: 'Hi! I am here to help you.',
          },
        ],
      },
    },
  });

  console.log('Created conversation:', conversation.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
