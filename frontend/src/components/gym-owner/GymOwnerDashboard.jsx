import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGymByOwner, getGymClasses, createClass, updateClass, deleteClass, updateGym, createGym, logout } from '../../utils/api';
import styles from './GymOwnerDashboard.module.css';

export default function GymOwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [gymData, setGymData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClassForm, setShowClassForm] = useState(false);
  const [showGymForm, setShowGymForm] = useState(false);
  const [gymFormData, setGymFormData] = useState({
    name: '',
    description: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: ''
    },
    contact: {
      email: '',
      phone: ''
    },
    facilities: [],
    operatingHours: {
      monday: { open: '06:00', close: '22:00' },
      tuesday: { open: '06:00', close: '22:00' },
      wednesday: { open: '06:00', close: '22:00' },
      thursday: { open: '06:00', close: '22:00' },
      friday: { open: '06:00', close: '22:00' },
      saturday: { open: '08:00', close: '20:00' },
      sunday: { open: '08:00', close: '20:00' }
    }
  });

  const [classFormData, setClassFormData] = useState({
    name: '',
    description: '',
    type: 'Yoga',
    instructor: '', 
    schedule: {
      dayOfWeek: 'monday',
      startTime: '09:00',
      endTime: '10:00'
    },
    capacity: 20,
    level: 'beginner'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const gymResponse = await getGymByOwner();
      setGymData(gymResponse);

      if (gymResponse._id) {
        const classesResponse = await getGymClasses(gymResponse._id);
        setClasses(classesResponse);
      }
    } catch (err) {
      if (err.message === 'No gym found') {
        setShowGymForm(true);
      } else {
        setError('Failed to load dashboard data');
      }
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateGym = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const newGym = await createGym(gymFormData);
      setGymData(newGym);
      setShowGymForm(false);
      setError('');
    } catch (err) {
      setError(err.message || 'Failed to create gym');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGymFormChange = (e) => {
    const { name, value } = e.target;
    
    // Handle nested fields
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setGymFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setGymFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleCreateClass = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      // Get the current user's ID from localStorage
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || !user._id) {
        throw new Error('User information not found');
      }

      const classData = {
        ...classFormData,
        instructor: user._id // Set the instructor to the current user
      };

      const newClass = await createClass(gymData._id, classData);
      setClasses(prev => [...prev, newClass]);
      setShowClassForm(false);
      setError('');
      
      // Reset form data
      setClassFormData({
        name: '',
        description: '',
        type: 'Yoga',
        instructor: '',
        schedule: {
          dayOfWeek: 'monday',
          startTime: '09:00',
          endTime: '10:00'
        },
        capacity: 20,
        level: 'beginner'
      });
    } catch (err) {
      setError(err.message || 'Failed to create class');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleClassFormChange = (e) => {
    const { name, value } = e.target;
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setClassFormData(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setClassFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  const handleUpdateGym = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const updatedGym = await updateGym(gymData._id, gymData);
      setGymData(updatedGym);
      setError('');
    } catch (err) {
      setError('Failed to update gym settings');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Are you sure you want to delete this class?')) {
      try {
        setLoading(true);
        await deleteClass(gymData._id, classId);
        await fetchData(); // Refresh data
      } catch (err) {
        setError('Failed to delete class');
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
  };



  if (loading) {
    return <div className={styles.loading}>Loading...</div>;
  }

  if (showGymForm) {
    return (
      <div className={styles.container}>
        <h1>Create Your Gym</h1>
        {error && <div className={styles.error}>{error}</div>}
        <form onSubmit={handleCreateGym} className={styles.form}>
          <div className={styles.formGroup}>
            <label htmlFor="name">Gym Name</label>
            <input
              type="text"
              id="name"
              name="name"
              value={gymFormData.name}
              onChange={handleGymFormChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={gymFormData.description}
              onChange={handleGymFormChange}
              required
            />
          </div>

          <h3>Address</h3>
          <div className={styles.formGroup}>
            <label htmlFor="address.street">Street Address</label>
            <input
              type="text"
              id="address.street"
              name="address.street"
              value={gymFormData.address.street}
              onChange={handleGymFormChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address.city">City</label>
            <input
              type="text"
              id="address.city"
              name="address.city"
              value={gymFormData.address.city}
              onChange={handleGymFormChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address.state">State</label>
            <input
              type="text"
              id="address.state"
              name="address.state"
              value={gymFormData.address.state}
              onChange={handleGymFormChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="address.zipCode">ZIP Code</label>
            <input
              type="text"
              id="address.zipCode"
              name="address.zipCode"
              value={gymFormData.address.zipCode}
              onChange={handleGymFormChange}
              required
            />
          </div>

          <h3>Contact Information</h3>
          <div className={styles.formGroup}>
            <label htmlFor="contact.email">Contact Email</label>
            <input
              type="email"
              id="contact.email"
              name="contact.email"
              value={gymFormData.contact.email}
              onChange={handleGymFormChange}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label htmlFor="contact.phone">Contact Phone</label>
            <input
              type="tel"
              id="contact.phone"
              name="contact.phone"
              value={gymFormData.contact.phone}
              onChange={handleGymFormChange}
              required
            />
          </div>

          <button type="submit" className={styles.submitButton} disabled={loading}>
            {loading ? 'Creating...' : 'Create Gym'}
          </button>
        </form>
      </div>
    );
  }

  if (error) {
    return <div className={styles.error}>{error}</div>;
  }

  return (
    <div className={styles.dashboard}>
      <header className={styles.header}>
        <h1>Gym Owner Dashboard</h1>
        <div className={styles.userInfo}>
          <span>Welcome back, {gymData?.owner?.name}</span>
          <button className={styles.notificationBtn}>
            <i className="fas fa-bell"></i>
          </button>
          
        </div>
      </header>

      <nav className={styles.navigation}>
        <button
          className={`${styles.navButton} ${activeTab === 'overview' ? styles.active : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'members' ? styles.active : ''}`}
          onClick={() => setActiveTab('members')}
        >
          Members
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'classes' ? styles.active : ''}`}
          onClick={() => setActiveTab('classes')}
        >
          Classes
        </button>
        <button
          className={`${styles.navButton} ${activeTab === 'settings' ? styles.active : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          Settings
        </button>
      </nav>

      <main className={styles.content}>
        {activeTab === 'overview' && (
          <div className={styles.overview}>
            <div className={styles.statsGrid}>
              <div className={styles.statCard}>
                <h3>Total Members</h3>
                <p className={styles.statNumber}>{gymData?.memberCount || 0}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Active Classes</h3>
                <p className={styles.statNumber}>{classes.length}</p>
              </div>
              <div className={styles.statCard}>
                <h3>Total Revenue</h3>
                <p className={styles.statNumber}>${gymData?.revenue || 0}</p>
              </div>
            </div>

            <div className={styles.upcomingClasses}>
              <h2>Today's Classes</h2>
              <div className={styles.classGrid}>
                {classes.filter(c => {
                  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  const today = days[new Date().getDay()];
                  return c.schedule.dayOfWeek === today;
                }).map((classItem) => (
                  <div key={classItem._id} className={styles.classCard}>
                    <h3>{classItem.name}</h3>
                    <p>{classItem.schedule.startTime} - {classItem.schedule.endTime}</p>
                    <p>{classItem.type} - {classItem.level}</p>
                    <p>{classItem.capacity} spots available</p>
                  </div>
                ))}
                {classes.filter(c => {
                  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                  const today = days[new Date().getDay()];
                  return c.schedule.dayOfWeek === today;
                }).length === 0 && (
                  <p className={styles.noClasses}>No classes scheduled for today</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'classes' && (
          <div className={styles.classes}>
            <div className={styles.actionBar}>
              <button 
                className={styles.addButton}
                onClick={() => setShowClassForm(true)}
              >
                Create New Class
              </button>
            </div>

            {showClassForm && (
              <form onSubmit={handleCreateClass} className={styles.classForm}>
                <div className={styles.formGroup}>
                  <label>Class Name</label>
                  <input
                    type="text"
                    value={classFormData.name}
                    onChange={(e) => setClassFormData(prev => ({
                      ...prev,
                      name: e.target.value
                    }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Description</label>
                  <textarea
                    value={classFormData.description}
                    onChange={(e) => setClassFormData(prev => ({
                      ...prev,
                      description: e.target.value
                    }))}
                    required
                  />
                </div>
                <div className={styles.formGroup}>
                  <label>Type</label>
                  <select
                    value={classFormData.type}
                    onChange={(e) => setClassFormData(prev => ({
                      ...prev,
                      type: e.target.value
                    }))}
                  >
                    <option value="Yoga">Yoga</option>
                    <option value="HIIT">HIIT</option>
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Pilates">Pilates</option>
                  </select>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Day</label>
                    <select
                      value={classFormData.schedule.dayOfWeek}
                      onChange={(e) => setClassFormData(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, dayOfWeek: e.target.value }
                      }))}
                    >
                      <option value="monday">Monday</option>
                      <option value="tuesday">Tuesday</option>
                      <option value="wednesday">Wednesday</option>
                      <option value="thursday">Thursday</option>
                      <option value="friday">Friday</option>
                      <option value="saturday">Saturday</option>
                      <option value="sunday">Sunday</option>
                    </select>
                  </div>
                  <div className={styles.formGroup}>
                    <label>Start Time</label>
                    <input
                      type="time"
                      value={classFormData.schedule.startTime}
                      onChange={(e) => setClassFormData(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, startTime: e.target.value }
                      }))}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>End Time</label>
                    <input
                      type="time"
                      value={classFormData.schedule.endTime}
                      onChange={(e) => setClassFormData(prev => ({
                        ...prev,
                        schedule: { ...prev.schedule, endTime: e.target.value }
                      }))}
                      required
                    />
                  </div>
                </div>
                <div className={styles.formRow}>
                  <div className={styles.formGroup}>
                    <label>Capacity</label>
                    <input
                      type="number"
                      value={classFormData.capacity}
                      onChange={(e) => setClassFormData(prev => ({
                        ...prev,
                        capacity: parseInt(e.target.value)
                      }))}
                      min="1"
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Level</label>
                    <select
                      value={classFormData.level}
                      onChange={(e) => setClassFormData(prev => ({
                        ...prev,
                        level: e.target.value
                      }))}
                    >
                      <option value="beginner">Beginner</option>
                      <option value="intermediate">Intermediate</option>
                      <option value="advanced">Advanced</option>
                      <option value="all">All Levels</option>
                    </select>
                  </div>
                </div>
                <div className={styles.formActions}>
                  <button type="submit" className={styles.submitButton}>
                    Create Class
                  </button>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={() => setShowClassForm(false)}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}

            <div className={styles.classGrid}>
              {classes.map((classItem) => (
                <div key={classItem._id} className={styles.classCard}>
                  <h3>{classItem.name}</h3>
                  <p>{classItem.description}</p>
                  <p>Type: {classItem.type}</p>
                  <p>Schedule: {classItem.schedule.dayOfWeek} {classItem.schedule.startTime}-{classItem.schedule.endTime}</p>
                  <p>Capacity: {classItem.enrolledMembers.length}/{classItem.capacity}</p>
                  <p>Level: {classItem.level}</p>
                  <div className={styles.cardActions}>
                    <button
                      className={styles.deleteButton}
                      onClick={() => handleDeleteClass(classItem._id)}
                    >
                      Delete Class
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'settings' && (
          <div className={styles.settings}>
            <h2>Gym Settings</h2>
            <form className={styles.settingsForm} onSubmit={handleUpdateGym}>
              <div className={styles.formGroup}>
                <label>Gym Name</label>
                <input
                  type="text"
                  value={gymData?.name || ''}
                  onChange={(e) => setGymData(prev => ({ ...prev, name: e.target.value }))}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Contact Email</label>
                <input
                  type="email"
                  value={gymData?.contact?.email || ''}
                  onChange={(e) => setGymData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, email: e.target.value }
                  }))}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Contact Phone</label>
                <input
                  type="tel"
                  value={gymData?.contact?.phone || ''}
                  onChange={(e) => setGymData(prev => ({
                    ...prev,
                    contact: { ...prev.contact, phone: e.target.value }
                  }))}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  value={gymData?.description || ''}
                  onChange={(e) => setGymData(prev => ({ ...prev, description: e.target.value }))}
                  required
                />
              </div>
              <button type="submit" className={styles.saveButton}>
                Save Changes
              </button>
            </form>
          </div>
        )}
      </main>
    </div>
  );
}
