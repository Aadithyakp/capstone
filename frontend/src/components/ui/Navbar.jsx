import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Menu, Close } from '@mui/icons-material';
import styles from './Navbar.module.css';

const Navbar = () => {
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <>
      <nav className={styles.navbar}>
        <div className={styles.navContent}>
          <a href="/" className={styles.logo}>
            GymPal
          </a>

          {/* Desktop Menu */}
          <div className={styles.desktopMenu}>
            <a href="/privacy-policy" className={styles.navLink}>Privacy Policy</a>
            {/* <a href="#pricing" className={styles.navLink}>Pricing</a> */}
            <a href="/contact-us" className={styles.navLink}>Contact Us</a>
            <button 
              className={styles.secondaryButton}
              onClick={() => navigate('/login')}
            >
              Login
            </button>
            <button 
              className={styles.primaryButton}
              onClick={() => navigate('/register')}
            >
              Start Free Trial
            </button>
          </div>

          {/* Mobile Menu Button */}
          <button 
            className={styles.mobileMenuButton}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <Close /> : <Menu />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu */}
      <div className={`${styles.mobileMenu} ${isMenuOpen ? styles.open : ''}`}>
        <a href="/privacy-policy" className={styles.mobileNavLink}>Privacy Policy</a>
        {/* <a href="#pricing" className={styles.mobileNavLink}>Pricing</a> */}
        <a href="/contact-us" className={styles.mobileNavLink}>Contact Us</a>
        <button 
          className={styles.mobileButton}
          onClick={() => navigate('/login')}
        >
          Login
        </button>
        <button 
          className={styles.mobilePrimaryButton}
          onClick={() => navigate('/register')}
        >
          Start Free Trial
        </button>
      </div>
    </>
  );
};

export default Navbar;
