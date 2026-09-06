'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import styles from './register-mentor.module.css';

const EXPERTISE_OPTIONS = [
  'Technology', 'Healthcare', 'Fintech', 'EdTech', 
  'SaaS', 'E-commerce', 'AI/ML', 'CleanTech', 
  'Consumer', 'Enterprise', 'DeepTech', 'Biotech'
];

export default function RegisterMentor() {
  const router = useRouter();
  const { signUp, signInWithOAuth } = useAuth();
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    company: '',
    roleType: '',
    expertise: [],
    bio: '',
    linkedinUrl: '',
    calendlyLink: '',
    maxStartups: '4'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleExpertiseChange = (option) => {
    setFormData(prev => {
      const current = prev.expertise;
      if (current.includes(option)) {
        return { ...prev, expertise: current.filter(item => item !== option) };
      } else {
        return { ...prev, expertise: [...current, option] };
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validation
    if (!formData.fullName || !formData.email || !formData.password || !formData.company || !formData.roleType) {
      setError('Please fill in all required fields.');
      return;
    }

    if (formData.expertise.length === 0) {
      setError('Please select at least one area of expertise.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: signUpError } = await signUp(formData.email, formData.password, {
        role: 'mentor',
        fullName: formData.fullName,
        company: formData.company,
        roleType: formData.roleType,
        expertise: formData.expertise,
        bio: formData.bio,
        linkedinUrl: formData.linkedinUrl,
        calendlyLink: formData.calendlyLink,
        maxStartups: parseInt(formData.maxStartups, 10)
      });
      
      if (signUpError) throw signUpError;

      router.push('/mentor/dashboard');
      
    } catch (err) {
      setError(err.message || 'Failed to register. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuthSignUp = async (provider) => {
    try {
      setLoading(true);
      setError('');
      // Save data to localStorage to be picked up by AuthContext
      localStorage.setItem('pendingOAuthRegistration', JSON.stringify({
        role: 'mentor',
        fullName: formData.fullName,
        company: formData.company,
        roleType: formData.roleType,
        expertise: formData.expertise,
        bio: formData.bio,
        linkedinUrl: formData.linkedinUrl,
        calendlyLink: formData.calendlyLink,
        maxStartups: parseInt(formData.maxStartups, 10) || 4
      }));
      await signInWithOAuth(provider);
    } catch (err) {
      setError(err.message || 'Failed to sign up with provider.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.orb1} />
      <div className={styles.orb2} />
      
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Mentor Registration</h1>
          <p className={styles.subtitle}>Join Empressario and guide the next generation of founders</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}
          
          <button 
            type="button" 
            className={styles.oauthBtn} 
            onClick={() => handleOAuthSignUp('google')}
            disabled={loading}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
            </svg>
            Sign up with Google
          </button>

          <div className={styles.divider}>
            <span>or sign up with email</span>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>1. Personal Information</h2>
            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="fullName">Full Name *</label>
                <input 
                  id="fullName"
                  name="fullName"
                  type="text" 
                  className={styles.input} 
                  value={formData.fullName}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="email">Email Address *</label>
                <input 
                  id="email"
                  name="email"
                  type="email" 
                  className={styles.input} 
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="password">Password *</label>
                <input 
                  id="password"
                  name="password"
                  type="password" 
                  className={styles.input} 
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Create a strong password"
                  required
                  minLength={6}
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>2. Professional Background</h2>
            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="company">Company / Firm Name *</label>
                <input 
                  id="company"
                  name="company"
                  type="text" 
                  className={styles.input} 
                  value={formData.company}
                  onChange={handleChange}
                  placeholder="Acme Ventures"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="roleType">Role Type *</label>
                <select 
                  id="roleType"
                  name="roleType"
                  className={styles.select}
                  value={formData.roleType}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a role...</option>
                  <option value="Angel Investor">Angel Investor</option>
                  <option value="VC Partner">VC Partner</option>
                  <option value="VC Associate">VC Associate</option>
                  <option value="Industry Expert">Industry Expert</option>
                  <option value="Serial Entrepreneur">Serial Entrepreneur</option>
                </select>
              </div>
              
              <div className={`${styles.inputGroup} ${styles.full}`}>
                <label className={styles.label}>Areas of Expertise *</label>
                <div className={styles.pillGroup}>
                  {EXPERTISE_OPTIONS.map(option => (
                    <label key={option} className={styles.pillLabel}>
                      <input 
                        type="checkbox" 
                        className={styles.pillInput}
                        checked={formData.expertise.includes(option)}
                        onChange={() => handleExpertiseChange(option)}
                      />
                      <span className={styles.pill}>{option}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className={`${styles.inputGroup} ${styles.full}`}>
                <label className={styles.label} htmlFor="bio">Professional Bio</label>
                <textarea 
                  id="bio"
                  name="bio"
                  className={styles.textarea} 
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell us about your experience and how you can help startups..."
                />
              </div>
            </div>
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>3. Mentorship & Connections</h2>
            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="linkedinUrl">LinkedIn URL</label>
                <input 
                  id="linkedinUrl"
                  name="linkedinUrl"
                  type="url" 
                  className={styles.input} 
                  value={formData.linkedinUrl}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/..."
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="calendlyLink">Calendly Link</label>
                <input 
                  id="calendlyLink"
                  name="calendlyLink"
                  type="url" 
                  className={styles.input} 
                  value={formData.calendlyLink}
                  onChange={handleChange}
                  placeholder="https://calendly.com/..."
                />
                <span className={styles.helperText}>For scheduling mentorship sessions</span>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="maxStartups">Max Startups to Mentor</label>
                <input 
                  id="maxStartups"
                  name="maxStartups"
                  type="number" 
                  min="1"
                  max="20"
                  className={styles.input} 
                  value={formData.maxStartups}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? (
              <>
                <svg className="animate-spin" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 12a9 9 0 1 1-6.219-8.56" />
                </svg>
                Registering...
              </>
            ) : (
              'Complete Registration'
            )}
          </button>
        </form>

        <div className={styles.footer}>
          <Link href="/auth/login" className={styles.link}>
            Already have an account? Sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
