import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hash } from 'bcryptjs';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  // Create admin user
  const hashedPassword = await hash('babyrytmik2024', 10);
  
  const admin = await prisma.user.upsert({
    where: { email: 'admin@eudora.se' },
    update: {},
    create: {
      email: 'admin@eudora.se',
      name: 'Admin',
      emailVerified: new Date(),
    },
  });

  console.log('✅ Admin user created:', admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
