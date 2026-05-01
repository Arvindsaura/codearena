const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.findFirst();
  console.log('Connected via Prisma! First user ID:', user ? user.id : null);
}

main()
  .catch(e => console.error('Prisma connection failed:', e))
  .finally(() => prisma.$disconnect());
