import PropTypes from 'prop-types';
import styles from './components.module.css';
import defaultAvatar from '../../../assets/images/default-avatar.png';

export default function DashboardHeader({ userData, onSettingsClick, onLogout }) {
  return (
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
        <button onClick={onSettingsClick} className={styles.secondaryButton}>
          Settings
        </button>
        <button onClick={onLogout} className={styles.primaryButton}>
          Logout
        </button>
      </div>
    </header>
  );
}

DashboardHeader.propTypes = {
  userData: PropTypes.shape({
    full_name: PropTypes.string,
    plan: PropTypes.string
  }),
  onSettingsClick: PropTypes.func.isRequired,
  onLogout: PropTypes.func.isRequired
};
