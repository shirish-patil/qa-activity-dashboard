const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

(async () => {
  const prisma = new PrismaClient();
  try {
    const hash = await bcrypt.hash('QAManager@123', 10);
    const user = await prisma.user.update({
      where: { email: 'qa.manager@example.com' },
      data: { password: hash }
    });
    console.log('Updated user:', user.email);
  } catch (e) {
    console.error('Error updating password:', e);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
