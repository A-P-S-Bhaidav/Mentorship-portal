'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import styles from './layout.module.css';

export default function MentorLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && mounted) {
      if (!user) {
        router.push('/auth/login');
      } else if (profile && profile.role !== 'mentor') {
        router.push(`/${profile.role}/dashboard`);
      }
    }
  }, [user, profile, loading, router, mounted]);

  if (!mounted || loading || !profile) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Mentor Portal...</p>
      </div>
    );
  }

  if (profile.role !== 'mentor') {
    return null;
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="mentor" />
      <main className={styles.main}>
        <div className={styles.pageTransition}>
          {children}
        </div>
      </main>
    </div>
  );
}
