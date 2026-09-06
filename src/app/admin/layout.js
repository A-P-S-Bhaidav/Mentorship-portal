'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import Sidebar from '@/components/Sidebar';
import styles from './layout.module.css';

export default function AdminLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && (!user || profile?.role !== 'admin')) {
      router.push('/auth/login');
    }
  }, [user, profile, loading, router]);

  if (loading) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
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
