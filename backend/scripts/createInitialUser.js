const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createInitialUser() {
  try {
    const hashedPassword = await bcrypt.hash('Admin@123', 10);
    
    const user = await prisma.user.create({
      data: {
        name: 'QA Manager',
        email: 'qa.manager@example.com',
        password: hashedPassword,
        role: 'QA_MANAGER'
      }
    });

    console.log('Initial user created:', {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error creating initial user:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createInitialUser();
