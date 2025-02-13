import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Facebook,
  Twitter,
  Instagram,
  LinkedIn,
  Email,
  Phone,
  LocationOn,
  PeopleAlt,
  EventNote,
  BarChart,
  Security,
  FitnessCenter,
  Timer,
  MonetizationOn,
  Notifications,
  Speed,
  Star,
  CheckCircle,
  ArrowForward,
  PlayArrow
} from '@mui/icons-material';
import styles from './Homepage.module.css';
import Navbar from './ui/Navbar';
import WaveCanvas from './ui/WaveCanvas';
/* import appDemo from '../assets/videos/app-demo.mp4'; */

const Homepage = () => {
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [stats, setStats] = useState({ members: 0, classes: 0, trainers: 0 });
  
  useEffect(() => {
    // Animate stats numbers
    const targetStats = { members: 5000, classes: 200, trainers: 50 };
    const duration = 2000;
    const steps = 50;
    
    const increment = {
      members: targetStats.members / steps,
      classes: targetStats.classes / steps,
      trainers: targetStats.trainers / steps
    };
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      if (currentStep < steps) {
        setStats(prev => ({
          members: Math.min(Math.round(prev.members + increment.members), targetStats.members),
          classes: Math.min(Math.round(prev.classes + increment.classes), targetStats.classes),
          trainers: Math.min(Math.round(prev.trainers + increment.trainers), targetStats.trainers)
        }));
        currentStep++;
      } else {
        clearInterval(timer);
      }
    }, duration / steps);
    
    return () => clearInterval(timer);
  }, []);

  const features = [
    {
      title: "Member Management",
      description: "Efficiently manage gym memberships, profiles, and access controls.",
      icon: <PeopleAlt sx={{ fontSize: 40 }} />,
      image: "/assets/images/features/member-management.jpg",
      iconColor: "#4CAF50",
      learnMoreLink: "/features/member-management"
    },
    {
      title: "Class Scheduling",
      description: "Easy class booking system with capacity management and notifications.",
      icon: <EventNote sx={{ fontSize: 40 }} />,
      image: "/assets/images/features/class-scheduling.png",
      iconColor: "#2196F3",
      learnMoreLink: "/features/scheduling"
    },
    {
      title: "Attendance Analytics",
      description: "Track and analyze member attendance patterns with detailed insights.",
      icon: <BarChart sx={{ fontSize: 40 }} />,
      image: "/assets/images/features/attendance.png",
      iconColor: "#FF9800",
      learnMoreLink: "/features/analytics"
    },
    {
      title: "Privacy Controls",
      description: "Secure member data with advanced privacy settings and controls.",
      icon: <Security sx={{ fontSize: 40 }} />,
      image: "/assets/images/features/privacy.png",
      iconColor: "#E91E63",
      learnMoreLink: "/features/privacy"
    }
  ];

  const testimonials = [
    {
      name: "Sarah Johnson",
      role: "Gym Owner",
      content: "GymPal has revolutionized how we manage our gym. The automated systems have saved us countless hours.",
      rating: 5
    },
    {
      name: "Mike Chen",
      role: "Fitness Trainer",
      content: "The class scheduling and member tracking features are incredible. Makes my job so much easier!",
      rating: 5
    },
    {
      name: "Emily Rodriguez",
      role: "Member",
      content: "Love how easy it is to book classes and track my fitness journey. The mobile app is fantastic!",
      rating: 5
    }
  ];

  return (
    <div className={styles.homepage}>
      <Navbar />
      
      {/* Hero Section */}
      <section className={styles.hero}>
        <div className={styles.heroContent}>
          <div className={styles.heroText}>
            <div className={styles.freeTag}>NEW</div>
            <h1 className={styles.heroTitle}>
              Simplfy your gym journey
            </h1>
            <p>No more hassle tracking members and managing schedules. Try GymPal management system, make your life simple.</p>
            <div className={styles.heroButtons}>
              <button className={styles.primaryButton}>
                Get Started Free <ArrowForward />
              </button>
            </div>
            <div className={styles.heroStats}>
              <div className={styles.statItem}>
                <img src="/assets/icons/users.svg" alt="Users" />
                <span>Over 12,000 trainers joined</span>
              </div>
              <div className={styles.statItem}>
                <img src="/assets/icons/secure.svg" alt="Secure" />
                <span>Secured & safe online platform</span>
              </div>
              <div className={styles.statItem}>
                <img src="/assets/icons/pricing.svg" alt="Pricing" />
                <span>No yearly charges, minimum fees</span>
              </div>
            </div>
          </div>
          <div className={styles.heroImages}>
            <div className={styles.cardContainer}>
              <div className={`${styles.floatingCard} ${styles.card1}`}>
                <img src="/assets/images/dashboard-3.jpg" alt="Dashboard Preview" />
              </div>
              <div className={`${styles.floatingCard} ${styles.card2}`}>
                <img src="/assets/images/dashboard-2.jpg" alt="Features Preview" />
              </div>
              <div className={`${styles.floatingCard} ${styles.card3}`}>
                <img src="/assets/images/dashboard-1.jpg" alt="Analytics Preview" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Wave Animation Section */}
      { <div className={styles.wavyContainer}>
        <WaveCanvas />
        <div className={styles.bannerContent}>
          <h1 className={styles.bannerTitle}>
            Transform Your Fitness Journey
          </h1>
          <p className={styles.bannerText}>
            Leverage the power of smart management to create a better gym experience
          </p>
          <div className={styles.bannerStats}>
            <div className={styles.bannerStat}>
              <span className={styles.bannerStatNumber}>98%</span>
              <span className={styles.bannerStatLabel}>Customer Satisfaction</span>
            </div>
            <div className={styles.bannerStat}>
              <span className={styles.bannerStatNumber}>2M+</span>
              <span className={styles.bannerStatLabel}>Members Managed</span>
            </div>
            <div className={styles.bannerStat}>
              <span className={styles.bannerStatNumber}>45%</span>
              <span className={styles.bannerStatLabel}>Revenue Growth</span>
            </div>
          </div>
        </div>
      </div> }

      {/* Features Section */}
      <section id="features" className={styles.features}>
        <div className={styles.featuresContainer}>
          <h2 className={styles.sectionTitle}>Our Features</h2>
          <div className={styles.featureGrid}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureContent}>
                  <div className={styles.featureHeader}>
                    <div className={styles.featureIcon} style={{ color: feature.iconColor }}>
                      {feature.icon}
                    </div>
                    <h3 className={styles.featureTitle}>{feature.title}</h3>
                  </div>
                  <p className={styles.featureDescription}>{feature.description}</p>
                  <Link to={feature.learnMoreLink} className={styles.learnMore}>
                    Learn More <ArrowForward className={styles.arrowIcon} />
                  </Link>
                </div>
                <div className={styles.featureImageContainer}>
                  <img src={feature.image} alt={feature.title} className={styles.featureImage} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className={styles.benefits}>
        <div className={styles.benefitsContent}>
          <h2>Why Choose GymPal?</h2>
          <div className={styles.benefitsList}>
            <div className={styles.benefitItem}>
              <CheckCircle className={styles.benefitIcon} />
              <div>
                <h3>Time-Saving Automation</h3>
                <p>Automate routine tasks and focus on growing your business</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <CheckCircle className={styles.benefitIcon} />
              <div>
                <h3>Enhanced Member Experience</h3>
                <p>Provide a seamless digital experience for your members</p>
              </div>
            </div>
            <div className={styles.benefitItem}>
              <CheckCircle className={styles.benefitIcon} />
              <div>
                <h3>Data-Driven Insights</h3>
                <p>Make informed decisions with detailed analytics</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className={styles.testimonials}>
        <h2 className={styles.sectionTitle}>What Our Users Say</h2>
        <div className={styles.testimonialGrid}>
          {testimonials.map((testimonial, index) => (
            <div key={index} className={styles.testimonialCard}>
              <div className={styles.testimonialRating}>
                {[...Array(testimonial.rating)].map((_, i) => (
                  <Star key={i} className={styles.starIcon} />
                ))}
              </div>
              <p className={styles.testimonialContent}>{testimonial.content}</p>
              <div className={styles.testimonialAuthor}>
                <h4>{testimonial.name}</h4>
                <p>{testimonial.role}</p>
              </div>
            </div>
          ))}
        </div>
      </section>


      <section className={styles.newsletterSection}>
        <h2 className={styles.newsletterTitle}>Stay Ahead in Fitness Management</h2>
        <p className={styles.newsletterSubtitle}>
          Join our newsletter and get exclusive insights, industry trends, and early access to new features.
        </p>
        <form className={styles.newsletterForm} onSubmit={(e) => e.preventDefault()}>
          <input
            type="email"
            className={styles.newsletterInput}
            placeholder="Enter your email address"
            aria-label="Email address"
          />
          <button type="submit" className={styles.newsletterButton}>
            Subscribe Now
          </button>
        </form>

        <div className={styles.benefitsList}>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>
              <Speed />
            </span>
            <span>Weekly Updates</span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>
              <Notifications />
            </span>
            <span>Feature Previews</span>
          </div>
          <div className={styles.benefitItem}>
            <span className={styles.benefitIcon}>
              <MonetizationOn />
            </span>
            <span>Exclusive Offers</span>
          </div>
        </div>

        <p className={styles.privacyNote}>
          By subscribing, you agree to receive GymPal marketing emails. 
          You can unsubscribe at any time.
        </p>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerContent}>
          <div className={styles.footerBrand}>
            <Link to="/" className={styles.footerLogo}>
              <FitnessCenter /> GymPal
            </Link>
            <p className={styles.footerDescription}>
              Empowering gym owners with smart management solutions for a better fitness experience.
            </p>
            <div className={styles.socialLinks}>
              <a href="#"><Facebook className={styles.socialIcon} /></a>
              <a href="#"><Twitter className={styles.socialIcon} /></a>
              <a href="#"><Instagram className={styles.socialIcon} /></a>
              <a href="#"><LinkedIn className={styles.socialIcon} /></a>
            </div>
          </div>
          
          <div className={styles.footerColumn}>
            <h3>Product</h3>
            <div className={styles.footerLinks}>
              <Link to="/features">Features</Link>
              <Link to="/pricing">Pricing</Link>
              <Link to="/demo">Demo</Link>
              <Link to="/updates">Updates</Link>
            </div>
          </div>
          
          <div className={styles.footerColumn}>
            <h3>Company</h3>
            <div className={styles.footerLinks}>
              <Link to="/about">About Us</Link>
              <Link to="/careers">Careers</Link>
              <Link to="/blog">Blog</Link>
              <Link to="/press">Press Kit</Link>
            </div>
          </div>
          
          <div className={styles.footerColumn}>
            <h3>Contact</h3>
            <div className={styles.footerLinks}>
              <a href="mailto:support@gympal.com">
                <Email /> support@gympal.com
              </a>
              <a href="tel:+1234567890">
                <Phone /> +1 (234) 567-890
              </a>
              <a href="#">
                <LocationOn /> New York, NY
              </a>
            </div>
          </div>
        </div>
        
        <div className={styles.footerBottom}>
          <p>&copy; {new Date().getFullYear()} GymPal. All rights reserved.</p>
        </div>
      </footer>

      {/* Video Modal */}
      {isVideoPlaying && (
        <div className={styles.videoModal} onClick={() => setIsVideoPlaying(false)}>
          <div className={styles.videoContainer}>
            <video controls autoPlay>
              <source src={appDemo} type="video/mp4" />
            </video>
          </div>
        </div>
      )}
    </div>
  );
};

export default Homepage;
