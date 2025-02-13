import { Link, useNavigate } from "react-router-dom";
import { uploadToCloudinary } from "../utils/cloudinary";
import { register } from "../utils/api";
import { registerSchema } from "../utils/validationSchemas";
import styles from "./Register.module.css";
import React, { useState, useRef } from 'react';
import ReCAPTCHA from "react-google-recaptcha";

// Replace this with your actual reCAPTCHA site key
const RECAPTCHA_SITE_KEY = "6LePlNQqAAAAAGKNN2VUmTmOjGcNrb5O0Zjv4Gci"; // This is Google's test key

export default function RegisterPage() {
  const navigate = useNavigate();
  const recaptchaRef = useRef();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [profilePicture, setProfilePicture] = useState(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirm_password: "",
    full_name: "",
    role: "user", // Set default role to 'user'
  });
  const [validationErrors, setValidationErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));

    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: '',
      }));
    }
  };

  const handleCaptchaChange = (token) => {
    setCaptchaToken(token);
    if (validationErrors.captcha) {
      setValidationErrors(prev => ({
        ...prev,
        captcha: ''
      }));
    }
  };

  const togglePasswordVisibility = (field) => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        setError('Please upload an image file');
        return;
      }
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }
      setProfilePicture(file);
      setError('');
    }
  };

  const handleRoleChange = (role) => {
    console.log("Selected Role:", role); // Debug log
    setFormData(prev => {
      const newData = {
        ...prev,
        role,
      };
      console.log("Updated form data:", newData); // Debug log
      return newData;
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setValidationErrors({});

    // Validate captcha
    if (!captchaToken) {
      setValidationErrors(prev => ({
        ...prev,
        captcha: 'Please complete the CAPTCHA verification'
      }));
      setLoading(false);
      return;
    }

    try {
      // Validate form data
      const validatedData = registerSchema.parse(formData);

      // First, upload the profile picture if one was selected
      let profileImageData = null;
      if (profilePicture) {
        profileImageData = await uploadToCloudinary(profilePicture);
      }

      // Prepare the registration data
      const registrationData = {
        ...validatedData,
        profile_picture: profileImageData?.url,
        captchaToken
      };

      console.log("Registration Data Being Sent:", registrationData); // Debugging log
      // Register the user
      await register(registrationData);

      // Show success message and redirect to login
      console.log('Registration successful! Please login to continue.');
      navigate('/login');
    } catch (err) {
      if (err.errors) {
        // Zod validation errors
        const errors = {};
        err.errors.forEach(error => {
          errors[error.path[0]] = error.message;
        });
        setValidationErrors(errors);
      } else {
        // API or other errors
        setError(err.message);
      }
      
      // Reset captcha on error
      recaptchaRef.current.reset();
      setCaptchaToken("");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <div className={styles.logo}>
          <Link to="/" className={styles.logoLink}>
            <div className={styles.logoIcon}></div>
            GymPal
          </Link>
        </div>
        <div className={styles.formWrapper}>
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.formHeader}>
              <div className={styles.formIcon}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M20.24 12.24a6 6 0 0 0-8.49-8.49L5 10.5V19h8.5l6.74-6.76zM16 17l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className={styles.formTitle}>Create Your Account</h1>
              <p className={styles.formSubtitle}>Fill in your information to get started</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.inputGroup}>
              <label htmlFor="username" className={styles.label}>
                Username
              </label>
              <input
                id="username"
                name="username"
                type="text"
                placeholder="Choose a username"
                required
                className={`${styles.input} ${validationErrors.username ? styles.inputError : ''}`}
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
              />
              {validationErrors.username && (
                <div className={styles.errorMessage}>{validationErrors.username}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                placeholder="Enter your email"
                required
                className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {validationErrors.email && (
                <div className={styles.errorMessage}>{validationErrors.email}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="full_name" className={styles.label}>
                Full Name
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                placeholder="Enter your full name"
                required
                className={`${styles.input} ${validationErrors.full_name ? styles.inputError : ''}`}
                value={formData.full_name}
                onChange={handleChange}
                disabled={loading}
              />
              {validationErrors.full_name && (
                <div className={styles.errorMessage}>{validationErrors.full_name}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="password" className={styles.label}>
                Password
              </label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  name="password"
                  placeholder="Create a password"
                  required
                  className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                  value={formData.password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => togglePasswordVisibility('password')}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {validationErrors.password && (
                <div className={styles.errorMessage}>{validationErrors.password}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirm_password" className={styles.label}>
                Confirm Password
              </label>
              <div className={styles.passwordInputWrapper}>
                <input
                  type={showConfirmPassword ? "text" : "password"}
                  id="confirm_password"
                  name="confirm_password"
                  placeholder="Confirm your password"
                  required
                  className={`${styles.input} ${validationErrors.confirm_password ? styles.inputError : ''}`}
                  value={formData.confirm_password}
                  onChange={handleChange}
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={() => togglePasswordVisibility('confirm')}
                >
                  {showConfirmPassword ? "Hide" : "Show"}
                </button>
              </div>
              {validationErrors.confirm_password && (
                <div className={styles.errorMessage}>{validationErrors.confirm_password}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Profile Picture</label>
              <div className={styles.uploadContainer}>
                <div className={styles.profilePicture}>
                  {profilePicture ? (
                    <img
                      src={URL.createObjectURL(profilePicture)}
                      alt="Profile preview"
                      className={styles.previewImage}
                    />
                  ) : (
                    <div className={styles.uploadPlaceholder}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 2L1 21H23L12 2ZM12 6L19.53 19H4.47L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z" fill="currentColor"/>
                      </svg>
                    </div>
                  )}
                </div>
                <label htmlFor="profilePicture" className={styles.uploadButton}>
                  {loading ? 'Uploading...' : 'Upload Photo'}
                </label>
                <input
                  id="profilePicture"
                  name="profilePicture"
                  type="file"
                  accept="image/*"
                  className={styles.fileInput}
                  onChange={handleFileChange}
                  disabled={loading}
                />
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Role</label>
              <div className={styles.accountTypeContainer}>
                <div
                  className={`${styles.accountType} ${formData.role === 'user' ? styles.selected : ''}`}
                  onClick={() => handleRoleChange('user')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2ZM12 5C13.66 5 15 6.34 15 8C15 9.66 13.66 11 12 11C10.34 11 9 9.66 9 8C9 6.34 10.34 5 12 5ZM12 19.2C9.5 19.2 7.29 17.92 6 15.98C6.03 13.99 10 12.9 12 12.9C13.99 12.9 17.97 13.99 18 15.98C16.71 17.92 14.5 19.2 12 19.2Z" fill="currentColor"/>
                  </svg>
                  <span>User</span>
                </div>
                <div
                  className={`${styles.accountType} ${formData.role === 'admin' ? styles.selected : ''}`}
                  onClick={() => handleRoleChange('admin')}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2L1 21H23L12 2ZM12 6L19.53 19H4.47L12 6ZM11 10V14H13V10H11ZM11 16V18H13V16H11Z" fill="currentColor"/>
                  </svg>
                  <span>Admin</span>
                </div>
              </div>
            </div>

            <div className={styles.inputGroup}>
              <label className={styles.label}>Captcha</label>
              <div className={styles.recaptchaWrapper}>
                <ReCAPTCHA
                  ref={recaptchaRef}
                  sitekey={RECAPTCHA_SITE_KEY}
                  onChange={handleCaptchaChange}
                />
                {validationErrors.captcha && (
                  <div className={styles.errorMessage}>{validationErrors.captcha}</div>
                )}
              </div>
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? 'Creating Account...' : 'Create Account'}
            </button>

            <div className={styles.loginText}>
              Already have an account?{" "}
              <Link to="/login" className={styles.loginLink}>
                Sign in
              </Link>
            </div>
          </form>
        </div>
      </div>
      <div className={styles.imageContainer}>
        <img
          src="https://images.unsplash.com/photo-1534438327276-14e5300c3a48?q=80&w=1770&auto=format&fit=crop"
          alt="Register cover"
          className={styles.coverImage}
        />
      </div>
    </div>
  );
}