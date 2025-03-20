import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthStatus } from "../utils/api";
import GymOwnerDashboard from "./gym-owner/GymOwnerDashboard";
import MemberDashboard from "./member/MemberDashboard";

export default function Dashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem('user'));

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const authStatus = await checkAuthStatus();
        if (!authStatus) {
          navigate("/login", { replace: true });
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        navigate("/login", { replace: true });
      }
    };

    checkAuth();
  }, [navigate]);

  useEffect(() => {
    if (user && !['user', 'gym_owner'].includes(user.role)) {
      console.error('Unknown user role:', user.role);
      navigate("/login", { replace: true });
    }
  }, [user, navigate]);

  if (!user) {
    return null;
  }

  // Regular users and members use the MemberDashboard
  if (user.role === 'user' || user.role === 'member') {
    return <MemberDashboard />;
  }

  // Gym owners use the GymOwnerDashboard
  if (user.role === 'gym_owner') {
    return <GymOwnerDashboard />;
  }

  return null; // Will redirect in useEffect for unknown roles
}