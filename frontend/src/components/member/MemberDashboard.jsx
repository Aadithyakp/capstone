import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MemberDashboard.module.css';
import { logout, getUserProfile } from '../../utils/api';
import defaultAvatar from '../../assets/images/default-avatar.png';
import MemberSettings from './MemberSettings';
import BookClasses from './BookClasses';

export default function MemberDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [upcomingClasses, setUpcomingClasses] = useState([]);
  const [recentActivities, setRecentActivities] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const profile = await getUserProfile();
        setUserData(profile);

        // Mock data for demonstration
        setEnrolledClasses([
          { id: 1, name: 'Yoga', schedule: 'Monday 10:00 AM' },
          { id: 2, name: 'HIIT', schedule: 'Wednesday 5:00 PM' }
        ]);

        setUpcomingClasses([
          { id: 3, name: 'Pilates', schedule: 'Friday 2:00 PM' },
          { id: 4, name: 'Zumba', schedule: 'Saturday 11:00 AM' }
        ]);

        setRecentActivities([
          'Enrolled in Yoga class',
          'Completed HIIT workout',
          'Updated profile information'
        ]);

        setLoading(false);
      } catch (error) {
        console.error('Failed to load user data:', error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (userData?.status !== 'active') {
    return (
      <div className={styles.subscriptionExpired}>
        <h2>Subscription Expired</h2>
        <p>Please renew your subscription to continue accessing the gym facilities.</p>
        <button 
          className={styles.renewButton}
          onClick={() => navigate('/payment')}
        >
          Renew Now
        </button>
      </div>
    );
  }

  const renderOverview = () => (
    <div className={styles.overview}>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <h3>Enrolled Classes</h3>
          <p className={styles.statNumber}>{enrolledClasses.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Upcoming Classes</h3>
          <p className={styles.statNumber}>{upcomingClasses.length}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Membership</h3>
          <p className={styles.statText}>{userData?.plan === 'premium' ? 'Premium' : 'Free'}</p>
        </div>
        <div className={styles.statCard}>
          <h3>Status</h3>
          <p className={styles.statText}>{userData?.status === 'active' ? 'Active' : 'Inactive'}</p>
        </div>
      </div>

      <div className={styles.recentActivity}>
        <h2>Recent Activity</h2>
        {recentActivities.length === 0 ? (
          <p className={styles.noActivity}>No recent activities</p>
        ) : (
          <div className={styles.activityList}>
            {recentActivities.map((activity, index) => (
              <div key={index} className={styles.activityItem}>
                <span className={styles.activityIcon}>•</span>
                <span className={styles.activityText}>{activity}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1 className={styles.title}>Member Dashboard</h1>
        <div className={styles.headerRight}>
          <div className={styles.userInfo}>
            <img
              src={defaultAvatar}
              alt="Profile"
              className={styles.avatar}
            />
            <div className={styles.userDetails}>
              <span>Welcome, {userData?.full_name || 'Member'}!</span>
              <span className={styles.memberType}>
                {userData?.plan === 'premium' ? 'Premium' : 'Free'} Member
              </span>
            </div>
          </div>
          <button onClick={() => setActiveTab('settings')} className={styles.settingsButton}>
            Settings
          </button>
          <button onClick={handleLogout} className={styles.logoutButton}>
            Logout
          </button>
        </div>
      </header>

      <nav className={styles.tabNav}>
        <button
          className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.tabButton} ${activeTab === 'book' ? styles.active : ''}`}
          onClick={() => setActiveTab('book')}
        >
          Book Classes
        </button>
      </nav>

      <main className={styles.mainContent}>
        {activeTab === 'overview' && renderOverview()}
        {activeTab === 'book' && <BookClasses />}
        {activeTab === 'settings' && <MemberSettings onNavigate={setActiveTab} />}
      </main>
    </div>
  );
}
