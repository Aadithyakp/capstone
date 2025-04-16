import PropTypes from 'prop-types';
import styles from './components.module.css';

export default function TabNavigation({ activeTab, onTabChange }) {
  return (
    <nav className={styles.tabNav}>
      <button
        className={`${styles.tabButton} ${activeTab === 'overview' ? styles.active : ''}`}
        onClick={() => onTabChange('overview')}
      >
        Overview
      </button>
      <button
        className={`${styles.tabButton} ${activeTab === 'book' ? styles.active : ''}`}
        onClick={() => onTabChange('book')}
      >
        Book Classes
      </button>
    </nav>
  );
}

TabNavigation.propTypes = {
  activeTab: PropTypes.string.isRequired,
  onTabChange: PropTypes.func.isRequired
};
