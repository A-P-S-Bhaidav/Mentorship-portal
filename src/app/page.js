'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import styles from './landing.module.css';

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false);
  const observerRef = useRef(null);
  const statsRef = useRef(null);

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

  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
          
          // Trigger counter animation if stats section
          if (entry.target.id === 'stats-section' && counters.mentors === 0) {
            animateCounters();
          }
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    
    if (statsRef.current) {
      observer.observe(statsRef.current);
    }

    return () => observer.disconnect();
  }, [counters.mentors]); // added dependency to prevent re-triggering constantly but it's safe

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
            MENTORSHIP PORTAL
          </Link>
          
          <div className={styles.navLinks}>
            <Link href="#about" className={styles.navLink}>About</Link>
            <Link href="#how-it-works" className={styles.navLink}>How it Works</Link>
            <Link href="#features" className={styles.navLink}>Features</Link>
            <Link href="#contact" className={styles.navLink}>Contact</Link>
          </div>
          
          <div className={styles.navActions}>
            <Link href="/auth/signin" className="btn btn-secondary">
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
        <div className={styles.backgroundOrbs}>
          <div className={styles.orb1}></div>
          <div className={styles.orb2}></div>
          <div className={styles.orb3}></div>
        </div>
        
        <div className="container">
          <h1 className={styles.heroTitle}>
            Structured Mentorship for <span className="text-gradient">Ambitious Startups</span>
          </h1>
          <p className={styles.heroSubtitle}>
            Connecting high-potential startups with experienced Angel Investors and VC professionals for guided growth, smart matching, and actionable insights.
          </p>
          <div className={styles.heroActions}>
            <Link href="/auth/register?role=startup" className="btn btn-primary">
              For Startups
            </Link>
            <Link href="/auth/register?role=mentor" className="btn btn-secondary">
              For Mentors
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section id="stats-section" className={styles.section} ref={statsRef}>
        <div className="container">
          <div className={`${styles.statsGrid} stagger-children`}>
            <div className={`glass-card ${styles.statCard} reveal`}>
              <div className={styles.statValue}>{counters.mentors}+</div>
              <div className={styles.statLabel}>Expert Mentors</div>
            </div>
            <div className={`glass-card ${styles.statCard} reveal`}>
              <div className={styles.statValue}>{counters.startups}+</div>
              <div className={styles.statLabel}>Startups Funded</div>
            </div>
            <div className={`glass-card ${styles.statCard} reveal`}>
              <div className={styles.statValue}>{counters.sessions}+</div>
              <div className={styles.statLabel}>Mentorship Sessions</div>
            </div>
            <div className={`glass-card ${styles.statCard} reveal`}>
              <div className={styles.statValue}>{counters.satisfaction}%</div>
              <div className={styles.statLabel}>Satisfaction Rate</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className={styles.section}>
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`}>
            <h2 className={styles.sectionTitle}>How It Works</h2>
            <p className={styles.sectionSubtitle}>A streamlined process to accelerate your startup&apos;s growth journey with the right guidance.</p>
          </div>
          
          <div className={`${styles.stepsGrid} stagger-children`}>
            <div className={`glass-card ${styles.stepCard} reveal`}>
              <div className={styles.stepNumber}>01</div>
              <div className={styles.stepIcon}>
                <svg xmlns="http://www.w3.org/-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="19" y1="8" x2="19" y2="14"/><line x1="22" y1="11" x2="16" y2="11"/></svg>
              </div>
              <h3 className={styles.stepTitle}>Register & Apply</h3>
              <p className={styles.stepDesc}>Create your profile, upload your pitch deck, and tell us about your startup&apos;s vision and current challenges.</p>
            </div>
            
            <div className={`glass-card ${styles.stepCard} reveal`}>
              <div className={styles.stepNumber}>02</div>
              <div className={styles.stepIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/><polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/></svg>
              </div>
              <h3 className={styles.stepTitle}>Get Matched</h3>
              <p className={styles.stepDesc}>Our smart algorithm pairs you with mentors who have the specific industry experience and network you need.</p>
            </div>
            
            <div className={`glass-card ${styles.stepCard} reveal`}>
              <div className={styles.stepNumber}>03</div>
              <div className={styles.stepIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
              </div>
              <h3 className={styles.stepTitle}>Start Growing</h3>
              <p className={styles.stepDesc}>Schedule sessions, track your milestones, and leverage expert advice to scale your business efficiently.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className={styles.section}>
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`}>
            <h2 className={styles.sectionTitle}>Platform Features</h2>
            <p className={styles.sectionSubtitle}>Everything you need to manage mentorships, track progress, and facilitate investments.</p>
          </div>
          
          <div className={`${styles.featuresGrid} stagger-children`}>
            <div className={`glass-card ${styles.featureCard} reveal`}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Smart Matching</h3>
              <p className={styles.featureDesc}>AI-driven recommendations connecting startups with the most relevant investors and industry experts.</p>
            </div>
            
            <div className={`glass-card ${styles.featureCard} reveal`}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Calendly Integration</h3>
              <p className={styles.featureDesc}>Seamlessly book, reschedule, and manage mentorship sessions directly through the platform.</p>
            </div>
            
            <div className={`glass-card ${styles.featureCard} reveal`}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Pitch Deck Repository</h3>
              <p className={styles.featureDesc}>Securely store, update, and share your pitch decks and financial documents with mentors.</p>
            </div>
            
            <div className={`glass-card ${styles.featureCard} reveal`}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Real-time Analytics</h3>
              <p className={styles.featureDesc}>Track engagement metrics, session feedback, and startup growth milestones in one dashboard.</p>
            </div>
            
            <div className={`glass-card ${styles.featureCard} reveal`}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Role-based Access</h3>
              <p className={styles.featureDesc}>Customized portals for Startups, Mentors, and Admins to ensure privacy and focus.</p>
            </div>
            
            <div className={`glass-card ${styles.featureCard} reveal`}>
              <div className={styles.featureIcon}>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              </div>
              <h3 className={styles.featureTitle}>Progress Tracking</h3>
              <p className={styles.featureDesc}>Set goals, track action items from sessions, and measure your startup&apos;s velocity over time.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Portal Cards Section */}
      <section className={styles.section}>
        <div className="container">
          <div className={`${styles.sectionHeader} reveal`}>
            <h2 className={styles.sectionTitle}>Access Your Portal</h2>
            <p className={styles.sectionSubtitle}>Dedicated workspaces designed for your specific role and needs.</p>
          </div>
          
          <div className={`${styles.portalCardsGrid} stagger-children`}>
            <div className={`${styles.portalCard} reveal`}>
              <h3 className={styles.portalTitle}>Startup Portal</h3>
              <p className={styles.portalDesc}>Manage your profile, upload decks, find mentors, and schedule sessions to accelerate your growth.</p>
              <Link href="/dashboard/startup" className={styles.portalLink}>
                Enter Portal
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            
            <div className={`${styles.portalCard} reveal`}>
              <h3 className={styles.portalTitle}>Mentor Portal</h3>
              <p className={styles.portalDesc}>Review startup applications, manage your availability, and provide feedback on pitch decks.</p>
              <Link href="/dashboard/mentor" className={styles.portalLink}>
                Enter Portal
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
            
            <div className={`${styles.portalCard} reveal`}>
              <h3 className={styles.portalTitle}>Admin Panel</h3>
              <p className={styles.portalDesc}>Oversee the platform, approve mentors, monitor engagement, and manage system settings.</p>
              <Link href="/admin" className={styles.portalLink}>
                Enter Panel
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className="container">
          <div className={styles.footerContent}>
            <Link href="/" className={styles.logo}>
              MENTORSHIP PORTAL
            </Link>
            <div className={styles.footerLinks}>
              <Link href="/privacy" className={styles.footerLink}>Privacy Policy</Link>
              <Link href="/terms" className={styles.footerLink}>Terms of Service</Link>
              <Link href="/contact" className={styles.footerLink}>Contact Us</Link>
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
