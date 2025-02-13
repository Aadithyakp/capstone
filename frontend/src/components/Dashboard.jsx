import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { checkAuthStatus, logout } from "../utils/api"; 
import styles from "./Dashboard.module.css";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const authStatus = checkAuthStatus();
    if (!authStatus) {
      navigate("/login", { replace: true });
    } else {
      setUser(authStatus.user);
      setLoading(false);
    }
  }, [navigate]);

   const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  }; 

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.container}>
      {/* Added logo navigation bar */}
      <div className={styles.logo}>
        <Link to="/" className={styles.logoLink}>
          <div className={styles.logoIcon}></div>
          GymPal
        </Link>
      </div>

      <div className={styles.formContainer}>
        <div className={styles.formWrapper}>
          <div className={styles.header}>
            <h1 className={styles.formTitle}>Dashboard</h1>
            <button  onClick={handleLogout}  className={styles.button}>
              Logout
            </button>
          </div>

          <div className={styles.profileSection}>
            <div className={styles.profilePicture}>
              {user?.profile_picture ? (
                <img
                  src={user.profile_picture}
                  alt="Profile"
                  className={styles.profileImage}
                />
              ) : (
                <div className={styles.placeholder}>
                  <svg
                    width="64"
                    height="64"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              )}
            </div>

            <div className={styles.userInfo}>
              <h2 className={styles.userName}>{user?.full_name || "User"}</h2>
              <p className={styles.userEmail}>{user?.email}</p>
            </div>
          </div>

          <div className={styles.content}>
            <p>
              Welcome back to your dashboard <b>{user?.full_name || "User"}</b>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}