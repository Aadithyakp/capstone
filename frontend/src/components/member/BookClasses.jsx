import { useState, useEffect, useCallback, useMemo } from 'react';
import { getAllGyms, getGymClasses, enrollInClass, cancelEnrollment } from '../../utils/api';
import styles from './BookClasses.module.css';

export default function BookClasses() {
  const [searchQuery, setSearchQuery] = useState('');
  const [allGyms, setAllGyms] = useState([]);
  const [selectedGym, setSelectedGym] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [enrollmentStatus, setEnrollmentStatus] = useState({});
  const [enrollmentError, setEnrollmentError] = useState('');

  // Memoized filtered gyms
  const filteredGyms = useMemo(() => {
    if (!searchQuery.trim()) return allGyms;
    return allGyms.filter(gym => 
      gym.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      gym.address?.city?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [allGyms, searchQuery]);

  const formatSchedule = useCallback((schedule) => {
    if (!schedule) return 'Schedule not available';
    const day = schedule.dayOfWeek.charAt(0).toUpperCase() + schedule.dayOfWeek.slice(1);
    return `${day} at ${schedule.startTime}-${schedule.endTime}`;
  }, []);

  const formatLevel = useCallback((level) => {
    if (!level) return 'All levels';
    return level.charAt(0).toUpperCase() + level.slice(1);
  }, []);

  const formatAddress = useCallback((address) => {
    if (!address) return 'Address not available';
    const { street, city, state, zipCode } = address;
    return [street, city, state, zipCode].filter(Boolean).join(', ');
  }, []);

  const formatContact = useCallback((contact) => {
    if (!contact) return [];
    return [contact.phone, contact.email].filter(Boolean);
  }, []);

  // Fetch gyms data
  const fetchGyms = useCallback(async () => {
    try {
      setLoading(true);
      const gymsResponse = await getAllGyms();
      setAllGyms(gymsResponse);
      setError('');
    } catch (error) {
      console.error('Failed to load gyms:', error);
      setError('Failed to load gyms');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchGyms();
  }, [fetchGyms]);

  // Reset error when selecting a new gym
  const handleGymSelect = useCallback(async (gym) => {
    try {
      setSelectedGym(gym);
      setEnrollmentError('');
      const classesData = await getGymClasses(gym._id);
      
      // Initialize enrollment status based on isEnrolled flag
      const initialStatus = {};
      classesData.forEach(classItem => {
        initialStatus[classItem._id] = classItem.isEnrolled ? 'enrolled' : '';
      });
      setEnrollmentStatus(initialStatus);
      setClasses(classesData);
    } catch (error) {
      console.error('Failed to fetch gym classes:', error);
      setError('Failed to fetch gym classes');
    }
  }, []);

  const handleEnroll = useCallback(async (gymId, classId) => {
    try {
      setEnrollmentError('');
      const response = await enrollInClass(gymId, classId);
      setEnrollmentStatus(prev => ({
        ...prev,
        [classId]: response.enrollmentStatus
      }));
      // Refresh class data after enrollment
      const updatedClasses = await getGymClasses(gymId);
      setClasses(updatedClasses);
    } catch (error) {
      console.error('Failed to enroll in class:', error);
      setEnrollmentError(error.message || 'Failed to enroll in class');
    }
  }, []);

  const handleCancelEnrollment = useCallback(async (gymId, classId) => {
    try {
      setEnrollmentError('');
      await cancelEnrollment(gymId, classId);
      setEnrollmentStatus(prev => ({
        ...prev,
        [classId]: ''
      }));
      // Refresh class data after cancellation
      const updatedClasses = await getGymClasses(gymId);
      setClasses(updatedClasses);
    } catch (error) {
      console.error('Failed to cancel enrollment:', error);
      setEnrollmentError(error.message || 'Failed to cancel enrollment');
    }
  }, []);

  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  return (
    <div className={styles.bookClassesContainer}>
      <div className={styles.searchSection}>
        <input
          type="text"
          placeholder="Search gyms by name or location..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.content}>
        <div className={styles.gymsSection}>
          <h2>Available Gyms</h2>
          {error && <div className={styles.error}>{error}</div>}
          <div className={styles.gymList}>
            {filteredGyms.length === 0 ? (
              <div className={styles.noGyms}>No gyms found.</div>
            ) : (
              filteredGyms.map(gym => (
                <div
                  key={gym._id}
                  className={`${styles.gymCard} ${selectedGym?._id === gym._id ? styles.selected : ''}`}
                  onClick={() => handleGymSelect(gym)}
                >
                  <div className={styles.gymHeader}>
                    <h3>{gym.name}</h3>
                    <div className={styles.rating}>★ {gym.rating || '4.5'}</div>
                  </div>
                  <div className={styles.gymDetails}>
                    <p>{gym.description || 'No description available'}</p>
                    <p className={styles.gymAddress}>
                      {formatAddress(gym.address)}
                    </p>
                    <p className={styles.gymContact}>
                      {formatContact(gym.contact).map((info, index) => (
                        <span key={index}>{info}</span>
                      ))}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {selectedGym && (
          <div className={styles.classesSection}>
            <div className={styles.sectionHeader}>
              <h2>Available Classes at {selectedGym.name}</h2>
              {enrollmentError && (
                <div className={styles.enrollmentError}>
                  {enrollmentError}
                </div>
              )}
            </div>
            <div className={styles.classGrid}>
              {classes.length === 0 ? (
                <div className={styles.noClasses}>No classes available at this gym.</div>
              ) : (
                classes.map(classItem => (
                  <div key={classItem._id} className={styles.classCard}>
                    <div className={styles.classHeader}>
                      <h3>{classItem.name}</h3>
                      <span className={styles.classType}>{classItem.type}</span>
                    </div>
                    <div className={styles.classInfo}>
                      <strong>Schedule:</strong>
                      <span>{formatSchedule(classItem.schedule)}</span>
                      <strong>Instructor:</strong>
                      <span>{classItem.instructor || 'Not assigned'}</span>
                      <strong>Level:</strong>
                      <span>{formatLevel(classItem.level)}</span>
                      <strong>Capacity:</strong>
                      <span>{classItem.enrolledMembers?.length || 0}/{classItem.capacity}</span>
                    </div>
                    <button
                      className={styles.enrollButton}
                      onClick={() => handleEnroll(selectedGym._id, classItem._id)}
                      disabled={
                        classItem.isEnrolled || 
                        enrollmentStatus[classItem._id] === 'enrolled' || 
                        (classItem.enrolledMembers?.length || 0) >= classItem.capacity ||
                        classItem.status !== 'active'
                      }
                      data-status={
                        classItem.isEnrolled || enrollmentStatus[classItem._id] === 'enrolled'
                          ? 'enrolled'
                          : (classItem.enrolledMembers?.length || 0) >= classItem.capacity
                            ? 'full'
                            : classItem.status !== 'active'
                              ? 'unavailable'
                              : ''
                      }
                    >
                      {classItem.isEnrolled || enrollmentStatus[classItem._id] === 'enrolled'
                        ? 'Enrolled' 
                        : (classItem.enrolledMembers?.length || 0) >= classItem.capacity 
                          ? 'Class Full' 
                          : classItem.status !== 'active'
                            ? 'Class Unavailable'
                            : 'Enroll Now'}
                    </button>
                    {enrollmentStatus[classItem._id] === 'enrolled' && (
                      <button
                        className={styles.cancelButton}
                        onClick={() => handleCancelEnrollment(selectedGym._id, classItem._id)}
                      >
                        Cancel Enrollment
                      </button>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
