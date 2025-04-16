import PropTypes from 'prop-types';
import styles from './components.module.css';

export default function Overview({ userData, enrolledClasses, upcomingClasses, recentActivities }) {
  return (
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
}

Overview.propTypes = {
  userData: PropTypes.shape({
    plan: PropTypes.string,
    status: PropTypes.string
  }),
  enrolledClasses: PropTypes.array.isRequired,
  upcomingClasses: PropTypes.array.isRequired,
  recentActivities: PropTypes.array.isRequired
};
