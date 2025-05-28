const axios = require('axios');
const { PrismaClient } = require('@prisma/client');
const { format, parseISO } = require('date-fns');

const prisma = new PrismaClient();

// Validate environment variables
if (!process.env.OPENAI_API_KEY) {
  throw new Error('OPENAI_API_KEY is not configured in environment variables');
}

if (!process.env.OPENAI_API_ENDPOINT) {
  throw new Error('OPENAI_API_ENDPOINT is not configured in environment variables');
}

async function generateActivitySummary(userId, role, startDate, endDate, query) {
  try {
    console.log('Generating summary for:', { userId, role, startDate, endDate, query });

    // Extract user name from query if present
    const userNameMatch = query.match(/for\s+([A-Za-z\s]+)/i);
    const targetUserName = userNameMatch ? userNameMatch[1].trim() : null;

    // Build where clause based on role
    let whereClause = {};

    // Add date range if provided, otherwise use current week
    if (startDate && endDate) {
      const startDateTime = new Date(startDate);
      startDateTime.setHours(0, 0, 0, 0);
      
      const endDateTime = new Date(endDate);
      endDateTime.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: startDateTime,
        lte: endDateTime
      };
    } else {
      // Default to current week (Monday to Friday)
      const now = new Date();
      const currentDay = now.getDay();
      const diff = currentDay === 0 ? -6 : 1 - currentDay; // Adjust for Sunday
      
      const monday = new Date(now);
      monday.setDate(now.getDate() + diff);
      monday.setHours(0, 0, 0, 0);
      
      const friday = new Date(monday);
      friday.setDate(monday.getDate() + 4);
      friday.setHours(23, 59, 59, 999);

      whereClause.date = {
        gte: monday,
        lte: friday
      };
    }

    // If a specific user is mentioned in the query, filter by that user
    if (targetUserName) {
      whereClause.user = {
        name: {
          contains: targetUserName,
          mode: 'insensitive'
        }
      };
    } else {
      // Apply role-based filters only if no specific user is mentioned
      switch (role) {
        case 'QA_MANAGER':
          // Can see all activities
          break;
        case 'QA_LEAD':
          whereClause.OR = [
            { userId },
            { user: { role: 'QA' } }
          ];
          break;
        case 'QA':
          whereClause.userId = userId;
          break;
      }
    }

    console.log('Fetching activities with where clause:', whereClause);

    const activities = await prisma.qAActivity.findMany({
      where: whereClause,
      include: {
        user: {
          select: {
            name: true,
            role: true
          }
        }
      },
      orderBy: {
        date: 'asc'
      }
    });

    console.log(`Found ${activities.length} activities`);

    if (activities.length === 0) {
      return "No activities found for the specified criteria.";
    }

    // Format activities for AI processing
    const formattedActivities = activities.map(activity => ({
      date: format(activity.date, 'yyyy-MM-dd'),
      user: activity.user.name,
      role: activity.user.role,
      activityType: activity.activityType,
      details: {
        ...(activity.jiraTickets && { "Jira Tickets": activity.jiraTickets }),
        ...(activity.manualTesting && { "Manual Testing": activity.manualTesting }),
        ...(activity.apiTesting && { "API Testing": activity.apiTesting }),
        ...(activity.cypressTesting && { "Cypress Testing": activity.cypressTesting }),
        ...(activity.additionalNotes && { "Additional Notes": activity.additionalNotes })
      }
    }));

    console.log('Formatted activities for OpenAI:', JSON.stringify(formattedActivities, null, 2));

    // Create a system message based on the context
    const dateRangeText = startDate && endDate 
      ? `from ${format(parseISO(startDate), 'MMMM d, yyyy')} to ${format(parseISO(endDate), 'MMMM d, yyyy')}`
      : 'for the current week (Monday to Friday)';

    const userContext = targetUserName 
      ? `for the user ${targetUserName}`
      : `for the current user role: ${role}`;

    const systemMessage = `You are a QA activity analyzer and summarizer. You have access to QA activities ${dateRangeText} ${userContext}.
    
Please analyze the activities and provide a professional summary based on the user's query. Focus on:
1. Key achievements and milestones
2. Testing progress and coverage
3. Important issues or blockers identified
4. Patterns or trends in testing activities
5. Recommendations if applicable

Format the response in a clear, professional manner.`;

    console.log('Sending request to OpenAI...');

    // Create the API request payload
    const payload = {
      model: process.env.OPENAI_API_MODEL || "avathon-openai/gpt-4o-mini",
      messages: [
        {
          role: "system",
          content: systemMessage
        },
        {
          role: "user",
          content: `Based on these activities:\n${JSON.stringify(formattedActivities, null, 2)}\n\nPlease provide a summary addressing this query: ${query}`
        }
      ],
      temperature: 0.7,
      max_tokens: 1000
    };

    // Construct the full API endpoint URL
    const apiEndpoint = `${process.env.OPENAI_API_ENDPOINT}/v1/chat/completions`;
    
    console.log('API Endpoint:', apiEndpoint);
    console.log('Request Payload:', JSON.stringify(payload, null, 2));

    // Make direct API call to your organization's endpoint
    const response = await axios({
      method: 'post',
      url: apiEndpoint,
      data: payload,
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    console.log('Received response from OpenAI');

    if (!response.data || !response.data.choices || response.data.choices.length === 0) {
      throw new Error('No response received from API');
    }

    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error in generateActivitySummary:', error);
    
    if (error.response?.status === 401) {
      throw new Error('Invalid API key or endpoint configuration. Please check your environment variables.');
    } else if (error.response?.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    
    throw error;
  }
}

module.exports = { generateActivitySummary };
