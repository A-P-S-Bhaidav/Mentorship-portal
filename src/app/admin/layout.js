'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (profile && profile.role !== 'admin') {
        router.push('/auth/login');
      }
    }
  }, [user, profile, loading, mounted, router]);

  if (!mounted || loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  // Wait for profile to load before rendering - don't redirect prematurely
  if (!user) {
    return null;
  }

  // Profile is still loading (user exists but profile hasn't been fetched yet)
  if (!profile) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (profile.role !== 'admin') {
    return null;
  }

  return (
    <div className={styles.adminLayout}>
      <Sidebar role="admin" />
      <main className={styles.mainContent}>
        <div className={styles.pageTransition}>
          {children}
        </div>
      </main>
    </div>
  );
}
