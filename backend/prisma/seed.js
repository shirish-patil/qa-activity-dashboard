const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  // Hash passwords
  const managerPassword = await bcrypt.hash('Admin@123', 10);
  const leadPassword = await bcrypt.hash('Lead@123', 10);
  const qaPassword = await bcrypt.hash('QA@123', 10);

  // Create QA Manager
  const manager = await prisma.user.upsert({
    where: { email: 'qa.manager@example.com' },
    update: {},
    create: {
      email: 'qa.manager@example.com',
      name: 'QA Manager',
      password: managerPassword,
      role: 'QA_MANAGER'
    },
  });

  // Create QA Lead
  const lead = await prisma.user.upsert({
    where: { email: 'qa.lead@example.com' },
    update: {},
    create: {
      email: 'qa.lead@example.com',
      name: 'QA Lead',
      password: leadPassword,
      role: 'QA_LEAD'
    },
  });

  // Create QA Engineer
  const qa = await prisma.user.upsert({
    where: { email: 'qa.engineer@example.com' },
    update: {},
    create: {
      email: 'qa.engineer@example.com',
      name: 'QA Engineer',
      password: qaPassword,
      role: 'QA'
    },
  });

  // Sample Jira tickets
  const jiraTickets = [
    'JIRA-101: Implement login functionality testing',
    'JIRA-102: API integration testing for user management',
    'JIRA-103: Dashboard UI testing',
    'JIRA-104: Performance testing of search functionality',
    'JIRA-105: Security testing of authentication flow'
  ];

  // Sample testing activities
  const manualTestingActivities = [
    'Performed end-to-end testing of user registration flow',
    'Tested responsive design on multiple devices',
    'Validated form validation and error messages',
    'Tested user profile update functionality',
    'Cross-browser testing of dashboard features'
  ];

  const apiTestingActivities = [
    'Tested REST API endpoints for user management',
    'Validated API response formats and status codes',
    'Performance testing of API endpoints',
    'Security testing of API authentication',
    'API integration testing with frontend'
  ];

  const cypressTestingActivities = [
    'Created Cypress test suite for login flow',
    'Implemented E2E tests for user management',
    'Added test cases for dashboard functionality',
    'Updated test automation framework',
    'Fixed flaky tests and improved stability'
  ];

  // Create activities for each user
  const users = [manager, lead, qa];
  const activityTypes = ['DAILY', 'WEEKLY', 'MONTHLY'];
  const today = new Date();

  for (const user of users) {
    // Create 15 activities for each user (5 each for different time periods)
    for (let i = 0; i < 15; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() - i); // Activities spread over the last 15 days

      const randomJira = jiraTickets[Math.floor(Math.random() * jiraTickets.length)];
      const randomManual = manualTestingActivities[Math.floor(Math.random() * manualTestingActivities.length)];
      const randomAPI = apiTestingActivities[Math.floor(Math.random() * apiTestingActivities.length)];
      const randomCypress = cypressTestingActivities[Math.floor(Math.random() * cypressTestingActivities.length)];

      await prisma.qAActivity.create({
        data: {
          userId: user.id,
          date: date,
          activityType: activityTypes[i % activityTypes.length],
          jiraTickets: i % 2 === 0 ? randomJira : null,
          manualTesting: i % 3 === 0 ? randomManual : null,
          apiTesting: i % 2 === 1 ? randomAPI : null,
          cypressTesting: i % 4 === 0 ? randomCypress : null,
          additionalNotes: `Activity log for ${user.name} - Day ${i + 1}`,
          reviewed: Math.random() > 0.5
        }
      });
    }
  }

  console.log('Database has been seeded with test users and activities! 🌱');
  console.log('\nTest Users:');
  console.log('1. QA Manager');
  console.log('   Email: qa.manager@example.com');
  console.log('   Password: Admin@123');
  console.log('\n2. QA Lead');
  console.log('   Email: qa.lead@example.com');
  console.log('   Password: Lead@123');
  console.log('\n3. QA Engineer');
  console.log('   Email: qa.engineer@example.com');
  console.log('   Password: QA@123');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
