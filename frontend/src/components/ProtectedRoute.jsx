import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  const location = useLocation();

  if (!token || !userStr) {
    return <Navigate to="/login" replace />;
  }

  const user = JSON.parse(userStr);
  const isGymOwnerRoute = location.pathname.startsWith('/gym-owner-dashboard');
  const isUserRoute = location.pathname.startsWith('/dashboard');

  // Redirect admin to gym owner dashboard if they try to access user dashboard
  if (user.role === 'admin' && isUserRoute) {
    return <Navigate to="/gym-owner-dashboard" replace />;
  }

  // Redirect regular users to user dashboard if they try to access gym owner dashboard
  if (user.role !== 'admin' && isGymOwnerRoute) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
};

export default ProtectedRoute;
