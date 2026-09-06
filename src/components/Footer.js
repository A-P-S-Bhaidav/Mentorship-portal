'use client';
import Link from 'next/link';
import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styles from './Footer.module.css';

export default function Footer() {
  const footerRef = useRef(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add(styles.visible);
          }
        });
      },
      { threshold: 0.1 }
    );

    if (footerRef.current) {
      observer.observe(footerRef.current);
    }

    return () => {
      if (footerRef.current) {
        observer.unobserve(footerRef.current);
      }
    };
  }, []);

  return (
    <footer className={styles.footer} ref={footerRef}>
      <div className={styles.container}>
        <div className={styles.topSection}>
          <div className={styles.brand}>
            <Image 
              src="/ecell_logo_transparent.png" 
              alt="E-Cell IIT Kharagpur" 
              width={250} 
              height={70} 
              className={styles.logo}
            />
            <p className={styles.tagline}>
              Empowering the student community to develop an entrepreneurial mindset.
            </p>
          </div>
          
          <div className={styles.linksGrid}>
            <div className={styles.linkColumn}>
              <h3>Platform</h3>
              <Link href="/auth/login">Login</Link>
              <Link href="/auth/register">Join as Mentor</Link>
              <Link href="/auth/register">Apply as Startup</Link>
            </div>
            
            <div className={styles.linkColumn}>
              <h3>Initiatives</h3>
              <a href="#" className={styles.animatedLink}>EAD (Entrepreneurship Awareness Drive)</a>
              <a href="#" className={styles.animatedLink}>LSM (Local Startups Meet)</a>
              <a href="#" className={styles.animatedLink}>Empresario</a>
              <a href="#" className={styles.animatedLink}>Global Entrepreneurship Summit (GES)</a>
            </div>

            <div className={styles.linkColumn}>
              <h3>Legal</h3>
              <Link href="#">Privacy Policy</Link>
              <Link href="#">Terms of Service</Link>
              <Link href="#">Contact Us</Link>
            </div>
          </div>
        </div>
        
        <div className={styles.bottomSection}>
          <p>&copy; {new Date().getFullYear()} Entrepreneurship Cell, IIT Kharagpur. All Rights Reserved.</p>
          <div className={styles.socials}>
            {/* Social placeholders */}
            <a href="#" aria-label="Facebook"><span className={styles.socialIcon}>F</span></a>
            <a href="#" aria-label="Twitter"><span className={styles.socialIcon}>X</span></a>
            <a href="#" aria-label="LinkedIn"><span className={styles.socialIcon}>in</span></a>
          </div>
        </div>
      </div>
    </footer>
  );
}
