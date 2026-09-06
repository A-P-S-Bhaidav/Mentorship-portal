'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';

export default function Login() {
  const router = useRouter();
  const { signIn, signInWithOAuth } = useAuth();
  
  const [role, setRole] = useState('startup');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRoleChange = (newRole) => {
    setRole(newRole);
    setError('');
  };

  const getIndicatorStyle = () => {
    switch (role) {
      case 'mentor': return { left: '0%', width: '33.33%' };
      case 'startup': return { left: '33.33%', width: '33.33%' };
      case 'admin': return { left: '66.66%', width: '33.33%' };
      default: return { left: '33.33%', width: '33.33%' };
    }
  };

  const handleOAuthSignIn = async (provider) => {
    try {
      setLoading(true);
      setError('');
      await signInWithOAuth(provider);
    } catch (err) {
      setError(err.message || 'Failed to sign in with provider.');
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signInError, user } = await signIn(email, password);
      
      if (signInError) throw signInError;

      // Note: In a real app with Supabase, the role would be fetched from a profiles table.
      // Here we assume the signIn was successful and redirect based on the selected role tab for demonstration,
      // or rely on a user.user_metadata.role if available.
      
      const userRole = user?.user_metadata?.role || role;
      
      if (userRole === 'mentor') router.push('/mentor/dashboard');
      else if (userRole === 'startup') router.push('/startup/dashboard');
      else if (userRole === 'admin') router.push('/admin/dashboard');
      else router.push('/');
      
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <Link href="/" style={{ textDecoration: 'none' }}>
            <h1 className={styles.logo}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="url(#gradient)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <defs>
                  <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#6366f1" />
                    <stop offset="100%" stopColor="#8b5cf6" />
                  </linearGradient>
                </defs>
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
              EMPRESSARIO
            </h1>
          </Link>
          <p className={styles.subtitle}>Welcome back to the portal</p>
        </div>

        <div className={styles.roleSelector}>
          <button 
            type="button"
            className={`${styles.roleTab} ${role === 'mentor' ? styles.active : ''}`}
            onClick={() => handleRoleChange('mentor')}
          >
            Mentor
          </button>
          <button 
            type="button"
            className={`${styles.roleTab} ${role === 'startup' ? styles.active : ''}`}
            onClick={() => handleRoleChange('startup')}
          >
            Startup
          </button>
          <button 
            type="button"
            className={`${styles.roleTab} ${role === 'admin' ? styles.active : ''}`}
            onClick={() => handleRoleChange('admin')}
          >
            Admin
          </button>
          <div className={styles.indicator} style={getIndicatorStyle()} />
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="email">Email Address</label>
            <input 
              id="email"
              type="email" 
              className={styles.input} 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="name@example.com"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="password">Password</label>
            <input 
              id="password"
              type="password" 
              className={styles.input} 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? (
              <>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <div className={styles.divider}>
          <span>or</span>
        </div>

        <button 
          type="button" 
          className={styles.oauthBtn} 
          onClick={() => handleOAuthSignIn('google')}
          disabled={loading}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
            <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
            <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
            <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
          </svg>
          Continue with Google
        </button>

        <div className={styles.footer}>
          {role !== 'admin' && (
            <Link href={`/auth/register/${role}`} className={styles.link}>
              Don't have an account? <span className={styles.linkAccent}>Register as {role === 'mentor' ? 'Mentor' : 'Startup'}</span>
            </Link>
          )}
          <Link href="/" className={styles.link}>
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
