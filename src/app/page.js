'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import styles from './landing.module.css';

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: 'easeOut' } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15
    }
  }
};

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);

  const [counters, setCounters] = useState({
    mentors: 0,
    startups: 0,
    sessions: 0,
    satisfaction: 0
  });

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const animateCounters = () => {
    const duration = 2000;
    const steps = 60;
    const stepTime = duration / steps;
    
    let currentStep = 0;
    
    const timer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      
      setCounters({
        mentors: Math.floor(easeOutQuart * 150),
        startups: Math.floor(easeOutQuart * 400),
        sessions: Math.floor(easeOutQuart * 2000),
        satisfaction: Math.floor(easeOutQuart * 95)
      });
      
      if (currentStep >= steps) {
        clearInterval(timer);
        setCounters({ mentors: 150, startups: 400, sessions: 2000, satisfaction: 95 });
      }
    }, stepTime);
  };

  return (
    <div className={styles.main}>
      {/* Navigation */}
      <nav className={`${styles.navbar} ${scrolled ? styles.navbarScrolled : ''}`}>
        <div className={`container ${styles.navContainer}`}>
          <Link href="/" className={styles.logo}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent-primary)'}}>
              <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
            </svg>
            Mentorship Portal
          </Link>
          
          <div className={styles.navLinks}>
            <Link href="#how-it-works" className={styles.navLink}>How it Works</Link>
            <Link href="#features" className={styles.navLink}>Features</Link>
            <Link href="#contact" className={styles.navLink}>Contact</Link>
          </div>
          
          <div className={styles.navActions}>
            <Link href="/auth/login" className="btn btn-secondary">
              Sign In
            </Link>
            <Link href="/auth/register" className="btn btn-primary">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className={styles.hero}>
        <div className="container" style={{ position: 'relative', zIndex: 1 }}>
          <motion.div initial="hidden" animate="visible" variants={staggerContainer}>
            <motion.h1 variants={fadeUp} className={styles.heroTitle}>
              Structured Mentorship for <span className="text-gradient" style={{color: 'var(--accent-primary)'}}>Ambitious Startups</span>
            </motion.h1>
            
            <motion.p variants={fadeUp} className={styles.heroSubtitle}>
              Connecting high-potential startups with experienced Angel Investors and VC professionals for guided growth, smart matching, and actionable insights.
            </motion.p>
            
            <motion.div variants={fadeUp} className={styles.heroActions}>
              <Link href="/auth/register/startup" className="btn btn-primary btn-lg">
                Register as Startup
              </Link>
              <Link href="/auth/register/mentor" className="btn btn-secondary btn-lg">
                Join as Mentor
              </Link>
            </motion.div>

            <motion.div variants={fadeUp} className={styles.mockupContainer}>
              <img src="/images/dashboard-mockup.jpg" alt="Dashboard Mockup" className={styles.mockupImage} />
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className={`${styles.section} ${styles.sectionAlternate}`}>
        <div className="container">
          <motion.div 
            className={styles.statsGrid} 
            initial="hidden" 
            whileInView="visible" 
            viewport={{ once: true, margin: "-100px" }}
            variants={staggerContainer}
            onViewportEnter={animateCounters}
          >
            <motion.div variants={fadeUp} className={styles.statCard}>
              <div className={styles.statValue}>{counters.mentors}+</div>
              <div className={styles.statLabel}>Expert Mentors</div>
            </motion.div>
            <motion.div variants={fadeUp} className={styles.statCard}>
              <div className={styles.statValue}>{counters.startups}+</div>
              <div className={styles.statLabel}>Startups Funded</div>
            </motion.div>
            <motion.div variants={fadeUp} className={styles.statCard}>
              <div className={styles.statValue}>{counters.sessions}+</div>
              <div className={styles.statLabel}>Mentorship Sessions</div>
            </motion.div>
            <motion.div variants={fadeUp} className={styles.statCard}>
              <div className={styles.statValue}>{counters.satisfaction}%</div>
              <div className={styles.statLabel}>Satisfaction Rate</div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.section}>
        <div className="container">
          <motion.div 
            className={styles.sectionHeader}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>A streamlined process to accelerate your startup&apos;s growth journey with the right guidance.</p>
          </motion.div>
          
          <motion.div 
            className={styles.stepsGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className={styles.stepCard}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              </div>
              <h3 className={styles.stepTitle}>Register & Apply</h3>
              <p className={styles.stepDesc}>Create your profile, upload your pitch deck, and tell us about your startup&apos;s vision and current challenges.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className={styles.stepCard}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <h3 className={styles.stepTitle}>Get Matched</h3>
              <p className={styles.stepDesc}>Our smart algorithm pairs you with mentors who have the specific industry experience and network you need.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className={styles.stepCard}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <h3 className={styles.stepTitle}>Start Growing</h3>
              <p className={styles.stepDesc}>Schedule sessions, track your milestones, and leverage expert advice to scale your business efficiently.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={`${styles.section} ${styles.sectionAlternate}`}>
        <div className="container">
          <motion.div 
            className={styles.sectionHeader}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeUp}
          >
            <h2 className={styles.sectionTitle}>Platform Features</h2>
            <p className={styles.sectionSubtitle}>Everything you need to manage mentorships, track progress, and facilitate investments.</p>
          </motion.div>
          
          <motion.div 
            className={styles.featuresGrid}
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={staggerContainer}
          >
            <motion.div variants={fadeUp} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Intelligent Matching & Portals</h3>
              <p className={styles.featureDesc}>Our proprietary algorithm connects high-potential startups with the most relevant investors and industry experts based on sector, stage, and specific growth needs. Once matched, users collaborate within dedicated, role-based portals designed specifically for Mentors, Startups, and Administrators to ensure privacy and laser-focused engagement.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3 className={styles.featureTitle}>End-to-End Lifecycle Management</h3>
              <p className={styles.featureDesc}>Manage your entire mentorship relationship directly through the platform. Seamlessly book, reschedule, and manage meetings with integrated scheduling tools. Establish clear milestones, track action items from every session, and measure your startup&apos;s velocity over time to ensure that every conversation translates into tangible business results.</p>
            </motion.div>
            
            <motion.div variants={fadeUp} className={styles.featureCard}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Secure Sharing & Real-time Analytics</h3>
              <p className={styles.featureDesc}>Maintain a centralized, highly secure repository for your pitch decks, financial documents, and business plans, ensuring your mentors always have access to your latest materials. Administrators and program managers can track platform engagement metrics, monitor session feedback, and oversee startup growth milestones through comprehensive real-time dashboards.</p>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <Link href="/" className={styles.logo}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" style={{color: 'var(--accent-primary)'}}>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
              Mentorship Portal
            </Link>
            <div className={styles.footerLinks}>
              <Link href="#" className={styles.footerLink}>Privacy Policy</Link>
              <Link href="#" className={styles.footerLink}>Terms of Service</Link>
              <Link href="#" className={styles.footerLink}>Contact Us</Link>
            </div>
            <div className={styles.copyright}>
              © {new Date().getFullYear()} Mentorship Portal. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
