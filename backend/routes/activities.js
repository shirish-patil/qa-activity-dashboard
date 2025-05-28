const express = require('express');
const router = express.Router();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// Create activity
router.post('/', async (req, res) => {
  try {
    const {
      userId,
      date,
      activityType,
      jiraTickets,
      manualTesting,
      apiTesting,
      cypressTesting,
      additionalNotes
    } = req.body;

    const activity = await prisma.qAActivity.create({
      data: {
        userId,
        date: new Date(date),
        activityType,
        jiraTickets,
        manualTesting,
        apiTesting,
        cypressTesting,
        additionalNotes
      }
    });
    res.json(activity);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get activities with filters
router.get('/', async (req, res) => {
  try {
    const { userId, startDate, endDate, activityType } = req.query;
    
    const activities = await prisma.qAActivity.findMany({
      where: {
        userId: userId ? parseInt(userId) : undefined,
        date: {
          gte: startDate ? new Date(startDate) : undefined,
          lte: endDate ? new Date(endDate) : undefined,
        },
        activityType: activityType || undefined
      },
      include: {
        user: true
      },
      orderBy: {
        date: 'desc'
      }
    });
    res.json(activities);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});