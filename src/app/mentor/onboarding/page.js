'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './onboarding.module.css';

export default function MentorOnboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    firm: '',
    role_type: '',
    expertise: '',
    bio: '',
    calendly_link: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.firm || !formData.role_type || !formData.bio) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Convert expertise comma separated string to array
      const expertiseArray = formData.expertise 
        ? formData.expertise.split(',').map(e => e.trim()).filter(Boolean)
        : [];

      const { error: updateError } = await supabase
        .from('mentors')
        .update({
          firm: formData.firm,
          role_type: formData.role_type,
          expertise: expertiseArray,
          bio: formData.bio,
          calendly_link: formData.calendly_link
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Successfully updated, router will pick up the change or we can manually push
      router.push('/mentor/dashboard');
      
    } catch (err) {
      setError(err.message || 'Failed to save details. Please try again.');
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.onboardingCard}>
        <div className={styles.header}>
          <h1 className={styles.title}>Welcome to Mentorship Portal</h1>
          <p className={styles.subtitle}>Tell us about your professional background and expertise.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="firm">Firm / Company *</label>
              <input 
                id="firm" name="firm" type="text" 
                className={styles.input} value={formData.firm} onChange={handleChange}
                placeholder="e.g. Sequoia Capital" required
              />
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="role_type">Your Role *</label>
              <select id="role_type" name="role_type" className={styles.input} value={formData.role_type} onChange={handleChange} required>
                <option value="">Select a role...</option>
                <option value="Angel Investor">Angel Investor</option>
                <option value="VC Partner">VC Partner</option>
                <option value="Industry Expert">Industry Expert</option>
                <option value="Founding Partner">Founding Partner</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="expertise">Expertise Tags (comma separated)</label>
            <input 
              id="expertise" name="expertise" type="text" 
              className={styles.input} value={formData.expertise} onChange={handleChange}
              placeholder="e.g. B2B SaaS, Go-to-Market, Seed Funding"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="calendly_link">Calendly Link (Optional)</label>
            <input 
              id="calendly_link" name="calendly_link" type="url" 
              className={styles.input} value={formData.calendly_link} onChange={handleChange}
              placeholder="https://calendly.com/your-name"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="bio">Professional Bio *</label>
            <textarea 
              id="bio" name="bio" rows="4"
              className={styles.textarea} value={formData.bio} onChange={handleChange}
              placeholder="Briefly describe your background, investments, or how you help founders..." required
            />
          </div>

          <button type="submit" className={styles.btn} disabled={loading}>
            {loading ? 'Saving...' : 'Complete Setup'}
          </button>
        </form>
      </div>
    </div>
  );
}
