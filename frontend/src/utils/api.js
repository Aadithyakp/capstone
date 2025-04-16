const API_URL = 'https://capstone-31d0.onrender.com';

const getToken = () => localStorage.getItem('token');

// Optimized response handler with minimal logging
const handleResponse = async (response) => { 
  try {
    const data = await response.json();
    
    if (!response.ok) {
      if (response.status === 401) {
        localStorage.removeItem('token');
        throw new Error('Unauthorized - Please log in again');
      }
      if (response.status === 403) {
        throw new Error('Forbidden - You do not have permission');
      }
      if (response.status === 404) {
        throw new Error(data.message || 'Resource not found');
      }
      throw new Error(data.message || `Server error: ${response.status}`);
    }

    return data;
  } catch (error) {
    if (error.name === 'SyntaxError') {
      throw new Error('Invalid server response');
    }
    throw error;
  }
};

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  if (!token) {
    throw new Error('No authentication token found - Please log in');
  }
  return {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
};

// Auth APIs
export const register = async (userData) => {
  try {
    const response = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Registration error:', error);
    throw error;
  }
};

export const login = async (credentials) => {
  try {
    const response = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(credentials),
    });
    const data = await handleResponse(response);
    if (data.token) {
      localStorage.setItem('token', data.token);
    }
    return data;
  } catch (error) {
    console.error('Login error:', error);
    throw error;
  }
};

export const getUserProfile = async () => {
  try {
    const response = await fetch(`${API_URL}/users/profile`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch user profile');
    }

    return await response.json();
  } catch (error) {
    console.error('Get profile error:', error);
    throw error;
  }
};

export const updateUserProfile = async (userId, userData, token) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  console.log('Updating user profile:', { 
    userId, 
    userData, 
    hasToken: !!token 
  });

  try {
    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'PUT',
      headers: getAuthHeader(token),
      body: JSON.stringify(userData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Update profile error:', {
      message: error.message,
      stack: error.stack
    });
    throw error;
  }
};

// User Management APIs
export const getInstructors = async () => {
  console.log('Fetching instructors');
  try {
    const response = await fetch(`${API_URL}/users/instructors`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get instructors error:', error);
    throw error;
  }
};

// Gym Management APIs
export const createGym = async (gymData) => {
  try {
    const token = localStorage.getItem('token');
    const response = await fetch(`${API_URL}/gyms`, {
      method: 'POST',
      headers: {
        ...getAuthHeader(token),
      },
      body: JSON.stringify(gymData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Create gym error:', error);
    throw new Error(error.message || 'Failed to create gym');
  }
};

export const getGymByOwner = async () => {
  console.log('Fetching gym for owner');
  try {
    const response = await fetch(`${API_URL}/gyms/owner`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get gym error:', error);
    throw error;
  }
};

export const updateGym = async (gymId, gymData) => {
  console.log('Updating gym:', { gymId, gymData });
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(gymData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Update gym error:', error);
    throw error;
  }
};

// Class Management APIs
export const createClass = async (gymId, classData) => {
  console.log('Creating class:', { gymId, classData });
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}/classes`, {
      method: 'POST',
      headers: getAuthHeader(),
      body: JSON.stringify(classData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Create class error:', error);
    throw error;
  }
};

export const getGymClasses = async (gymId) => {
  console.log('Fetching classes for gym:', gymId);
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}/classes`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get classes error:', error);
    throw error;
  }
};

export const updateClass = async (gymId, classId, classData) => {
  console.log('Updating class:', { gymId, classId, classData });
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}/classes/${classId}`, {
      method: 'PUT',
      headers: getAuthHeader(),
      body: JSON.stringify(classData),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Update class error:', error);
    throw error;
  }
};

export const deleteClass = async (gymId, classId) => {
  console.log('Deleting class:', { gymId, classId });
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}/classes/${classId}`, {
      method: 'DELETE',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Delete class error:', error);
    throw error;
  }
};

// Member Dashboard API Functions
export const searchGyms = async (query) => {
  try {
    const response = await fetch(`${API_URL}/gyms/search?q=${encodeURIComponent(query)}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to search gyms');
    }

    return await response.json();
  } catch (error) {
    console.error('Error searching gyms:', error);
    throw error;
  }
};

export const enrollInClass = async (gymId, classId) => {
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}/classes/${classId}/enroll`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || 'Failed to enroll in class');
    }

    return data;
  } catch (error) {
    console.error('Error enrolling in class:', error);
    throw error;
  }
};

export const cancelEnrollment = async (gymId, classId) => {
  console.log('Canceling class enrollment:', { gymId, classId });
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}/classes/${classId}/cancel`, {
      method: 'POST',
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Cancel enrollment error:', error);
    throw error;
  }
};

export const getAllGyms = async () => {
  try {
    const response = await fetch(`${API_URL}/gyms`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch gyms');
    }

    return await response.json();
  } catch (error) {
    console.error('Error fetching gyms:', error);
    throw error;
  }
};

// Get gym members
export const getGymMembers = async (gymId) => {
  console.log('Fetching gym members:', gymId);
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}/members`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get gym members error:', error);
    throw error;
  }
};

// Get member details
export const getMemberDetails = async (gymId, memberId) => {
  console.log('Fetching member details:', { gymId, memberId });
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}/members/${memberId}`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Get member details error:', error);
    throw error;
  }
};

// Utility functions
export const checkAuthStatus = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const response = await fetch(`${API_URL}/auth/me`, {
      headers: getAuthHeader(),
    });
    return handleResponse(response);
  } catch (error) {
    console.error('Auth status check error:', error);
    localStorage.removeItem('token');
    return null;
  }
};

export const logout = () => {
  localStorage.removeItem('token');
  window.location.href = '/';
};

export const updateUserStatus = async (status, plan) => {
  try {
    const response = await fetch(`${API_URL}/users/status`, {
      method: 'PATCH',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ status, plan })
    });

    if (!response.ok) {
      throw new Error('Failed to update user status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating user status:', error);
    throw error;
  }
};

export const updateMemberStatus = async (gymId, memberId, status) => {
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}/members/${memberId}/status`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ status })
    });

    if (!response.ok) {
      throw new Error('Failed to update member status');
    }

    return await response.json();
  } catch (error) {
    console.error('Error updating member status:', error);
    throw error;
  }
};

export const updateMemberPlan = async (gymId, memberId, plan) => {
  try {
    const response = await fetch(`${API_URL}/gyms/${gymId}/members/${memberId}/plan`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ plan })
    });

    if (!response.ok) {
      throw new Error('Failed to update member plan');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating member plan:', error);
    throw error;
  }
};

export const updateMemberProfile = async (memberData) => {
    const response = await fetch(`${API_URL}/users/update-profile`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getToken()}`
      },
      body: JSON.stringify(memberData)
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to update profile');
    }

    return await response.json();
};

export const changePassword = async (currentPassword, newPassword) => {
  try {
    const response = await fetch(`${API_URL}/users/change-password`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      },
      body: JSON.stringify({ currentPassword, newPassword })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to change password');
    }

    return await response.json();
  } catch (error) {
    console.error('Error changing password:', error);
    throw error;
  }
};
