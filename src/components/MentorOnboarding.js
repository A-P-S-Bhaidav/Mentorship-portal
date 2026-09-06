'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/auth/register/mentor/register-mentor.module.css';

const EXPERTISE_OPTIONS = [
  'Technology', 'Healthcare', 'Fintech', 'EdTech', 
  'SaaS', 'E-commerce', 'AI/ML', 'CleanTech', 
  'Consumer', 'Enterprise', 'DeepTech', 'Biotech'
];

export default function MentorOnboarding({ onComplete }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    company: '',
    roleType: '',
    expertise: [],
    bio: '',
    linkedinUrl: '',
    calLink: '',
    maxStartups: '4'
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

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
    if (!formData.company || !formData.roleType) {
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
      const { error: updateError } = await supabase
        .from('mentors')
        .update({
          firm: formData.company,
          role_type: formData.roleType,
          expertise: formData.expertise,
          bio: formData.bio,
          linkedin_url: formData.linkedinUrl,
          cal_link: formData.calLink,
          max_startups: parseInt(formData.maxStartups, 10) || 4
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      if (onComplete) onComplete();
    } catch (err) {
      setError(err.message || 'An error occurred during onboarding.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.glassCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Complete Your Profile</h1>
          <p className={styles.subtitle}>Welcome to the Mentorship Portal. Tell us about your professional background.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.section}>
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
                <label className={styles.label} htmlFor="calLink">Cal.com Link</label>
                <input 
                  id="calLink"
                  name="calLink"
                  type="url" 
                  className={styles.input} 
                  value={formData.calLink}
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
                <svg className={styles.spinner} viewBox="0 0 50 50">
                  <circle className={styles.path} cx="25" cy="25" r="20" fill="none" strokeWidth="5"></circle>
                </svg>
                Saving...
              </>
            ) : 'Complete Profile'}
          </button>
        </form>
      </div>
    </div>
  );
}
