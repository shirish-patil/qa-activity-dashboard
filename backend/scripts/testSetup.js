const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function testSetup() {
  try {
    // Test database connection
    await prisma.$connect();
    console.log('✅ Database connection successful');

    // Create test user
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    // Delete existing user if exists
    await prisma.user.deleteMany({
      where: {
        email: 'qa.manager@example.com'
      }
    });

    // Create new user
    const user = await prisma.user.create({
      data: {
        name: 'QA Manager',
        email: 'qa.manager@example.com',
        password: hashedPassword,
        role: 'QA_MANAGER'
      }
    });

    console.log('✅ Test user created:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });

  } catch (error) {
    console.error('❌ Setup error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testSetup();
