'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Sidebar from '@/components/Sidebar';
import styles from './layout.module.css';

export default function MentorLayout({ children }) {
  const { user, profile, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [onboardingComplete, setOnboardingComplete] = useState(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMounted(true);
  }, []);

  useEffect(() => {
    const checkOnboarding = async () => {
      if (!loading && mounted && user && profile?.role === 'mentor') {
        try {
          const { data, error } = await supabase
            .from('mentors')
            .select('role_type')
            .eq('id', user.id)
            .single();
            
          if (!error && data) {
            const hasCompleted = !!data.role_type && data.role_type.trim() !== '';
            setOnboardingComplete(hasCompleted);
            
            if (!hasCompleted && pathname !== '/mentor/onboarding') {
              router.replace('/mentor/onboarding');
            } else if (hasCompleted && pathname === '/mentor/onboarding') {
              router.replace('/mentor/dashboard');
            }
          } else {
             setOnboardingComplete(true);
          }
        } catch (err) {
          console.error('Onboarding check failed', err);
          setOnboardingComplete(true); 
        }
      }
    };
    
    checkOnboarding();
  }, [user, profile, loading, router, pathname, mounted]);

  useEffect(() => {
    if (!loading && mounted) {
      if (!user) {
        router.push('/auth/login');
      } else if (profile && profile.role !== 'mentor') {
        router.push(`/${profile.role}/dashboard`);
      }
    }
  }, [user, profile, loading, router, mounted]);

  if (!mounted || loading || !profile || profile.role !== 'mentor' || onboardingComplete === null) {
    return (
      <div className={styles.loadingContainer}>
        <div className={styles.spinner}></div>
        <p>Loading Mentor Portal...</p>
      </div>
    );
  }

  // If on the onboarding page, we don't render the Sidebar
  if (pathname === '/mentor/onboarding') {
    return (
      <div className={styles.layout}>
        <main className={styles.main} style={{ marginLeft: 0, width: '100%' }}>
          <div className={styles.pageTransition}>
            {children}
          </div>
        </main>
      </div>
    );
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
