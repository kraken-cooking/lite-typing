import { PrismaClient, Prisma } from "./.generated/prisma";

const prisma = new PrismaClient();

const typingData: Prisma.TypingTestCreateInput[] = [
  {
    text: "The quick brown fox jumps over the lazy dog. This is a sample text for typing practice. Practice makes perfect, and consistent typing helps improve your speed and accuracy.",
    createdAt: "2024-04-15T12:00:00Z",
    timesUsed: 0,
  },
];

export async function main() {
  for (const u of typingData) {
    await prisma.typingTest.create({ data: u });
  }
}

main();
