'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './callback.module.css';

export default function AuthCallback() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();

  useEffect(() => {
    // If not loading, decide where to send them
    if (!loading) {
      if (user && profile) {
        // Authenticated and profile loaded, route them to their dashboard
        if (profile.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (profile.role === 'mentor') {
          router.push('/mentor/dashboard');
        } else if (profile.role === 'startup') {
          router.push('/startup/dashboard');
        } else {
          // Fallback if role is 'pending' or unknown
          router.push('/');
        }
      } else if (!user) {
        // Not authenticated, send back to login
        router.push('/auth/login');
      }
    }
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
