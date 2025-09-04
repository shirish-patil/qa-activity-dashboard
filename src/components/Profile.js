import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { changePassword } from '../services/api';

const Profile = () => {
  const { currentUser } = useAuth();
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [errors, setErrors] = useState({});
  const [currentPasswordValidated, setCurrentPasswordValidated] = useState(false);

  // Validate fields whenever passwordData changes
  useEffect(() => {
    if (showPasswordForm) {
      validateAllFields();
    }
  }, [passwordData, showPasswordForm]);

  const handlePasswordChange = (e) => {
    const { name, value } = e.target;
    
    // Update the password data
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error for the current field when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
    
    // If current password field changes, reset validation state
    if (name === 'currentPassword') {
      setCurrentPasswordValidated(false);
      setMessage({ type: '', text: '' });
    }
  };

  // Separate function to validate all fields
  const validateAllFields = () => {
    const newErrors = {};
    
    // Check current password
    if (passwordData.currentPassword.length === 0) {
      newErrors.currentPassword = 'Current password is required';
    }
    
    // Check new password
    if (passwordData.newPassword.length === 0) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters long';
    }
    
    // Check confirm password
    if (passwordData.confirmPassword.length === 0) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    // Check if new password is same as current password
    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }
    
    setErrors(newErrors);
  };

  const validatePasswordForm = () => {
    const newErrors = {};

    if (!passwordData.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    }

    if (!passwordData.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordData.newPassword.length < 8) {
      newErrors.newPassword = 'New password must be at least 8 characters long';
    }

    if (!passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordData.newPassword !== passwordData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    // Check if new password is same as current password
    if (passwordData.currentPassword && passwordData.newPassword && 
        passwordData.currentPassword === passwordData.newPassword) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setLoading(true);
      setMessage({ type: '', text: '' });
      
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      setMessage({ 
        type: 'success', 
        text: 'Password changed successfully!' 
      });
      
      // Mark current password as validated
      setCurrentPasswordValidated(true);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
      
      // Hide password form after successful change
      setTimeout(() => {
        setShowPasswordForm(false);
        setMessage({ type: '', text: '' });
        setCurrentPasswordValidated(false);
      }, 2000);
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || 'Failed to change password';
      setMessage({ 
        type: 'error', 
        text: errorMessage 
      });
      
      // If it's a current password error, clear the current password field and reset validation
      if (errorMessage.includes('Current password') || errorMessage.includes('current password')) {
        setPasswordData(prev => ({
          ...prev,
          currentPassword: ''
        }));
        setErrors(prev => ({
          ...prev,
          currentPassword: 'Current password is incorrect'
        }));
        setCurrentPasswordValidated(false);
      }
    } finally {
      setLoading(false);
    }
  };

  const getRoleDisplayName = (role) => {
    return role.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  // Check if form is valid for submit button
  const isFormValid = () => {
    // Check if all required fields have content
    const hasRequiredContent = passwordData.currentPassword.length > 0 && 
                              passwordData.newPassword.length >= 8 && 
                              passwordData.confirmPassword.length > 0;
    
    // Check if passwords match
    const passwordsMatch = passwordData.newPassword === passwordData.confirmPassword;
    
    // Check if new password is different from current
    const isDifferentPassword = passwordData.currentPassword !== passwordData.newPassword;
    
    // Check if there are no validation errors
    const noValidationErrors = Object.keys(errors).length === 0;
    
    // Check if there are no API error messages
    const noApiErrors = !message.text || message.type === 'success';
    
    // IMPORTANT: Current password must be validated (no errors and no pending state)
    const currentPasswordValidated = passwordData.currentPassword.length > 0 && 
                                    !errors.currentPassword && 
                                    (message.type === 'success' || !message.text);
    
    const isValid = hasRequiredContent && passwordsMatch && isDifferentPassword && 
                    noValidationErrors && noApiErrors && currentPasswordValidated;
    
    // Debug logging
    if (process.env.NODE_ENV === 'development') {
      console.log('Form validation:', {
        hasRequiredContent,
        passwordsMatch,
        isDifferentPassword,
        noValidationErrors,
        noApiErrors,
        currentPasswordValidated,
        errors: Object.keys(errors),
        message: message.text,
        isValid
      });
    }
    
    return isValid;
  };

  // Password requirement validation functions
  const getPasswordRequirements = () => {
    return [
      {
        text: 'At least 8 characters long',
        isValid: passwordData.newPassword.length >= 8,
        key: 'length'
      },
      {
        text: 'Current password must be correct',
        isValid: passwordData.currentPassword.length > 0 && !errors.currentPassword && message.type === 'success',
        key: 'current',
        isPending: passwordData.currentPassword.length > 0 && !errors.currentPassword && !message.text,
        isError: passwordData.currentPassword.length > 0 && errors.currentPassword
      },
      {
        text: 'New passwords must match',
        isValid: passwordData.newPassword.length > 0 && 
                 passwordData.confirmPassword.length > 0 && 
                 passwordData.newPassword === passwordData.confirmPassword,
        key: 'match'
      },
      {
        text: 'New password must be different from current password',
        isValid: passwordData.newPassword.length > 0 && 
                 passwordData.currentPassword.length > 0 && 
                 passwordData.newPassword !== passwordData.currentPassword,
        key: 'different'
      }
    ];
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-gray-900">Profile Settings</h1>
          <p className="text-sm text-gray-600">Manage your account information and security settings</p>
        </div>

        <div className="px-6 py-6 space-y-6">
          {/* User Information */}
          <div>
            <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <label className="block text-sm font-medium text-gray-700">Full Name</label>
                <p className="mt-1 text-sm text-gray-900">{currentUser.name}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Email Address</label>
                <p className="mt-1 text-sm text-gray-900">{currentUser.email}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Role</label>
                <p className="mt-1 text-sm text-gray-900">{getRoleDisplayName(currentUser.role)}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Account Status</label>
                <span className="mt-1 inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
          </div>

          {/* Password Change Section */}
          <div className="border-t border-gray-200 pt-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium text-gray-900">Security</h3>
              <button
                onClick={() => {
                  if (!showPasswordForm) {
                    // Clear all errors and messages when opening the form
                    setErrors({});
                    setMessage({ type: '', text: '' });
                    setCurrentPasswordValidated(false);
                  }
                  setShowPasswordForm(!showPasswordForm);
                }}
                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
              >
                {showPasswordForm ? 'Cancel' : 'Change Password'}
              </button>
            </div>

            {showPasswordForm && (
              <div className="bg-gray-50 rounded-lg p-4">
                <form onSubmit={handlePasswordSubmit} className="space-y-4">
                  {/* Current Password */}
                  <div>
                    <label htmlFor="currentPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Current Password
                    </label>
                    <input
                      type="password"
                      id="currentPassword"
                      name="currentPassword"
                      value={passwordData.currentPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.currentPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your current password"
                    />
                    {errors.currentPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.currentPassword}</p>
                    )}
                  </div>

                  {/* New Password */}
                  <div>
                    <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      New Password
                    </label>
                    <input
                      type="password"
                      id="newPassword"
                      name="newPassword"
                      value={passwordData.newPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.newPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your new password"
                    />
                    {errors.newPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>
                    )}
                  </div>

                  {/* Confirm New Password */}
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      id="confirmPassword"
                      name="confirmPassword"
                      value={passwordData.confirmPassword}
                      onChange={handlePasswordChange}
                      className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Confirm your new password"
                    />
                    {errors.confirmPassword && (
                      <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
                    )}
                  </div>

                  {/* Message Display */}
                  {message.text && (
                    <div className={`p-3 rounded-md ${
                      message.type === 'success' 
                        ? 'bg-green-50 text-green-800 border border-green-200' 
                        : 'bg-red-50 text-red-800 border border-red-200'
                    }`}>
                      {message.text}
                    </div>
                  )}

                  {/* Submit Button */}
                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowPasswordForm(false);
                        setPasswordData({
                          currentPassword: '',
                          newPassword: '',
                          confirmPassword: ''
                        });
                        setErrors({});
                        setMessage({ type: '', text: '' });
                        setCurrentPasswordValidated(false);
                      }}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !isFormValid()}
                      className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 disabled:bg-blue-400 disabled:cursor-not-allowed relative group"
                      title={!isFormValid() ? 'Please fix all validation errors before submitting' : ''}
                    >
                      {loading ? 'Changing Password...' : 'Change Password'}
                      
                      {/* Tooltip for disabled state */}
                      {!isFormValid() && (
                        <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-3 py-2 bg-gray-800 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-10">
                          Please fix all validation errors
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-800"></div>
                        </div>
                      )}
                    </button>
                  </div>
                </form>

                {/* Password Requirements */}
                <div className="mt-4 p-3 bg-white rounded-md border border-gray-200">
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="text-sm font-medium text-gray-700">Password Requirements:</h4>
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">Progress:</span>
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        getPasswordRequirements().filter(r => r.isValid).length === getPasswordRequirements().length
                          ? 'bg-green-100 text-green-700'
                          : 'bg-blue-100 text-blue-700'
                      }`}>
                        {getPasswordRequirements().filter(r => r.isValid).length}/{getPasswordRequirements().length}
                      </span>
                    </div>
                  </div>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div 
                      className={`h-2 rounded-full transition-all duration-300 ease-in-out ${
                        getPasswordRequirements().filter(r => r.isValid).length === getPasswordRequirements().length
                          ? 'bg-green-500'
                          : 'bg-blue-600'
                      }`}
                      style={{ 
                        width: `${(getPasswordRequirements().filter(r => r.isValid).length / getPasswordRequirements().length) * 100}%` 
                      }}
                    ></div>
                  </div>
                  
                  {/* Completion Message */}
                  {getPasswordRequirements().filter(r => r.isValid).length === getPasswordRequirements().length && (
                    <div className="mb-3 p-2 bg-green-100 border border-green-300 rounded-md">
                      <div className="flex items-center space-x-2">
                        <span className="text-green-600 text-lg">🎉</span>
                        <span className="text-sm font-medium text-green-700">
                          All password requirements met! You can now submit the form.
                        </span>
                      </div>
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    {getPasswordRequirements().map((requirement) => (
                      <div 
                        key={requirement.key} 
                        className={`flex items-center space-x-2 p-2 rounded-md transition-all duration-200 ${
                          requirement.isError
                            ? 'bg-red-50 border border-red-200'
                            : requirement.isPending
                              ? 'bg-yellow-50 border border-yellow-200'
                              : requirement.isValid 
                                ? 'bg-green-50 border border-green-200' 
                                : 'bg-red-50 border border-red-200'
                        }`}
                      >
                        <span className={`text-lg font-bold ${
                          requirement.isError
                            ? 'text-red-500'
                            : requirement.isPending
                              ? 'text-yellow-500'
                              : requirement.isValid 
                                ? 'text-green-500' 
                                : 'text-red-500'
                        }`}>
                          {requirement.isError ? '✗' : requirement.isPending ? '⏳' : requirement.isValid ? '✓' : '✗'}
                        </span>
                        <span className={`text-sm font-medium ${
                          requirement.isError
                            ? 'text-red-700'
                            : requirement.isPending
                              ? 'text-yellow-700'
                              : requirement.isValid 
                                ? 'text-green-700' 
                                : 'text-red-700'
                        }`}>
                          {requirement.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile; 