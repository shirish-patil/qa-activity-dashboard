// backend/index.js

require('dotenv').config();

const express = require("express");
const cors = require("cors");
const { PrismaClient } = require("@prisma/client");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { verifyToken, checkRole } = require('./middleware/auth');
const { format } = require('date-fns');
const { generateActivitySummary } = require('./services/aiSummary');

const prisma = new PrismaClient();
const app = express();

// CORS configuration - Updated to be more permissive for testing
app.use(cors());

// Make sure this comes after CORS configuration
app.use(express.json());

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ status: 'Server is running' });
});

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request received:', req.body);
    const { email, password } = req.body;

    // Find user
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      console.log('User not found');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      console.log('Invalid password');
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '24h' }
    );

    const responseData = {
      token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    };

    console.log('Login successful, sending response:', responseData);
    res.json(responseData);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get current user endpoint
app.get('/api/auth/me', verifyToken, async (req, res) => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        role: true
      }
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error fetching current user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// API endpoint to receive QA activity
app.post("/api/qa-activity", async (req, res) => {
  try {
    const data = await prisma.qaActivity.create({ data: req.body });
    res.json({ message: "Activity saved successfully", data });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save activity" });
  }
});

// Get activities based on role
app.get('/api/activities', verifyToken, async (req, res) => {
  try {
    const { role, id } = req.user;
    const { type, dateRange } = req.query;
    let whereClause = {};

    // Add type filter if specified
    if (type && type !== 'ALL') {
      whereClause.activityType = type;
    }

    // Add date range filter
    if (dateRange !== 'ALL') {
      const now = new Date();
      if (dateRange === 'TODAY') {
        const startOfDay = new Date(now.setHours(0, 0, 0, 0));
        whereClause.date = {
          gte: startOfDay
        };
      } else if (dateRange === 'WEEK') {
        const startOfWeek = new Date(now);
        startOfWeek.setDate(now.getDate() - now.getDay());
        startOfWeek.setHours(0, 0, 0, 0);
        whereClause.date = {
          gte: startOfWeek
        };
      } else if (dateRange === 'MONTH') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        whereClause.date = {
          gte: startOfMonth
        };
      }
    }

    // Add role-based filters
    switch (role) {
      case 'QA_MANAGER':
        // QA Manager can see all activities
        // No additional filters needed
        break;

      case 'QA_LEAD':
        // QA Lead can see their own activities and QA activities, but not QA Manager activities
        whereClause.OR = [
          { userId: id }, // Their own activities
          { 
            user: {
              role: 'QA' // Activities from QA role users
            }
          }
        ];
        break;

      case 'QA':
        // QA can only see their own activities
        whereClause.userId = id;
        break;

      default:
        return res.status(403).json({ message: 'Invalid role' });
    }

    const activities = await prisma.qAActivity.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    });

    res.json(activities);
  } catch (error) {
    console.error('Error fetching activities:', error);
    res.status(500).json({ message: 'Failed to load activities' });
  }
});

// User management endpoints (QA Manager only)
app.post('/api/users', verifyToken, checkRole(['QA_MANAGER']), async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role
      }
    });

    res.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role
    });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Get users based on role
