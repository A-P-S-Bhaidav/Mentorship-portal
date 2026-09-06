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
  const { signUp } = useAuth();
  
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
