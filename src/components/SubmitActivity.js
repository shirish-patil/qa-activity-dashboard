import React from 'react';
import ActivityForm from './ActivityForm';

const SubmitActivity = () => {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
            Submit Activity
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            Record your QA activities and updates
          </p>
        </div>
        <ActivityForm />
      </div>
    </div>
  );
};

export default SubmitActivity; 