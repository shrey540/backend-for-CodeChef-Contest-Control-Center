import { PrismaClient, UserRole } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

const BCRYPT_ROUNDS = 12;

const DEFAULT_PASSWORD = 'Password123!';

interface SeedUser {
  name: string;
  email: string;
  role: UserRole;
}

const SEED_USERS: SeedUser[] = [
  {
    name: 'System Admin',
    email: 'admin@codechef.local',
    role: UserRole.ADMIN,
  },
  {
    name: 'Contest Organizer',
    email: 'organizer@codechef.local',
    role: UserRole.ORGANIZER,
  },
  {
    name: 'Sample Participant',
    email: 'participant@codechef.local',
    role: UserRole.PARTICIPANT,
  },
];

async function seedUser(user: SeedUser, passwordHash: string): Promise<void> {
  await prisma.user.upsert({
    where: { email: user.email },
    update: {
      name: user.name,
      role: user.role,
    },
    create: {
      name: user.name,
      email: user.email,
      passwordHash,
      role: user.role,
    },
  });
}

async function main(): Promise<void> {
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, BCRYPT_ROUNDS);

  for (const user of SEED_USERS) {
    await seedUser(user, passwordHash);
    console.log(`Seeded user: ${user.email} (${user.role})`);
  }

  console.log('');
  console.log('Seed complete. Default password for all seeded users:');
  console.log(`  ${DEFAULT_PASSWORD}`);
  console.log('');
  console.log('Users:');
  for (const user of SEED_USERS) {
    console.log(`  - ${user.email} [${user.role}]`);
  }
}

main()
  .catch((error: unknown) => {
    console.error('Seed failed:', error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
