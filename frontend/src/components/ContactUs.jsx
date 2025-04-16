import React, { useState } from 'react';
import styles from './ContactUs.module.css';
import Navbar from './ui/Navbar';
import { Email, Phone, LocationOn } from '@mui/icons-material';

const ContactUs = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Here you would typically send the form data to your backend
    console.log('Form submitted:', formData);
    // Reset form
    setFormData({
      name: '',
      email: '',
      subject: '',
      message: ''
    });
    alert('Thank you for your message. We will get back to you soon!');
  };

  return (
    <div className={styles.container}>
      <Navbar />
      <div className={styles.content}>
        <h1>Contact Us</h1>
        <p className={styles.subtitle}>Get in touch with us for any questions or concerns.</p>

        <div className={styles.contactGrid}>
          <div className={styles.contactInfo}>
            <div className={styles.infoCard}>
              <Email className={styles.icon} />
              <h3>Email</h3>
              <p>support@gympal.com</p>
              <p>business@gympal.com</p>
            </div>

            <div className={styles.infoCard}>
              <Phone className={styles.icon} />
              <h3>Phone</h3>
              <p>(555) 123-4567</p>
              <p>Mon-Fri, 9am-6pm EST</p>
            </div>

            <div className={styles.infoCard}>
              <LocationOn className={styles.icon} />
              <h3>Location</h3>
              <p>123 Fitness Street</p>
              <p>New York, NY 10001</p>
            </div>
          </div>

          <form className={styles.contactForm} onSubmit={handleSubmit}>
            <div className={styles.formGroup}>
              <label htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="subject">Subject</label>
              <input
                type="text"
                id="subject"
                name="subject"
                value={formData.subject}
                onChange={handleChange}
                required
              />
            </div>

            <div className={styles.formGroup}>
              <label htmlFor="message">Message</label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows="5"
                required
              />
            </div>

            <button type="submit" className={styles.submitButton}>
              Send Message
            </button>
          </form>
        </div>
      </div>
      
    </div>
    
  );
};

export default ContactUs;
