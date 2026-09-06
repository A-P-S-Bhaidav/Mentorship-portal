'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '@/app/auth/register/startup/register-startup.module.css';

export default function StartupOnboarding({ onComplete }) {
  const { user } = useAuth();
  const [formData, setFormData] = useState({
    startupName: '',
    sector: '',
    stage: '',
    teamSize: '',
    pitchDeckUrl: '',
    description: ''
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.startupName || !formData.sector || !formData.stage) {
      setError('Please fill in all required fields.');
      return;
    }
    setLoading(true);
    setError('');

    try {
      const { error: updateError } = await supabase
        .from('startups')
        .update({
          startup_name: formData.startupName,
          sector: formData.sector,
          stage: formData.stage,
          team_size: formData.teamSize,
          pitch_deck_url: formData.pitchDeckUrl,
          description: formData.description
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
          <p className={styles.subtitle}>Welcome to the Mentorship Portal. Tell us about your startup to continue.</p>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <div className={styles.error}>{error}</div>}

          <div className={styles.section}>
            <div className={styles.grid}>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="startupName">Startup Name *</label>
                <input 
                  id="startupName"
                  name="startupName"
                  type="text" 
                  className={styles.input} 
                  value={formData.startupName}
                  onChange={handleChange}
                  placeholder="NextGen Corp"
                  required
                />
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="sector">Sector *</label>
                <select 
                  id="sector"
                  name="sector"
                  className={styles.select}
                  value={formData.sector}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select a sector...</option>
                  <option value="Technology">Technology</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Fintech">Fintech</option>
                  <option value="EdTech">EdTech</option>
                  <option value="SaaS">SaaS</option>
                  <option value="E-commerce">E-commerce</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="CleanTech">CleanTech</option>
                  <option value="Consumer">Consumer</option>
                  <option value="Enterprise">Enterprise</option>
                  <option value="DeepTech">DeepTech</option>
                  <option value="Biotech">Biotech</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="stage">Current Stage *</label>
                <select 
                  id="stage"
                  name="stage"
                  className={styles.select}
                  value={formData.stage}
                  onChange={handleChange}
                  required
                >
                  <option value="" disabled>Select stage...</option>
                  <option value="Ideation">Ideation</option>
                  <option value="MVP">MVP</option>
                  <option value="Pre-Seed">Pre-Seed</option>
                  <option value="Seed">Seed</option>
                  <option value="Series A">Series A</option>
                  <option value="Series B+">Series B+</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label className={styles.label} htmlFor="teamSize">Team Size</label>
                <select 
                  id="teamSize"
                  name="teamSize"
                  className={styles.select}
                  value={formData.teamSize}
                  onChange={handleChange}
                >
                  <option value="" disabled>Select size...</option>
                  <option value="1-5">1-5</option>
                  <option value="6-10">6-10</option>
                  <option value="11-25">11-25</option>
                  <option value="26-50">26-50</option>
                  <option value="50+">50+</option>
                </select>
              </div>
              <div className={`${styles.inputGroup} ${styles.full}`}>
                <label className={styles.label} htmlFor="description">Startup Description</label>
                <textarea 
                  id="description"
                  name="description"
                  className={styles.textarea} 
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Briefly describe your product, target market, and traction..."
                />
              </div>
              <div className={`${styles.inputGroup} ${styles.full}`}>
                <label className={styles.label} htmlFor="pitchDeckUrl">Pitch Deck (Google Drive Link)</label>
                <input 
                  id="pitchDeckUrl"
                  name="pitchDeckUrl"
                  type="url" 
                  className={styles.input} 
                  value={formData.pitchDeckUrl}
                  onChange={handleChange}
                  placeholder="https://drive.google.com/..."
                />
                <span className={styles.helperText}>Paste your Google Drive share link (ensure it is accessible)</span>
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
