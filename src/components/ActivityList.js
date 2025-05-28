import React, { useState, useEffect, useCallback } from 'react';
import { format } from 'date-fns';
import api from '../services/api';
import { ChevronDownIcon, ChevronRightIcon } from '@heroicons/react/24/solid';

const ActivityList = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [expandedRows, setExpandedRows] = useState(new Set());
  const [filter, setFilter] = useState({
    type: 'ALL',
    dateRange: 'ALL'
  });

  const loadActivities = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get('/api/activities', {
        params: filter
      });
      setActivities(response.data);
      setError(null);
    } catch (error) {
      console.error('Error loading activities:', error);
      setError('Failed to load activities');
    } finally {
      setLoading(false);
    }
  }, [filter]);

  useEffect(() => {
    loadActivities();
  }, [loadActivities]);

  const toggleRow = (id) => {
    const newExpandedRows = new Set(expandedRows);
    if (newExpandedRows.has(id)) {
      newExpandedRows.delete(id);
    } else {
      newExpandedRows.add(id);
    }
    setExpandedRows(newExpandedRows);
  };

  const getFirstAvailableSummary = (activity) => {
    const fields = [
      { value: activity.jiraTickets, label: 'Jira' },
      { value: activity.manualTesting, label: 'Manual Testing' },
      { value: activity.apiTesting, label: 'API Testing' },
      { value: activity.cypressTesting, label: 'Cypress' },
      { value: activity.additionalNotes, label: 'Notes' }
    ];

    const firstAvailable = fields.find(field => field.value);
    if (firstAvailable) {
      const summary = firstAvailable.value.split('\n')[0]; // Get first line
      return `${firstAvailable.label}: ${summary.substring(0, 100)}${summary.length > 100 ? '...' : ''}`;
    }
    return 'No activities recorded';
  };

  if (loading) {
    return (
      <div className="text-center py-4">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto"></div>
        <p className="mt-2 text-gray-600">Loading activities...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-4 rounded-md">
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white shadow px-4 py-5 sm:rounded-lg sm:p-6">
        <div className="md:grid md:grid-cols-3 md:gap-6">
          <div className="md:col-span-1">
            <h3 className="text-lg font-medium leading-6 text-gray-900">
              Activity Filters
            </h3>
          </div>
          <div className="mt-5 md:mt-0 md:col-span-2">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Type
                </label>
                <select
                  value={filter.type}
                  onChange={(e) =>
                    setFilter({ ...filter, type: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="ALL">All Activities</option>
                  <option value="DAILY">Daily</option>
                  <option value="WEEKLY">Weekly</option>
                  <option value="MONTHLY">Monthly</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Date Range
                </label>
                <select
                  value={filter.dateRange}
                  onChange={(e) =>
                    setFilter({ ...filter, dateRange: e.target.value })
                  }
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  <option value="ALL">All Time</option>
                  <option value="TODAY">Today</option>
                  <option value="WEEK">This Week</option>
                  <option value="MONTH">This Month</option>
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white shadow overflow-hidden sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="w-10 px-4 py-3"></th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Date
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Type
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Team Member
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Role
              </th>
              <th scope="col" className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Summary
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {activities.map((activity) => (
              <React.Fragment key={activity.id}>
                <tr className="hover:bg-gray-50 cursor-pointer" onClick={() => toggleRow(activity.id)}>
                  <td className="px-4 py-4">
                    {expandedRows.has(activity.id) ? (
                      <ChevronDownIcon className="h-5 w-5 text-gray-400" />
                    ) : (
                      <ChevronRightIcon className="h-5 w-5 text-gray-400" />
                    )}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {format(new Date(activity.date), 'MMM d, yyyy')}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.activityType}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-900">
                    {activity.user.name}
                  </td>
                  <td className="px-4 py-4 whitespace-nowrap text-sm text-gray-500">
                    {activity.user.role.replace('_', ' ')}
                  </td>
                  <td className="px-4 py-4 text-sm text-gray-500">
                    {getFirstAvailableSummary(activity)}
                  </td>
                </tr>
                {expandedRows.has(activity.id) && (
                  <tr>
                    <td colSpan="5" className="px-4 py-4 bg-gray-50">
                      <div className="space-y-4">
                        {activity.jiraTickets && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Jira Tickets</h4>
                            <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{activity.jiraTickets}</p>
                          </div>
                        )}
                        {activity.manualTesting && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Manual Testing</h4>
                            <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{activity.manualTesting}</p>
                          </div>
                        )}
                        {activity.apiTesting && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">API Testing</h4>
                            <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{activity.apiTesting}</p>
                          </div>
                        )}
                        {activity.cypressTesting && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Cypress Testing</h4>
                            <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{activity.cypressTesting}</p>
                          </div>
                        )}
                        {activity.additionalNotes && (
                          <div>
                            <h4 className="text-sm font-medium text-gray-900">Additional Notes</h4>
                            <p className="mt-1 text-sm text-gray-600 whitespace-pre-line">{activity.additionalNotes}</p>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
        {activities.length === 0 && (
          <div className="text-center py-4">
            <p className="text-gray-500">No activities found</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ActivityList;
