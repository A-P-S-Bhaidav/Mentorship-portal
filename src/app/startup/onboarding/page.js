'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './onboarding.module.css';

export default function StartupOnboarding() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    startup_name: '',
    sector: '',
    stage: '',
    team_size: '',
    description: ''
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.startup_name || !formData.sector || !formData.stage || !formData.description) {
      setError('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('startups')
        .update({
          startup_name: formData.startup_name,
          sector: formData.sector,
          stage: formData.stage,
          team_size: formData.team_size,
          description: formData.description
        })
        .eq('id', user.id);
        
      if (updateError) throw updateError;
      
      // Successfully updated, router will pick up the change or we can manually push
      router.push('/startup/dashboard');
      
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
          <p className={styles.subtitle}>Let's set up your startup profile before you continue.</p>
        </div>

        <form onSubmit={handleSubmit} className={styles.form}>
          {error && <div className={styles.error}>{error}</div>}
          
          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="startup_name">Startup Name *</label>
            <input 
              id="startup_name" name="startup_name" type="text" 
              className={styles.input} value={formData.startup_name} onChange={handleChange}
              placeholder="e.g. Acme Corp" required
            />
          </div>

          <div className={styles.row}>
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="sector">Sector / Industry *</label>
              <select id="sector" name="sector" className={styles.input} value={formData.sector} onChange={handleChange} required>
                <option value="">Select an industry...</option>
                <option value="Fintech">Fintech</option>
                <option value="Healthtech">Healthtech</option>
                <option value="Edtech">Edtech</option>
                <option value="E-commerce">E-commerce</option>
                <option value="SaaS">SaaS (Enterprise)</option>
                <option value="AI / ML">AI / ML</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div className={styles.inputGroup}>
              <label className={styles.label} htmlFor="stage">Current Stage *</label>
              <select id="stage" name="stage" className={styles.input} value={formData.stage} onChange={handleChange} required>
                <option value="">Select current stage...</option>
                <option value="Idea/Concept">Idea / Concept</option>
                <option value="Pre-seed">Pre-seed</option>
                <option value="Seed">Seed</option>
                <option value="Series A">Series A</option>
                <option value="Series B+">Series B+</option>
              </select>
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="team_size">Team Size</label>
            <input 
              id="team_size" name="team_size" type="text" 
              className={styles.input} value={formData.team_size} onChange={handleChange}
              placeholder="e.g. 1-10"
            />
          </div>

          <div className={styles.inputGroup}>
            <label className={styles.label} htmlFor="description">Elevator Pitch (Description) *</label>
            <textarea 
              id="description" name="description" rows="4"
              className={styles.textarea} value={formData.description} onChange={handleChange}
              placeholder="Briefly describe what your startup does..." required
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