app.get('/api/users', verifyToken, async (req, res) => {
  try {
    const { role } = req.user;
    let users;

    switch (role) {
      case 'QA_MANAGER':
        // QA Manager can see all users
        users = await prisma.user.findMany({
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          },
          orderBy: {
            name: 'asc'
          }
        });
        break;

      case 'QA_LEAD':
        // QA Lead can see QA team members
        users = await prisma.user.findMany({
          where: {
            role: 'QA'
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          },
          orderBy: {
            name: 'asc'
          }
        });
        break;

      case 'QA':
        // QA can only see their own info
        users = await prisma.user.findMany({
          where: {
            id: req.user.id
          },
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        });
        break;

      default:
        return res.status(403).json({ message: 'Invalid role' });
    }

    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Add this endpoint after your existing routes
app.get('/api/dashboard/stats', verifyToken, async (req, res) => {
  try {
    const { role, id } = req.user;
    let whereClause = {};
    
    // Add role-based filters
    switch (role) {
      case 'QA_MANAGER':
        break;
      case 'QA_LEAD':
        whereClause.OR = [
          { userId: id },
          { user: { role: 'QA' } }
        ];
        break;
      case 'QA':
        whereClause.userId = id;
        break;
    }

    // Get activities with testing types
    const activities = await prisma.qAActivity.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true
          }
        }
      }
    });

    // Calculate testing type distribution
    const testingTypeStats = {
      'Jira Tickets': 0,
      'Manual Testing': 0,
      'API Testing': 0,
      'Cypress Testing': 0,
      'Additional Notes': 0
    };

    activities.forEach(activity => {
      if (activity.jiraTickets) testingTypeStats['Jira Tickets']++;
      if (activity.manualTesting) testingTypeStats['Manual Testing']++;
      if (activity.apiTesting) testingTypeStats['API Testing']++;
      if (activity.cypressTesting) testingTypeStats['Cypress Testing']++;
      if (activity.additionalNotes) testingTypeStats['Additional Notes']++;
    });

    // Format data for pie chart
    const testingTypeDistribution = Object.entries(testingTypeStats).map(([name, value]) => ({
      name,
      value
    }));

    // Calculate user testing distribution
    const userStats = {};
    activities.forEach(activity => {
      const userName = activity.user.name;
      if (!userStats[userName]) {
        userStats[userName] = {
          name: userName,
          'Jira Tickets': 0,
          'Manual Testing': 0,
          'API Testing': 0,
          'Cypress Testing': 0
        };
      }
      if (activity.jiraTickets) userStats[userName]['Jira Tickets']++;
      if (activity.manualTesting) userStats[userName]['Manual Testing']++;
      if (activity.apiTesting) userStats[userName]['API Testing']++;
      if (activity.cypressTesting) userStats[userName]['Cypress Testing']++;
    });

    const userTestingDistribution = Object.values(userStats);

    res.json({
      totalActivities: activities.length,
      weeklyActivities: activities.filter(a => {
        const activityDate = new Date(a.date);
        const now = new Date();
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        return activityDate >= startOfWeek;
      }).length,
      teamMembers: new Set(activities.map(a => a.userId)).size,
      testingTypeDistribution,
      userTestingDistribution
    });

  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ message: 'Failed to load dashboard statistics' });
  }
});

// Add or update the activities endpoint
app.post('/api/activities', verifyToken, async (req, res) => {
  try {
    const { activityType, date, jiraTickets, manualTesting, apiTesting, cypressTesting, additionalNotes } = req.body;
    const userId = req.user.id;

    const activity = await prisma.qAActivity.create({
      data: {
        activityType,
        date: new Date(date),
        jiraTickets,
        manualTesting,
        apiTesting,
        cypressTesting,
        additionalNotes,
        userId,
        reviewed: false
      }
    });

    res.json(activity);
  } catch (error) {
    console.error('Error creating activity:', error);
    res.status(500).json({ message: 'Failed to create activity' });
  }
});

// Update the AI summary endpoint
app.post('/api/ai/summary', verifyToken, async (req, res) => {
  try {
    console.log('Received AI summary request:', {
      user: req.user,
      body: req.body
    });

    const { startDate, endDate, query } = req.body;
    const { id, role } = req.user;

    // Only require the query parameter
    if (!query) {
      console.log('Missing query parameter');
      return res.status(400).json({ 
        message: 'Missing required parameter. Please provide a query.' 
      });
    }

    // Validate dates if they are provided
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      
      if (isNaN(start.getTime()) || isNaN(end.getTime())) {
        return res.status(400).json({
          message: 'Invalid date format. Please provide valid dates.'
        });
      }
    }

    if (!process.env.OPENAI_API_KEY) {
      return res.status(500).json({
        message: 'OpenAI API key is not configured. Please contact system administrator.'
      });
    }

    const summary = await generateActivitySummary(id, role, startDate, endDate, query);
    console.log('Generated summary successfully');
    res.json({ summary });
  } catch (error) {
    console.error('Error in AI summary endpoint:', error);
    
    // Handle specific error cases
    if (error.message.includes('OpenAI API key')) {
      return res.status(500).json({
        message: 'OpenAI API configuration error. Please contact system administrator.'
      });
    }
    
    res.status(500).json({ 
      message: error.message || 'Failed to generate summary. Please try again or contact support if the issue persists.' 
    });
  }
});

const PORT = process.env.PORT || 8080;

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

