'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './callback.module.css';

export default function AuthCallback() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();

  useEffect(() => {
    let timeoutId;
    if (!loading) {
      if (user && profile) {
        if (profile.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (profile.role === 'mentor') {
          router.push('/mentor/dashboard');
        } else if (profile.role === 'startup') {
          router.push('/startup/dashboard');
        } else {
          router.push('/');
        }
      } else if (user && !profile) {
        // Profile might not be created by the Postgres trigger yet. Retry.
        timeoutId = setInterval(() => {
          refreshProfile();
        }, 1000);
      } else if (!user) {
        router.push('/auth/login');
      }
    }
    return () => clearTimeout(timeoutId);
  }, [user, profile, loading, router]);

  return (
    <div className={styles.container}>
      <div className={styles.loader}>
        <svg className={styles.spinner} viewBox="0 0 50 50">
          <circle className={styles.path} cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
        </svg>
        <p>Authenticating...</p>
      </div>
    </div>
  );
}
