import React, { useState } from 'react';
import { format } from 'date-fns';

const ActivityDashboard = ({ activities }) => {
  const [filter, setFilter] = useState({
    activityType: 'DAILY',
    userId: '',
    dateRange: null
  });

  const groupedActivities = activities.reduce((acc, activity) => {
    const key = format(new Date(activity.date), 
      filter.activityType === 'MONTHLY' ? 'MMM yyyy' :
      filter.activityType === 'WEEKLY' ? 'wo week yyyy' : 'dd MMM yyyy'
    );
    
    if (!acc[key]) acc[key] = [];
    acc[key].push(activity);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow">
        {/* Filter controls */}
      </div>

      {/* Activities Display */}
      {Object.entries(groupedActivities).map(([date, dateActivities]) => (
        <div key={date} className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-semibold mb-4">{date}</h3>
          <div className="space-y-4">
            {dateActivities.map(activity => (
              <div key={activity.id} className="border-l-4 border-blue-500 pl-4">
                <div className="font-medium">{activity.user.name}</div>
                <div className="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-medium">Jira Tickets</h4>
                    <p className="text-gray-600">{activity.jiraTickets}</p>
                  </div>
                  {/* Similar sections for other activities */}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ActivityDashboard;
