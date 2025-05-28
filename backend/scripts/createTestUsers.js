const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function createTestUsers() {
  try {
    // Delete existing test users
    await prisma.user.deleteMany({
      where: {
        email: {
          in: [
            'qa.manager@example.com',
            'qa.lead@example.com',
            'qa1@example.com',
            'qa2@example.com'
          ]
        }
      }
    });

    // Create test users
    const users = [
      {
        name: 'QA Manager',
        email: 'qa.manager@example.com',
        role: 'QA_MANAGER',
        password: 'Manager@123'
      },
      {
        name: 'QA Lead',
        email: 'qa.lead@example.com',
        role: 'QA_LEAD',
        password: 'Lead@123'
      },
      {
        name: 'QA Engineer 1',
        email: 'qa1@example.com',
        role: 'QA',
        password: 'QA1@123'
      },
      {
        name: 'QA Engineer 2',
        email: 'qa2@example.com',
        role: 'QA',
        password: 'QA2@123'
      }
    ];

    for (const user of users) {
      const hashedPassword = await bcrypt.hash(user.password, 10);
      await prisma.user.create({
        data: {
          name: user.name,
          email: user.email,
          password: hashedPassword,
          role: user.role
        }
      });
      console.log(`Created user: ${user.name} (${user.role})`);
    }

    console.log('Test users created successfully!');
  } catch (error) {
    console.error('Error creating test users:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createTestUsers();
