import Link from 'next/link';
import styles from './register-select.module.css';

export default function RegisterSelect() {
  return (
    <div className={styles.container}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 className={styles.logo}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              EMPRESSARIO
            </h1>
          </Link>
          <p className={styles.subtitle}>Choose how you want to join</p>
        </div>

        <div className={styles.options}>
          <Link href="/auth/register/startup" className={styles.optionCard}>
            <div className={styles.iconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
                <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
                <line x1="12" y1="22.08" x2="12" y2="12"/>
              </svg>
            </div>
            <div className={styles.optionContent}>
              <h3>Startup</h3>
              <p>Find mentors, upload pitch decks, and accelerate growth.</p>
            </div>
            <div className={styles.arrow}>→</div>
          </Link>

          <Link href="/auth/register/mentor" className={styles.optionCard}>
            <div className={styles.iconWrapper}>
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
                <circle cx="9" cy="7" r="4"/>
                <line x1="19" y1="8" x2="19" y2="14"/>
                <line x1="22" y1="11" x2="16" y2="11"/>
              </svg>
            </div>
            <div className={styles.optionContent}>
              <h3>Mentor</h3>
              <p>Guide founders, review decks, and share your expertise.</p>
            </div>
            <div className={styles.arrow}>→</div>
          </Link>
        </div>

        <div className={styles.footer}>
          <Link href="/auth/login" className={styles.link}>
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
