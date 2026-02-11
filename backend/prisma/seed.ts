import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting database seed...');

  const adminPassword = await bcrypt.hash('Admin@123', 10);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@schoolassessment.com' },
    update: {},
    create: {
      email: 'admin@schoolassessment.com',
      password: adminPassword,
      name: 'System Administrator',
      role: UserRole.ADMIN,
      phone: '+91-9876543210',
      isActive: true,
    },
  });

  console.log('Created admin user:', admin.email);

  const employeePassword = await bcrypt.hash('Employee@123', 10);

  const employee1 = await prisma.user.upsert({
    where: { email: 'employee1@schoolassessment.com' },
    update: {},
    create: {
      email: 'employee1@schoolassessment.com',
      password: employeePassword,
      name: 'Rahul Kumar',
      role: UserRole.EMPLOYEE,
      phone: '+91-9876543211',
      isActive: true,
    },
  });

  const employee2 = await prisma.user.upsert({
    where: { email: 'employee2@schoolassessment.com' },
    update: {},
    create: {
      email: 'employee2@schoolassessment.com',
      password: employeePassword,
      name: 'Priya Sharma',
      role: UserRole.EMPLOYEE,
      phone: '+91-9876543212',
      isActive: true,
    },
  });

  console.log('Created employees:', employee1.email, employee2.email);

  console.log('\n=== Login Credentials ===');
  console.log(`Admin: ${admin.email} / Admin@123`);
  console.log(`Employee 1: ${employee1.email} / Employee@123`);
  console.log(`Employee 2: ${employee2.email} / Employee@123`);
  console.log('========================\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
