import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './MemberDashboard.module.css';
import { logout, getUserProfile } from '../../utils/api';
import MemberSettings from './MemberSettings';
import BookClasses from './BookClasses';
import DashboardHeader from './components/DashboardHeader';
import TabNavigation from './components/TabNavigation';
import Overview from './components/Overview';

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

  return (
    <div className={styles.dashboard}>
      <DashboardHeader 
        userData={userData}
        onSettingsClick={() => setActiveTab('settings')}
        onLogout={handleLogout}
      />

      <TabNavigation 
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />

      <main className={styles.mainContent}>
        {activeTab === 'overview' && (
          <Overview 
            userData={userData}
            enrolledClasses={enrolledClasses}
            upcomingClasses={upcomingClasses}
            recentActivities={recentActivities}
          />
        )}
        {activeTab === 'book' && <BookClasses />}
        {activeTab === 'settings' && <MemberSettings />}
      </main>
    </div>
  );
}
