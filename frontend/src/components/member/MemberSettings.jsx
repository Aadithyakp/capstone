import { useState, useEffect } from 'react';
import { getUserProfile, updateMemberProfile, changePassword } from '../../utils/api';
import styles from './MemberSettings.module.css';

export default function MemberSettings() {

  const [loading, setLoading] = useState(true);
  const [profileError, setProfileError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  // Profile form state
  const [profileForm, setProfileForm] = useState({
    name: '',
    email: ''
  });

  // Password form state
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        const data = await getUserProfile();
        setProfileForm({
          name: data.full_name || '',
          email: data.email || ''
        });
      } catch {
        setProfileError('Failed to load user data');
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      await updateMemberProfile(profileForm);
      setProfileForm({
        name: profileForm.name,
        email: profileForm.email
      });
      setSuccessMessage('Profile updated successfully');
      setProfileError('');
    } catch (error) {
      setProfileError(error.message || 'Failed to update profile');
      setSuccessMessage('');
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess('');

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    if (passwordForm.newPassword.length < 6) {
      setPasswordError('Password must be at least 6 characters long');
      return;
    }

    try {
      await changePassword(passwordForm.currentPassword, passwordForm.newPassword);
      setPasswordSuccess('Password changed successfully');
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
      });
    } catch (error) {
      setPasswordError(error.message || 'Failed to change password');
    }
  };

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.settingsContainer}>
      <section className={styles.section}>
        <h2>Profile Settings</h2>
        <form onSubmit={handleProfileSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Name</label>
            <input
              id="name"
              type="text"
              value={profileForm.name}
              onChange={(e) => setProfileForm(prev => ({
                ...prev,
                name: e.target.value
              }))}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="email">Email</label>
            <input
              id="email"
              type="email"
              value={profileForm.email}
              onChange={(e) => setProfileForm(prev => ({
                ...prev,
                email: e.target.value
              }))}
              className={styles.input}
              required
            />
          </div>



          {profileError && <div className={styles.error}>{profileError}</div>}
          {successMessage && <div className={styles.success}>{successMessage}</div>}

          <button type="submit" className={styles.button}>
            Update Profile
          </button>
        </form>
      </section>

      <section className={styles.section}>
        <h2>Security Settings</h2>
        <form onSubmit={handlePasswordSubmit} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="currentPassword">Current Password</label>
            <input
              id="currentPassword"
              type="password"
              placeholder="Enter your current password"
              value={passwordForm.currentPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                currentPassword: e.target.value
              }))}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="newPassword">New Password</label>
            <input
              id="newPassword"
              type="password"
              placeholder="Enter your new password"
              value={passwordForm.newPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                newPassword: e.target.value
              }))}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="confirmPassword">Confirm New Password</label>
            <input
              id="confirmPassword"
              type="password"
              placeholder="Confirm your new password"
              value={passwordForm.confirmPassword}
              onChange={(e) => setPasswordForm(prev => ({
                ...prev,
                confirmPassword: e.target.value
              }))}
              className={styles.input}
              required
            />
          </div>

          {passwordError && (
            <div className={styles.error}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
              {passwordError}
            </div>
          )}
          {passwordSuccess && (
            <div className={styles.success}>
              <svg xmlns="http://www.w3.org/2000/svg" width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <path d="M20 6L9 17l-5-5"></path>
              </svg>
              {passwordSuccess}
            </div>
          )}

          <button type="submit" className={styles.button}>
            Update Password
          </button>
        </form>
      </section>
    </div>
  );
}
