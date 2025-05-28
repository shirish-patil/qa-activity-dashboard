const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function verifySetup() {
  try {
    // 1. Test database connection
    console.log('Testing database connection...');
    await prisma.$connect();
    console.log('Database connection successful!');

    // 2. Check for existing test user
    console.log('\nChecking for existing test user...');
    const existingUser = await prisma.user.findUnique({
      where: { email: 'qa.manager@example.com' }
    });

    if (existingUser) {
      console.log('Test user exists:', {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
        role: existingUser.role
      });
    } else {
      // 3. Create test user if doesn't exist
      console.log('\nCreating test user...');
      const hashedPassword = await bcrypt.hash('Admin@123', 10);
      const newUser = await prisma.user.create({
        data: {
          name: 'QA Manager',
          email: 'qa.manager@example.com',
          password: hashedPassword,
          role: 'QA_MANAGER'
        }
      });
      console.log('Test user created:', {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role
      });
    }

  } catch (error) {
    console.error('Error during verification:', error);
  } finally {
    await prisma.$disconnect();
  }
}

verifySetup();
