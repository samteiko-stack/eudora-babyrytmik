import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import * as dotenv from 'dotenv';
import { readFileSync } from 'fs';
import { join } from 'path';

// Load environment variables
dotenv.config({ path: join(process.cwd(), '.env') });

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  try {
    // Read the import data
    const importData = JSON.parse(
      readFileSync(join(process.cwd(), 'scripts', 'import-data.json'), 'utf-8')
    );

    console.log(`Found ${importData.length} registrations to import`);

    // Clear existing registrations
    console.log('Clearing existing registrations...');
    await prisma.registration.deleteMany({});

    // Import registrations
    console.log('Importing registrations...');
    let count = 0;
    for (const reg of importData) {
      await prisma.registration.create({
        data: {
          id: reg.id,
          firstName: reg.firstName,
          lastName: reg.lastName,
          email: reg.email,
          phone: reg.phone,
          location: reg.location.toUpperCase() as 'SODERMALM' | 'GARDET',
          weekStart: new Date(reg.weekStart),
          createdAt: new Date(reg.createdAt),
          status: reg.status.toUpperCase() as 'CONFIRMED' | 'WAITLIST' | 'CANCELLED',
        },
      });
      count++;
      if (count % 10 === 0) {
        console.log(`Imported ${count}/${importData.length}...`);
      }
    }

    console.log(`✅ Successfully imported ${count} registrations!`);

    // Show summary by year
    const registrations2025 = await prisma.registration.count({
      where: {
        weekStart: {
          gte: new Date('2025-01-01'),
          lt: new Date('2026-01-01'),
        },
      },
    });

    const registrations2026 = await prisma.registration.count({
      where: {
        weekStart: {
          gte: new Date('2026-01-01'),
          lt: new Date('2027-01-01'),
        },
      },
    });

    console.log(`\n📊 Summary:`);
    console.log(`  2025: ${registrations2025} registrations`);
    console.log(`  2026: ${registrations2026} registrations`);
    console.log(`  Total: ${registrations2025 + registrations2026} registrations`);

  } catch (error) {
    console.error('❌ Import failed:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

main();
