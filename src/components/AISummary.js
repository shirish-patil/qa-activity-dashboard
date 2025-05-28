import React, { useState } from 'react';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { generateAISummary } from '../services/api';

const EXAMPLE_QUERIES = [
  "What are the key testing activities from this period?",
  "Summarize the Jira tickets worked on",
  "What is the progress on API testing?",
  "Generate a weekly status report",
  "What are the main achievements and challenges?",
  "Can you give me summary of all activities by QA Engineer for the year 2025?"
];

const AISummary = () => {
  const [dateRange, setDateRange] = useState([null, null]);
  const [startDate, endDate] = dateRange;
  const [query, setQuery] = useState('');
  const [summary, setSummary] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);

  const handleGenerateSummary = async () => {
    try {
      setLoading(true);
      setError(null);
      setSummary('');
      
      // Format dates if they exist, otherwise pass null
      const formattedStartDate = startDate ? new Date(startDate.setHours(0, 0, 0, 0)).toISOString() : null;
      const formattedEndDate = endDate ? new Date(endDate.setHours(23, 59, 59, 999)).toISOString() : null;
      
      const data = await generateAISummary(
        formattedStartDate,
        formattedEndDate,
        query
      );

      setSummary(data.summary);
    } catch (error) {
      setError(error.response?.data?.message || error.message || 'Failed to generate summary');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(summary);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text:', err);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h2 className="text-2xl font-bold mb-6">AI Activity Summary</h2>
        
        {/* Date Range Picker - Now Optional */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Select Date Range (Optional)
          </label>
          <DatePicker
            selectsRange={true}
            startDate={startDate}
            endDate={endDate}
            onChange={(update) => setDateRange(update)}
            className="w-full rounded-md border-gray-300 shadow-sm p-2"
            placeholderText="Select date range (optional)"
            isClearable={true}
          />
          <p className="mt-1 text-sm text-gray-500">
            Leave empty to analyze all activities
          </p>
        </div>

        {/* Query Input */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 mb-2">
            What would you like to know?
          </label>
          <textarea
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type your question here..."
            className="w-full rounded-md border-gray-300 shadow-sm p-2 h-24 mb-2"
          />
          
          {/* Example Queries */}
          <div className="mt-2">
            <p className="text-sm text-gray-600 mb-2">Example queries:</p>
            <div className="flex flex-wrap gap-2">
              {EXAMPLE_QUERIES.map((exampleQuery, index) => (
                <button
                  key={index}
                  onClick={() => setQuery(exampleQuery)}
                  className="text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 py-1 px-2 rounded-full"
                >
                  {exampleQuery}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button - Now only requires query */}
        <button
          onClick={handleGenerateSummary}
          disabled={loading || !query}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
        >
          {loading ? 'Generating Summary...' : 'Generate Summary'}
        </button>

        {/* Error Message */}
        {error && (
          <div className="mt-4 p-4 bg-red-50 text-red-700 rounded-md">
            {error}
          </div>
        )}

        {/* Summary Display */}
        {summary && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-3">
              <h3 className="text-lg font-semibold">Generated Summary</h3>
              <button
                onClick={handleCopyToClipboard}
                className="text-blue-600 hover:text-blue-800 text-sm flex items-center"
              >
                {copied ? 'Copied!' : 'Copy to Clipboard'}
              </button>
            </div>
            <div className="bg-gray-50 rounded-md p-4 whitespace-pre-wrap">
              {summary}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AISummary; 