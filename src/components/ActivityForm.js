import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { format, startOfWeek, endOfWeek, isFriday, startOfMonth } from 'date-fns';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';

const ActivityForm = ({ onSubmitSuccess }) => {
  const { currentUser } = useAuth();
  const [activityType, setActivityType] = useState('DAILY');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [formData, setFormData] = useState({
    jiraTickets: '',
    manualTesting: '',
    apiTesting: '',
    cypressTesting: '',
    additionalNotes: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isPreview, setIsPreview] = useState(false);

  // Custom date filtering for weekly updates (only Fridays)
  const isWeeklySelectableDate = (date) => {
    return isFriday(date);
  };

  // Get date range message based on activity type
  const getDateRangeMessage = () => {
    switch (activityType) {
      case 'DAILY':
        return `Selected Date: ${format(selectedDate, 'MMMM d, yyyy')}`;
      case 'WEEKLY':
        const weekStart = startOfWeek(selectedDate);
        const weekEnd = endOfWeek(selectedDate);
        return `Selected Date Range: ${format(weekStart, 'MMMM d, yyyy')} to ${format(weekEnd, 'MMMM d, yyyy')}`;
      case 'MONTHLY':
        const monthStart = startOfMonth(selectedDate);
        return `Selected Month: ${format(monthStart, 'MMMM yyyy')}`;
      default:
        return '';
    }
  };

  const handlePreview = (e) => {
    e.preventDefault();
    setIsPreview(true);
  };

  const handleEdit = () => {
    setIsPreview(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const payload = {
        ...formData,
        activityType,
        date: selectedDate,
        userId: currentUser.id
      };

      await api.post('/api/activities', payload);
      setSuccess('Activity submitted successfully');
      setFormData({
        jiraTickets: '',
        manualTesting: '',
        apiTesting: '',
        cypressTesting: '',
        additionalNotes: ''
      });
      setIsPreview(false);
      onSubmitSuccess?.();
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to submit activity');
    } finally {
      setLoading(false);
    }
  };

  const PreviewSection = () => (
    <div className="bg-gray-50 p-6 rounded-lg mt-6">
      <h4 className="text-lg font-medium text-gray-900 mb-4">Activity Preview</h4>
      <div className="space-y-4">
        <div>
          <p className="text-sm font-medium text-gray-500">Activity Type</p>
          <p className="mt-1">{activityType}</p>
        </div>
        <div>
          <p className="text-sm font-medium text-gray-500">Date</p>
          <p className="mt-1">{getDateRangeMessage()}</p>
        </div>
        {formData.jiraTickets && (
          <div>
            <p className="text-sm font-medium text-gray-500">Jira Tickets</p>
            <p className="mt-1 whitespace-pre-line">{formData.jiraTickets}</p>
          </div>
        )}
        {formData.manualTesting && (
          <div>
            <p className="text-sm font-medium text-gray-500">Manual Testing</p>
            <p className="mt-1 whitespace-pre-line">{formData.manualTesting}</p>
          </div>
        )}
        {formData.apiTesting && (
          <div>
            <p className="text-sm font-medium text-gray-500">API Testing</p>
            <p className="mt-1 whitespace-pre-line">{formData.apiTesting}</p>
          </div>
        )}
        {formData.cypressTesting && (
          <div>
            <p className="text-sm font-medium text-gray-500">Cypress Testing</p>
            <p className="mt-1 whitespace-pre-line">{formData.cypressTesting}</p>
          </div>
        )}
        {formData.additionalNotes && (
          <div>
            <p className="text-sm font-medium text-gray-500">Additional Notes</p>
            <p className="mt-1 whitespace-pre-line">{formData.additionalNotes}</p>
          </div>
        )}
      </div>
      <div className="mt-6 flex space-x-4">
        <button
          type="button"
          onClick={handleEdit}
          className="inline-flex justify-center py-2 px-4 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Edit
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={loading}
          className={`inline-flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white ${
            loading
              ? 'bg-blue-400'
              : 'bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500'
          }`}
        >
          {loading ? 'Submitting...' : 'Submit Activity'}
        </button>
      </div>
    </div>
  );

  return (
    <div className="bg-white shadow sm:rounded-lg">
      <div className="px-4 py-5 sm:p-6">
        <h3 className="text-lg leading-6 font-medium text-gray-900">
          Record QA Activity
        </h3>
        <form onSubmit={isPreview ? handleSubmit : handlePreview} className="mt-5 space-y-6">
          {error && (
            <div className="rounded-md bg-red-50 p-4">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}
          {success && (
            <div className="rounded-md bg-green-50 p-4">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          )}

          {!isPreview && (
            <>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Activity Type
                  </label>
                  <select
                    value={activityType}
                    onChange={(e) => setActivityType(e.target.value)}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                  >
                    <option value="DAILY">Daily Update</option>
                    <option value="WEEKLY">Weekly Update</option>
                    <option value="MONTHLY">Monthly Update</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700">
                    Select Date
                  </label>
                  {activityType === 'MONTHLY' ? (
                    <DatePicker
                      selected={selectedDate}
                      onChange={setSelectedDate}
                      dateFormat="MMMM yyyy"
                      showMonthYearPicker
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    />
                  ) : activityType === 'WEEKLY' ? (
                    <DatePicker
                      selected={selectedDate}
                      onChange={setSelectedDate}
                      filterDate={isWeeklySelectableDate}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    />
                  ) : (
                    <DatePicker
                      selected={selectedDate}
                      onChange={setSelectedDate}
                      className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm rounded-md"
                    />
                  )}
                </div>
              </div>

              <div className="text-sm text-gray-600">
                {getDateRangeMessage()}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Jira Tickets
                </label>
                <textarea
                  value={formData.jiraTickets}
                  onChange={(e) =>
                    setFormData({ ...formData, jiraTickets: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="List Jira tickets worked on, testing performed, platforms tested..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Manual Testing
                </label>
                <textarea
                  value={formData.manualTesting}
                  onChange={(e) =>
                    setFormData({ ...formData, manualTesting: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe manual testing activities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  API Testing & Automation
                </label>
                <textarea
                  value={formData.apiTesting}
                  onChange={(e) =>
                    setFormData({ ...formData, apiTesting: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe API testing and automation activities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Cypress Testing
                </label>
                <textarea
                  value={formData.cypressTesting}
                  onChange={(e) =>
                    setFormData({ ...formData, cypressTesting: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Describe Cypress automation activities..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Additional Notes
                </label>
                <textarea
                  value={formData.additionalNotes}
                  onChange={(e) =>
                    setFormData({ ...formData, additionalNotes: e.target.value })
                  }
                  rows={3}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                  placeholder="Any additional QA efforts or information..."
                />
              </div>

              <div>
                <button
                  type="submit"
                  className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                  Preview Activity
                </button>
              </div>
            </>
          )}
          
          {isPreview && <PreviewSection />}
        </form>
      </div>
    </div>
  );
};

export default ActivityForm;
