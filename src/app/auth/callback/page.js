'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import styles from './callback.module.css';

export default function AuthCallback() {
  const router = useRouter();
  const { user, profile, loading, refreshProfile } = useAuth();
  const [errorDetails, setErrorDetails] = useState('');

  useEffect(() => {
    let timeoutId;
    let attempts = 0;

    if (!loading) {
      if (user && profile) {
        if (profile.role === 'admin') {
          router.push('/admin/dashboard');
        } else if (profile.role === 'mentor') {
          router.push('/mentor/dashboard');
        } else if (profile.role === 'startup') {
          router.push('/startup/dashboard');
        } else if (profile.role === 'pending') {
          // It might be resolving pending OAuth registration in AuthContext.
          // Give it a moment. If it stays pending for a few seconds, route them to register.
          timeoutId = setTimeout(() => {
             router.push('/auth/register');
          }, 3000);
        } else {
          router.push('/');
        }
      } else if (user && !profile) {
        timeoutId = setInterval(async () => {
          attempts++;
          const newProfile = await refreshProfile();
          if (!newProfile && attempts > 4) {
             setErrorDetails('Profile could not be created or fetched. The database trigger might have failed, or there is a schema error. Please contact the administrator or check the database logs.');
          }
        }, 1000);
      } else if (!user) {
        router.push('/auth/login');
      }
    }
    return () => clearInterval(timeoutId);
  }, [user, profile, loading, router, refreshProfile]);

  return (
    <div className={styles.container}>
      <div className={styles.loader}>
        {!errorDetails ? (
          <>
            <svg className={styles.spinner} viewBox="0 0 50 50">
              <circle className={styles.path} cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
            </svg>
            <p>Authenticating...</p>
          </>
        ) : (
          <div style={{ color: 'red', textAlign: 'center', maxWidth: '400px' }}>
            <h3>Authentication Error</h3>
            <p>{errorDetails}</p>
            <button onClick={() => router.push('/auth/register')} style={{ marginTop: '1rem', padding: '0.5rem 1rem' }}>Return to Registration</button>
          </div>
        )}
      </div>
    </div>
  );
}
