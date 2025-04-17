import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { useState, useEffect } from 'react';
import { getUserProfile } from '../utils/api';

const ProtectedRoute = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const location = useLocation();

  useEffect(() => {
    const validateSession = async () => {
      const token = localStorage.getItem('token');
      const userStr = localStorage.getItem('user');

      if (!token || !userStr) {
        setIsAuthenticated(false);
        setIsLoading(false);
        return;
      }

      try {
        // Verify token by making an API call
        const profile = await getUserProfile();
        const user = JSON.parse(userStr);

        if (profile && user) {
          setIsAuthenticated(true);
          setUserRole(user.role);
        } else {
          // Clear invalid session
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setIsAuthenticated(false);
        }
      } catch (error) {
        console.error('Session validation failed:', error);
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
      }

      setIsLoading(false);
    };

    validateSession();
  }, []);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: 'white',
        color: '#666'
      }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  const isGymOwnerRoute = location.pathname.startsWith('/gym-owner-dashboard');
  const isUserRoute = location.pathname.startsWith('/dashboard');

  // Redirect admin to gym owner dashboard if they try to access user dashboard
  if (userRole === 'admin' && isUserRoute) {
    return <Navigate to="/gym-owner-dashboard" replace />;
  }

  // Redirect regular users to user dashboard if they try to access gym owner dashboard
  if (userRole !== 'admin' && isGymOwnerRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
