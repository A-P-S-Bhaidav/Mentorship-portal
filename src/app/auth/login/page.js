'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './login.module.css';

export default function Login() {
  const router = useRouter();
  const { signIn } = useAuth();
  
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
