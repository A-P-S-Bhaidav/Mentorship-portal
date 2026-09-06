'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import styles from './layout.module.css';

export default function StartupLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (profile?.role && profile.role !== 'startup') {
        router.replace('/auth/login');
      }
    }
  }, [user, profile, loading, router]);

  if (!isClient || loading || !user || profile?.role !== 'startup') {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your portal...</p>
      </div>
    );
  }

  return (
    <div className={styles.layout}>
      <Sidebar role="startup" />
      <main className={styles.main}>
        <div className={styles.contentWrapper}>
          <div className={styles.enterAnimation}>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
