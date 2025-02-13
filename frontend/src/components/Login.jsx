import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { login } from "../utils/api";
import { loginSchema } from "../utils/validationSchemas";
import styles from "./Login.module.css";

export default function LoginPage() {
  const navigate = useNavigate();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [validationErrors, setValidationErrors] = useState({});

  useEffect(() => {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    if (token && user) {
      navigate('/dashboard', { replace: true });
    }
  }, [navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    if (validationErrors[name]) {
      setValidationErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setValidationErrors({});

    try {
      const validatedData = loginSchema.parse(formData);
      console.log('Sending login request with:', validatedData);
      
      const response = await login(validatedData);
      console.log('Login response:', response);
      
      // Log the entire response structure for debugging
      console.log('Response structure:', {
        hasToken: !!response.token,
        hasUser: !!response.user,
        userFields: response.user ? Object.keys(response.user) : [],
        userId: response.user ? response.user.id || response.user._id : null
      });

      // Check if we have the basic required fields
      if (!response.token) {
        throw new Error('No token received from server');
      }

      if (!response.user) {
        throw new Error('No user data received from server');
      }

      // Get user ID (handle both 'id' and '_id' cases)
      const userId = response.user.id || response.user._id;
      if (!userId) {
        throw new Error('No user ID received from server');
      }

      // Store the token and user data
      const userData = {
        _id: userId,
        email: response.user.email,
        full_name: response.user.full_name || response.user.fullName || response.user.name,
        profile_picture: response.user.profile_picture || response.user.profilePicture || null,
        role: response.user.role // Store the user's role
      };

      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(userData));
      console.log('Stored user data:', userData);

      // Redirect based on user role
      setTimeout(() => {
        console.log('Redirecting based on role:', userData.role);
        if (userData.role === 'admin') {
          navigate('/gym-owner-dashboard', { replace: true });
        } else {
          navigate('/dashboard', { replace: true });
        }
      }, 100);
    } catch (err) {
      console.error('Login error:', err);
      if (err.errors) {
        const errors = {};
        err.errors.forEach(error => {
          errors[error.path[0]] = error.message;
        });
        setValidationErrors(errors);
      } else {
        setError(err.message || 'Login failed');
      }
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
                  <path d="M15 3H19C19.5304 3 20.0391 3.21071 20.4142 3.58579C20.7893 3.96086 21 4.46957 21 5V19C21 19.5304 20.7893 20.0391 20.4142 20.4142C20.0391 20.7893 19.5304 21 19 21H5C4.46957 21 3.96086 20.7893 3.58579 20.4142C3.21071 20.0391 3 19.5304 3 19V5C3 4.46957 3.21071 3.96086 3.58579 3.58579C3.96086 3.21071 4.46957 3 5 3H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
              </div>
              <h1 className={styles.formTitle}>Welcome Back</h1>
              <p className={styles.formSubtitle}>Sign in to your account</p>
            </div>

            {error && <div className={styles.error}>{error}</div>}

            <div className={styles.inputGroup}>
              <label htmlFor="email" className={styles.label}>
                Email
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                className={`${styles.input} ${validationErrors.email ? styles.inputError : ''}`}
                placeholder="Enter your email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
              {validationErrors.email && (
                <div className={styles.errorMessage}>{validationErrors.email}</div>
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
                  value={formData.password}
                  onChange={handleChange}
                  className={`${styles.input} ${validationErrors.password ? styles.inputError : ''}`}
                  placeholder="Enter your password"
                  disabled={loading}
                />
                <button
                  type="button"
                  className={styles.passwordToggle}
                  onClick={togglePasswordVisibility}
                >
                  {showPassword ? "Hide" : "Show"}
                </button>
              </div>
              {validationErrors.password && (
                <div className={styles.errorMessage}>{validationErrors.password}</div>
              )}
            </div>

            <button type="submit" className={styles.button} disabled={loading}>
              {loading ? "Signing in..." : "Sign In"}
            </button>

            <div className={styles.registerText}>
              Don't have an account?{" "}
              <Link to="/register" className={styles.registerLink}>
                Sign up
              </Link>
            </div>
          </form>
        </div>
      </div>
      <div className={styles.imageContainer}>
        <img
          src="https://images.unsplash.com/photo-1550345332-09e3ac987658?q=80&w=1887&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
          alt="Login cover"
          className={styles.coverImage}
        />
      </div>
    </div>
  );
}
