const API_URL = 'http://localhost:5000/api';

// Enhanced response handler with better error handling and logging
const handleResponse = async (response) => {
  console.log('Raw response:', {
    status: response.status,
    statusText: response.statusText,
    headers: Object.fromEntries(response.headers)
  });

  let data;
  try {
    const textResponse = await response.text();
    console.log('Raw response text:', textResponse);
    
    try {
      data = JSON.parse(textResponse);
    } catch (e) {
      console.error('JSON parsing error:', e);
      throw new Error(`Invalid JSON response: ${textResponse.substring(0, 100)}...`);
    }
  } catch (error) {
    console.error('Response parsing error:', error);
    throw new Error('Failed to parse server response');
  }

  console.log('Parsed response data:', data);

  if (!response.ok) {
    if (response.status === 401) {
      // Clear token on authentication failure
      localStorage.removeItem('token');
      throw new Error('Unauthorized - Please log in again');
    }
    if (response.status === 403) {
      throw new Error('Forbidden - You do not have permission to access this resource');
    }
    if (response.status === 404) {
      if (data.message?.includes('gym')) {
        throw new Error('No gym found');
      }
      throw new Error('Not found');
    }
    throw new Error(data.message || `Server error: ${response.status}`);
  }

  return data;
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
  console.log('Registering user:', userData);
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
  console.log('Logging in user:', credentials);
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

export const getUserProfile = async (userId, token) => {
  if (!userId) {
    throw new Error('User ID is required');
  }
  
  console.log('Fetching user profile:', { 
    userId, 
    hasToken: !!token,
    url: `${API_URL}/users/${userId}`
  });

  try {
    const headers = getAuthHeader(token);
    console.log('Request headers:', headers);

    const response = await fetch(`${API_URL}/users/${userId}`, {
      method: 'GET',
      headers: headers
    });

    return handleResponse(response);
  } catch (error) {
    console.error('Get profile error:', {
      message: error.message,
      status: error.status,
      stack: error.stack
    });
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