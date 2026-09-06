'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './profile.module.css';

export default function StartupProfile() {
  const { user, profile: authProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    company_name: '',
    industry: '',
    stage: '',
    description: '',
    pitch_deck_url: '',
    full_name: '',
  });

  useEffect(() => {
    async function fetchProfileData() {
      if (!user) return;
      try {
        const { data: startupData, error: startupErr } = await supabase
          .from('startups')
          .select('*')
          .eq('id', user.id)
          .single();

        if (startupData) {
          setFormData(prev => ({
            ...prev,
            company_name: startupData.startup_name || '',
            industry: startupData.sector || '',
            stage: startupData.stage || '',
            description: startupData.description || '',
            pitch_deck_url: startupData.pitch_deck_url || '',
          }));
        }

        if (authProfile) {
          setFormData(prev => ({
            ...prev,
            full_name: authProfile.full_name || '',
          }));
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
      }
    }
    fetchProfileData();
  }, [user, authProfile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage('');
    setError('');

    try {
      // Update startup table
      const { error: startupError } = await supabase
        .from('startups')
        .update({
          startup_name: formData.company_name,
          sector: formData.industry,
          stage: formData.stage,
          description: formData.description,
          pitch_deck_url: formData.pitch_deck_url,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (startupError) throw startupError;

      // Update profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          full_name: formData.full_name,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (profileError) throw profileError;

      setMessage('Profile updated successfully!');
      setIsEditing(false);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Save error:', err);
      setError('Failed to save profile updates.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Company Profile</h1>
          <p>Manage your startup details and presentation materials</p>
        </div>
        <button 
          onClick={() => setIsEditing(!isEditing)} 
          className={styles.toggleBtn}
        >
          {isEditing ? 'Cancel Edit' : 'Edit Profile'}
        </button>
      </header>

      {message && <div className={styles.successMessage}>{message}</div>}
      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.card}>
        <form onSubmit={handleSave} className={styles.form}>
          
          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Basic Information</h3>
            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Company Name</label>
                <input 
                  type="text" 
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.input}
                  placeholder="Acme Corp"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Founder Name</label>
                <input 
                  type="text" 
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.input}
                  placeholder="Jane Doe"
                />
              </div>
            </div>

            <div className={styles.grid2}>
              <div className={styles.inputGroup}>
                <label>Industry</label>
                <input 
                  type="text" 
                  name="industry"
                  value={formData.industry}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.input}
                  placeholder="e.g. Fintech, Edtech"
                />
              </div>
              <div className={styles.inputGroup}>
                <label>Stage</label>
                <select
                  name="stage"
                  value={formData.stage}
                  onChange={handleChange}
                  disabled={!isEditing}
                  className={styles.input}
                >
                  <option value="">Select Stage...</option>
                  <option value="Idea">Idea / Concept</option>
                  <option value="MVP">MVP / Prototype</option>
                  <option value="Early Traction">Early Traction</option>
                  <option value="Scaling">Scaling</option>
                </select>
              </div>
            </div>



            <div className={styles.inputGroup}>
              <label>Company Description</label>
              <textarea 
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={!isEditing}
                className={styles.textarea}
                placeholder="Briefly describe your product, market, and vision..."
                rows={4}
              />
            </div>
          </div>

          <div className={styles.divider}></div>

          <div className={styles.formSection}>
            <h3 className={styles.sectionTitle}>Presentation Materials</h3>
            <div className={styles.inputGroup}>
              <label className={styles.highlightLabel}>
                Pitch Deck (Google Drive Link)
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path>
                  <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path>
                </svg>
              </label>
              <input 
                type="url" 
                name="pitch_deck_url"
                value={formData.pitch_deck_url}
                onChange={handleChange}
                disabled={!isEditing}
                className={styles.input}
                placeholder="https://docs.google.com/presentation/d/..."
              />
              <span className={styles.helperText}>Paste your Google Drive share link. Make sure access is set to "Anyone with the link".</span>
            </div>
          </div>

          {isEditing && (
            <div className={styles.formActions}>
              <button 
                type="submit" 
                className={styles.saveBtn}
                disabled={saving}
              >
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
