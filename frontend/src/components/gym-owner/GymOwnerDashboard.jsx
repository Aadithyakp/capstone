import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getGymByOwner, getGymClasses, createClass, deleteClass, updateGym, createGym, logout, getUserProfile, getGymMembers, getMemberDetails, updateMemberStatus } from '../../utils/api';
import styles from './GymOwnerDashboard.module.css';
import defaultAvatar from '../../assets/images/default-avatar.png';

const DAYS_OF_WEEK = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
const CLASS_TYPES = ['Yoga', 'HIIT', 'Strength', 'Cardio', 'Pilates', 'Other'];
const CLASS_LEVELS = ['beginner', 'intermediate', 'advanced', 'all'];

export default function GymOwnerDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('overview');
  const [gymData, setGymData] = useState(null);
  const [classes, setClasses] = useState([]);
  const [members, setMembers] = useState([]);
  const [selectedMember, setSelectedMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showClassForm, setShowClassForm] = useState(false);
  const [showGymForm, setShowGymForm] = useState(false);
  const [userData, setUserData] = useState(null);
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
    instructor: '', 
    description: '',
    type: 'Yoga',
    schedule: {
      dayOfWeek: 'monday',
      startTime: '09:00',
      endTime: '10:00'
    },
    capacity: 20,
    level: 'beginner'
  });

  const [membersPerPage] = useState(8);
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchData = useCallback(async () => {
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
  }, []);

  const fetchMembers = useCallback(async () => {
    if (!gymData?._id) return;
    
    try {
      const membersData = await getGymMembers(gymData._id);
      setMembers(membersData);
    } catch (err) {
      console.error('Error fetching members:', err);
      setError('Failed to load members data');
    }
  }, [gymData?._id]);

  const fetchUserProfile = useCallback(async () => {
    try {
      const data = await getUserProfile();
      setUserData(data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchUserProfile();
  }, [fetchData, fetchUserProfile]);

  useEffect(() => {
    if (gymData?._id) {
      fetchMembers();
    }
  }, [gymData, fetchMembers]);

  const handleMemberClick = async (memberId) => {
    try {
      const memberDetails = await getMemberDetails(gymData._id, memberId);
      setSelectedMember(memberDetails);
    } catch (err) {
      console.error('Error fetching member details:', err);
      setError('Failed to load member details');
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
        gym: gymData._id,
        // Ensure we're using the instructor name, not ID
        instructor: classFormData.instructor
      };

      const newClass = await createClass(gymData._id, classData);
      setClasses(prev => [...prev, newClass]);
      setShowClassForm(false);
      setError('');
      
      // Reset form data
      setClassFormData({
        name: '',
        instructor: '',
        description: '',
        type: 'Yoga',
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

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleStatusToggle = async (memberId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateMemberStatus(gymData._id, memberId, newStatus);
      
      // Update local state
      setMembers(members.map(member => 
        member._id === memberId ? { ...member, status: newStatus } : member
      ));
      
      if (selectedMember?._id === memberId) {
        setSelectedMember({ ...selectedMember, status: newStatus });
      }
    } catch (error) {
      console.error('Error updating member status:', error);
      setError('Failed to update member status');
    }
  };

  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber);
  };

  // Filter members based on search
  const filteredMembers = members.filter(member => 
    member.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    member.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get current members for pagination
  const indexOfLastMember = currentPage * membersPerPage;
  const indexOfFirstMember = indexOfLastMember - membersPerPage;
  const currentMembers = filteredMembers.slice(indexOfFirstMember, indexOfLastMember);
  const totalPages = Math.ceil(filteredMembers.length / membersPerPage);

  const renderMembersTab = () => {
    return (
      <div className={styles.membersSection}>
        <h2>Members</h2>
        
        <div className={styles.membersList}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.membersHeader}>
            <div className={styles.searchBox}>
              <input
                type="text"
                placeholder="Search members..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <div className={styles.totalMembers}>
              Total Members: {filteredMembers.length}
            </div>
          </div>

          {filteredMembers.length === 0 ? (
            <p>No members found. {searchQuery ? 'Try a different search.' : 'Add members to get started.'}</p>
          ) : (
            <>
              <div className={styles.membersGrid}>
                {currentMembers.map((member) => (
                  <div 
                    key={member._id}
                    className={`${styles.memberCard} ${selectedMember?._id === member._id ? styles.selected : ''}`}
                    onClick={() => handleMemberClick(member._id)}
                  >
                    <div className={styles.memberAvatar}>
                      <img src={member.profilePicture || defaultAvatar} alt={member.name} />
                      <span className={`${styles.statusDot} ${styles[member.status]}`} />
                    </div>
                    <div className={styles.memberInfo}>
                      <h3>{member.name}</h3>
                      <p className={styles.memberStatus}>{member.status}</p>
                    </div>
                    <span className={`${styles.memberPlan} ${styles[member.plan?.toLowerCase() || 'free']}`}>
                      {member.plan || 'Free'}
                    </span>
                  </div>
                ))}
              </div>

              {totalPages > 1 && (
                <div className={styles.pagination}>
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={styles.pageButton}
                  >
                    Previous
                  </button>
                  
                  {[...Array(totalPages)].map((_, index) => (
                    <button
                      key={index + 1}
                      onClick={() => handlePageChange(index + 1)}
                      className={`${styles.pageButton} ${currentPage === index + 1 ? styles.active : ''}`}
                    >
                      {index + 1}
                    </button>
                  ))}
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className={styles.pageButton}
                  >
                    Next
                  </button>
                </div>
              )}

              {selectedMember && (
                <div className={styles.memberDetails}>
                  <h3>Member Details</h3>
                  <div className={styles.detailsGrid}>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Name:</span>
                      <span>{selectedMember.name}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Email:</span>
                      <span>{selectedMember.email}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Plan:</span>
                      <span>{selectedMember.plan || 'Free'}</span>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Status:</span>
                      <div className={styles.statusToggle}>
                        <span>{selectedMember.status}</span>
                        <button
                          className={`${styles.toggleButton} ${styles[selectedMember.status]}`}
                          onClick={() => handleStatusToggle(selectedMember._id, selectedMember.status)}
                        >
                          {selectedMember.status === 'active' ? 'Set Inactive' : 'Set Active'}
                        </button>
                      </div>
                    </div>
                    <div className={styles.detailItem}>
                      <span className={styles.label}>Joined:</span>
                      <span>{new Date(selectedMember.joinedDate).toLocaleDateString()}</span>
                    </div>
                  </div>

                  <div className={styles.enrolledClasses}>
                    <h4>Enrolled Classes</h4>
                    {selectedMember.enrolledClasses?.length > 0 ? (
                      <ul className={styles.classList}>
                        {selectedMember.enrolledClasses.map((classItem) => (
                          <li key={classItem._id} className={styles.classItem}>
                            <span className={styles.className}>{classItem.name}</span>
                            <span className={styles.classSchedule}>
                              {classItem.schedule.dayOfWeek} {classItem.schedule.startTime}-{classItem.schedule.endTime}
                            </span>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p>Not enrolled in any classes</p>
                    )}
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    );
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
        <div className={styles.headerLeft}>
          <h1>Gym Owner Dashboard</h1>
        </div>
        <div className={styles.headerRight}>
          
          <nav className={styles.navigation}>
            <button 
              className={`${styles.navButton} ${activeTab === 'overview' ? styles.active : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              Overview
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'classes' ? styles.active : ''}`}
              onClick={() => setActiveTab('classes')}
            >
              Classes
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'members' ? styles.active : ''}`}
              onClick={() => setActiveTab('members')}
            >
              Members
            </button>
            <button 
              className={`${styles.navButton} ${activeTab === 'settings' ? styles.active : ''}`}
              onClick={() => setActiveTab('settings')}
            >
              Settings
            </button>
          </nav>
          <div className={styles.userInfo}>
            <div className={styles.profileImageContainer}>
              <img 
                src={userData?.profile_picture || defaultAvatar} 
                alt={userData?.full_name || 'User'} 
                className={styles.profileImage}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = defaultAvatar;
                }}
              />
            </div>
            <div className={styles.userInfoText}>
              <span>Welcome, {userData?.full_name || 'Gym Owner'}!</span>
              <span className={styles.role}>Gym Owner</span>
            </div>
            <button onClick={handleLogout} className={styles.logoutButton}>
              Logout
            </button>
          </div>
        </div>
      </header>

      <div className={styles.content}>
        {gymData ? (
          <>
            <div className={styles.gymInfo}>
              <h2>{gymData.name}</h2>
              <div className={styles.details}>
                <div className={styles.section}>
                  <h3>Address</h3>
                  <p>{gymData.address.street}</p>
                  <p>{gymData.address.city}, {gymData.address.state} {gymData.address.zipCode}</p>
                </div>
                <div className={styles.section}>
                  <h3>Contact</h3>
                  <p>Phone: {gymData.contact.phone}</p>
                  <p>Email: {gymData.contact.email}</p>
                </div>
              </div>
            </div>

            {activeTab === 'overview' && (
              <div className={styles.overviewSection}>
                <div className={styles.statsGrid}>
                  <div className={styles.statCard}>
                    <h3>Total Members</h3>
                    <p className={styles.statNumber}>
                      {gymData.members ? gymData.members.length : 0}
                    </p>
                    <p className={styles.statLabel}>Active Members</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>Total Classes</h3>
                    <p className={styles.statNumber}>{classes.length}</p>
                    <p className={styles.statLabel}>Classes Offered</p>
                  </div>
                  <div className={styles.statCard}>
                    <h3>Today's Classes</h3>
                    <p className={styles.statNumber}>
                      {classes.filter(c => {
                        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                        const today = days[new Date().getDay()];
                        return c.schedule.dayOfWeek === today;
                      }).length}
                    </p>
                    <p className={styles.statLabel}>Classes Today</p>
                  </div>
                </div>

                <div className={styles.todaysClasses}>
                  <div className={styles.sectionHeader}>
                    <h2>Today's Schedule</h2>
                  </div>
                  <div className={styles.classTimelineGrid}>
                    {classes
                      .filter(c => {
                        const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
                        const today = days[new Date().getDay()];
                        return c.schedule.dayOfWeek === today;
                      })
                      .sort((a, b) => {
                        const timeA = a.schedule.startTime.split(':').map(Number);
                        const timeB = b.schedule.startTime.split(':').map(Number);
                        return (timeA[0] * 60 + timeA[1]) - (timeB[0] * 60 + timeB[1]);
                      })
                      .map(classItem => (
                        <div key={classItem._id} className={styles.timelineCard}>
                          <div className={styles.timeSlot}>
                            <span className={styles.startTime}>{classItem.schedule.startTime}</span>
                            <span className={styles.endTime}>{classItem.schedule.endTime}</span>
                          </div>
                          <div className={styles.timelineContent}>
                            <div className={styles.timelineHeader}>
                              <h3>{classItem.name}</h3>
                              <span className={styles.classType}>{classItem.type}</span>
                            </div>
                            <p className={styles.timelineInstructor}>
                              <strong>Instructor:</strong> {classItem.instructor}
                            </p>
                            <div className={styles.timelineFooter}>
                              <span className={styles.classLevel}>
                                Level: {classItem.level.charAt(0).toUpperCase() + classItem.level.slice(1)}
                              </span>
                              <span className={styles.classCapacity}>
                                Capacity: {classItem.capacity}
                              </span>
                            </div>
                          </div>
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
              <div className={styles.classesSection}>
                <div className={styles.sectionHeader}>
                  <h2>Classes</h2>
                  <button onClick={() => setShowClassForm(true)} className={styles.addButton}>
                    Add New Class
                  </button>
                </div>

                <div className={styles.classList}>
                  {classes.map(classItem => (
                    <div key={classItem._id} className={styles.classCard}>
                      <div className={styles.classHeader}>
                        <h3>{classItem.name}</h3>
                        <div className={styles.headerDetails}>
                          <span className={styles.classType}>{classItem.type}</span>
                          <span className={styles.instructorName}>
                            {classItem.instructor}
                          </span>
                        </div>
                      </div>
                      <p className={styles.classDescription}>{classItem.description}</p>
                      <div className={styles.classDetails}>
                        <p>
                          <strong>Schedule:</strong> {classItem.schedule.dayOfWeek.charAt(0).toUpperCase() + 
                          classItem.schedule.dayOfWeek.slice(1)} at {classItem.schedule.startTime}-{classItem.schedule.endTime}
                        </p>
                        <p><strong>Level:</strong> {classItem.level.charAt(0).toUpperCase() + classItem.level.slice(1)}</p>
                        <p><strong>Capacity:</strong> {classItem.capacity}</p>
                      </div>
                      <div className={styles.cardActions}>
                        <button
                          onClick={() => {
                            setClassFormData({
                              ...classItem,
                              instructor: classItem.instructor
                            });
                            setShowClassForm(true);
                          }}
                          className={styles.editButton}
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteClass(classItem._id)}
                          className={styles.deleteButton}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'members' && renderMembersTab()}

            {activeTab === 'settings' && (
              <div className={styles.settingsSection}>
                <div className={styles.sectionHeader}>
                  <h2>Gym Settings</h2>
                </div>
                <form className={styles.settingsForm} onSubmit={handleUpdateGym}>
                  <div className={styles.formGroup}>
                    <label>Gym Name</label>
                    <input
                      type="text"
                      name="name"
                      value={gymData.name}
                      onChange={(e) => setGymData({ ...gymData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Description</label>
                    <textarea
                      name="description"
                      value={gymData.description}
                      onChange={(e) => setGymData({ ...gymData, description: e.target.value })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Email</label>
                    <input
                      type="email"
                      name="contact.email"
                      value={gymData.contact.email}
                      onChange={(e) => setGymData({
                        ...gymData,
                        contact: { ...gymData.contact, email: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Phone</label>
                    <input
                      type="tel"
                      name="contact.phone"
                      value={gymData.contact.phone}
                      onChange={(e) => setGymData({
                        ...gymData,
                        contact: { ...gymData.contact, phone: e.target.value }
                      })}
                      required
                    />
                  </div>
                  <div className={styles.formGroup}>
                    <label>Address</label>
                    <input
                      type="text"
                      name="address.street"
                      placeholder="Street Address"
                      value={gymData.address.street}
                      onChange={(e) => setGymData({
                        ...gymData,
                        address: { ...gymData.address, street: e.target.value }
                      })}
                      required
                    />
                    <div className={styles.addressGrid}>
                      <input
                        type="text"
                        name="address.city"
                        placeholder="City"
                        value={gymData.address.city}
                        onChange={(e) => setGymData({
                          ...gymData,
                          address: { ...gymData.address, city: e.target.value }
                        })}
                        required
                      />
                      <input
                        type="text"
                        name="address.state"
                        placeholder="State"
                        value={gymData.address.state}
                        onChange={(e) => setGymData({
                          ...gymData,
                          address: { ...gymData.address, state: e.target.value }
                        })}
                        required
                      />
                      <input
                        type="text"
                        name="address.zipCode"
                        placeholder="ZIP Code"
                        value={gymData.address.zipCode}
                        onChange={(e) => setGymData({
                          ...gymData,
                          address: { ...gymData.address, zipCode: e.target.value }
                        })}
                        required
                      />
                    </div>
                  </div>
                  <div className={styles.formActions}>
                    <button type="submit" className={styles.submitButton}>
                      Save Changes
                    </button>
                  </div>
                </form>
              </div>
            )}
          </>
        ) : (
          <div className={styles.noGym}>
            <p>No gym found. Please create one to get started.</p>
            <button onClick={() => navigate('/create-gym')} className={styles.createButton}>
              Create Gym
            </button>
          </div>
        )}
      </div>

      {showClassForm && (
        <div className={styles.formOverlay}>
          <div className={styles.formContainer}>
            <h2>{classFormData._id ? 'Edit Class' : 'Add New Class'}</h2>
            <form onSubmit={handleCreateClass} className={styles.classForm}>
              <div className={styles.formGroup}>
                <label>Class Name</label>
                <input
                  type="text"
                  name="name"
                  value={classFormData.name}
                  onChange={handleClassFormChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Instructor Name</label>
                <input
                  type="text"
                  name="instructor"
                  value={classFormData.instructor}
                  onChange={handleClassFormChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Description</label>
                <textarea
                  name="description"
                  value={classFormData.description}
                  onChange={handleClassFormChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label>Type</label>
                <select
                  name="type"
                  value={classFormData.type}
                  onChange={handleClassFormChange}
                  required
                >
                  {CLASS_TYPES.map(type => (
                    <option key={type} value={type}>{type}</option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Level</label>
                <select
                  name="level"
                  value={classFormData.level}
                  onChange={handleClassFormChange}
                  required
                >
                  {CLASS_LEVELS.map(level => (
                    <option key={level} value={level}>
                      {level.charAt(0).toUpperCase() + level.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.formGroup}>
                <label>Day of Week</label>
                <select
                  name="schedule.dayOfWeek"
                  value={classFormData.schedule.dayOfWeek}
                  onChange={handleClassFormChange}
                  required
                >
                  {DAYS_OF_WEEK.map(day => (
                    <option key={day} value={day}>
                      {day.charAt(0).toUpperCase() + day.slice(1)}
                    </option>
                  ))}
                </select>
              </div>

              <div className={styles.timeGroup}>
                <div className={styles.formGroup}>
                  <label>Start Time</label>
                  <input
                    type="time"
                    name="schedule.startTime"
                    value={classFormData.schedule.startTime}
                    onChange={handleClassFormChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label>End Time</label>
                  <input
                    type="time"
                    name="schedule.endTime"
                    value={classFormData.schedule.endTime}
                    onChange={handleClassFormChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label>Capacity</label>
                <input
                  type="number"
                  name="capacity"
                  min="1"
                  value={classFormData.capacity}
                  onChange={handleClassFormChange}
                  required
                />
              </div>

              <div className={styles.formActions}>
                <button type="submit" className={styles.submitButton}>
                  {classFormData._id ? 'Update Class' : 'Create Class'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowClassForm(false);
                    setClassFormData({
                      name: '',
                      instructor: '',
                      description: '',
                      type: 'Yoga',
                      schedule: {
                        dayOfWeek: 'monday',
                        startTime: '09:00',
                        endTime: '10:00'
                      },
                      capacity: 20,
                      level: 'beginner'
                    });
                  }}
                  className={styles.cancelButton}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
