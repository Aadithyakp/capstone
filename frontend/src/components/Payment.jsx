import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './Payment.module.css';
import { updateUserStatus } from '../utils/api';

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPlan, setSelectedPlan] = useState('free');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [stripe, setStripe] = useState(null);
  const [paymentStatus, setPaymentStatus] = useState('');

  const handlePaymentSuccess = useCallback(async (sessionId) => {
    try {
      setLoading(true);
      setError('');
      
      // Verify payment status with backend
      const response = await fetch(`https://capstone-31d0.onrender.com/api/payment/payment-success?session_id=${sessionId}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Payment verification failed');
      }

      const data = await response.json();
      if (data.success) {
        setPaymentStatus('success');
        navigate('/dashboard');
      } else {
        throw new Error('Payment verification failed');
      }
    } catch (error) {
      setError(error.message || 'Failed to verify payment. Please contact support.');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  }, [navigate]);

  useEffect(() => {
    const loadStripe = async () => {
      if (window.Stripe) {
        try {
          const stripeInstance = window.Stripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);
          setStripe(stripeInstance);
        } catch {
          setError('Failed to load payment system. Please try again later.');
        }
      }
    };

    loadStripe();

    // Check for successful payment or error in URL
    const urlParams = new URLSearchParams(location.search);
    const sessionId = urlParams.get('session_id');
    const paymentError = urlParams.get('error');

    if (sessionId) {
      handlePaymentSuccess(sessionId);
    } else if (paymentError) {
      setError(decodeURIComponent(paymentError));
      setPaymentStatus('failed');
    }
  }, [location, handlePaymentSuccess]);

  const plans = {
    free: {
      name: 'Free Plan',
      price: 0,
      features: [
        '2 Class Bookings per Month',
        'Basic Gym Access',
        'Standard Support'
      ]
    },
    premium: {
      name: 'Premium Plan',
      price: 29.99,
      features: [
        'Unlimited Class Bookings',
        'Access to All Gyms',
        'Priority Support',
        'Personal Training Sessions',
        'Nutrition Consultation'
      ]
    }
  };

  const handlePlanSelect = (plan) => {
    setSelectedPlan(plan);
    setError('');
    setPaymentStatus('');
  };

  const handlePayment = async () => {
    try {
      setLoading(true);
      setError('');
      setPaymentStatus('processing');

      if (selectedPlan === 'free') {
        try {
          await updateUserStatus('active', 'free');
          navigate('/dashboard');
          return;
        } catch {
          throw new Error('Failed to activate free plan. Please try again.');
        }
      }

      if (!stripe) {
        console.error('Stripe Checkout Error:', result.error);
        navigate(`/payment?error=${encodeURIComponent(result.error.message)}`);
        throw new Error('Payment system is not ready. Please try again in a moment.');
      }

      // Create a Stripe checkout session
      const response = await fetch('https://capstone-31d0.onrender.com/api/payment/create-checkout-session', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          plan: selectedPlan
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to start payment process. Please try again.');
      }

      const session = await response.json();

      // Redirect to Stripe checkout
      const result = await stripe.redirectToCheckout({
        sessionId: session.id
      });

      if (result.error) {
        throw new Error(result.error.message || 'Payment failed. Please try again.');
      }
    } catch (error) {
      setError(error.message || 'An unexpected error occurred. Please try again.');
      setPaymentStatus('failed');
    } finally {
      setLoading(false);
    }
  };

  const getPaymentStatusMessage = () => {
    switch (paymentStatus) {
      case 'processing':
        return 'Processing your payment...';
      case 'success':
        return 'Payment successful! Redirecting to dashboard...';
      case 'failed':
        return error || 'Payment failed. Please try again.';
      default:
        return '';
    }
  };

  return (
    <div className={styles.paymentContainer}>
      <h2>Choose Your Plan</h2>
      {error && <div className={styles.paymentError}>{error}</div>}
      {paymentStatus && <div className={`${styles.paymentStatus} ${styles[paymentStatus]}`}>
        {getPaymentStatusMessage()}
      </div>}
      
      <div className={styles.paymentPlans}>
        {Object.entries(plans).map(([planId, plan]) => (
          <div
            key={planId}
            className={`${styles.paymentPlan} ${selectedPlan === planId ? styles.selectedPlan : ''}`}
            onClick={() => handlePlanSelect(planId)}
          >
            <h3>{plan.name}</h3>
            <p className={styles.planPrice}>{plan.price === 0 ? 'Free' : `$${plan.price}`}</p>
            <ul>
              {plan.features.map((feature, index) => (
                <li key={index}>{feature}</li>
              ))}
            </ul>
            <button
              className={styles.planSelectButton}
              onClick={(e) => {
                e.stopPropagation();
                handlePlanSelect(planId);
              }}
            >
              {selectedPlan === planId ? 'Selected' : 'Select Plan'}
            </button>
          </div>
        ))}
      </div>

      <button
        className={styles.paymentButton}
        onClick={handlePayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : `Continue with ${selectedPlan === 'free' ? 'Free Plan' : 'Payment'}`}
      </button>
    </div>
  );
};

export default Payment;
