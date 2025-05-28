import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const Navigation = () => {
  const { currentUser, logout, isManager } = useAuth();
  const location = useLocation();

  if (!currentUser) {
    return null; // Don't show navigation when not logged in
  }

  const isActiveRoute = (path) => {
    return location.pathname === path ? 'border-blue-500 text-gray-900' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700';
  };

  return (
    <nav className="bg-white shadow">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-blue-600">
                QA Dashboard
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className={`${isActiveRoute('/')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Dashboard
              </Link>
              <Link
                to="/submit-activity"
                className={`${isActiveRoute('/submit-activity')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                Submit Activity
              </Link>
              {isManager && (
                <Link
                  to="/users"
                  className={`${isActiveRoute('/users')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                >
                  User Management
                </Link>
              )}
              <Link
                to="/ai-summary"
                className={`${isActiveRoute('/ai-summary')} inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
              >
                AI Summary
              </Link>
            </div>
          </div>
          <div className="hidden sm:ml-6 sm:flex sm:items-center">
            <div className="ml-3 relative">
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-700">
                  {currentUser.name} ({currentUser.role.replace('_', ' ')})
                </span>
                <button
                  onClick={logout}
                  className="bg-white px-3 py-2 rounded-md text-sm font-medium text-gray-700 hover:text-gray-900 hover:bg-gray-50"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
