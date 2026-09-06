'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import styles from './layout.module.css';

export default function StartupLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(null);

  useEffect(() => {
    setIsClient(true);
  }, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!loading && user && profile?.role === 'startup') {
        try {
          const { data, error } = await supabase
            .from('startups')
            .select('sector')
            .eq('id', user.id)
            .single();
            
          if (!error && data) {
            const hasCompleted = !!data.sector && data.sector.trim() !== '';
            setOnboardingComplete(hasCompleted);
            
            if (!hasCompleted && pathname !== '/startup/onboarding') {
              router.replace('/startup/onboarding');
            } else if (hasCompleted && pathname === '/startup/onboarding') {
              router.replace('/startup/dashboard');
            }
          } else {
             // Fallback
             setOnboardingComplete(true);
          }
        } catch (err) {
          console.error('Onboarding check failed', err);
          setOnboardingComplete(true); // Fail open to avoid blocking completely if DB fails
        }
      }
    };
    
    checkOnboarding();
  }, [user, profile, loading, router, pathname]);

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.replace('/auth/login');
      } else if (profile?.role && profile.role !== 'startup') {
        router.replace('/auth/login');
      }
    }
  }, [user, profile, loading, router]);

  if (!isClient || loading || !user || profile?.role !== 'startup' || onboardingComplete === null) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading your portal...</p>
      </div>
    );
  }

  // If on the onboarding page, we don't render the Sidebar
  if (pathname === '/startup/onboarding') {
    return (
      <div className={styles.layout}>
        <main className={styles.main} style={{ marginLeft: 0, width: '100%' }}>
          <div className={styles.contentWrapper}>
            <div className={styles.enterAnimation}>
              {children}
            </div>
          </div>
        </main>
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
