'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from './profile.module.css';

export default function MentorProfile() {
  const { profile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    bio: '',
    expertise: '',
    calendly_link: '',
    max_startups: 3
  });
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (profile) {
      setFormData({
        bio: profile.bio || '',
        expertise: profile.expertise?.join(', ') || '',
        calendly_link: profile.calendly_link || '',
        max_startups: profile.max_startups || 3
      });
    }
  }, [profile]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const expertiseArray = formData.expertise.split(',').map(s => s.trim()).filter(Boolean);
      
      const { error } = await supabase
        .from('mentors')
        .update({
          bio: formData.bio,
          expertise: expertiseArray,
          calendly_link: formData.calendly_link,
          max_startups: parseInt(formData.max_startups) || 3
        })
        .eq('id', profile.id);

      if (error) throw error;
      
      setIsEditing(false);
      setToast('Profile updated successfully');
      setTimeout(() => setToast(null), 3000);
    } catch (err) {
      console.error(err);
      setToast('Failed to update profile');
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const copyCalendly = () => {
    navigator.clipboard.writeText(formData.calendly_link);
    setToast('Link copied!');
    setTimeout(() => setToast(null), 2000);
  };

  if (!profile) return null;

  return (
    <div className={styles.container}>
      {toast && <div className={styles.toast}>{toast}</div>}
      
      <header className={styles.header}>
        <h1>My Profile</h1>
        <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={styles.primaryBtn} disabled={loading}>
          {loading ? 'Saving...' : (isEditing ? 'Save Changes' : 'Edit Profile')}
        </button>
        {isEditing && (
          <button onClick={() => setIsEditing(false)} className={styles.secondaryBtn}>Cancel</button>
        )}
      </header>

      <div className={styles.card}>
        <div className={styles.field}>
          <label>Name</label>
          <div className={styles.readOnly}>{profile.name}</div>
        </div>
        
        <div className={styles.field}>
          <label>Email</label>
          <div className={styles.readOnly}>{profile.email}</div>
        </div>

        <div className={styles.field}>
          <label>Bio</label>
          {isEditing ? (
            <textarea name="bio" value={formData.bio} onChange={handleChange} className={styles.input} rows="4" />
          ) : (
            <div className={styles.value}>{formData.bio || 'No bio provided'}</div>
          )}
        </div>

        <div className={styles.field}>
          <label>Expertise (comma separated)</label>
          {isEditing ? (
            <input type="text" name="expertise" value={formData.expertise} onChange={handleChange} className={styles.input} />
          ) : (
            <div className={styles.badges}>
              {formData.expertise ? formData.expertise.split(',').map(e => (
                <span key={e} className={styles.badge}>{e.trim()}</span>
              )) : 'None'}
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label>Calendly Scheduling Link</label>
          {isEditing ? (
            <input type="url" name="calendly_link" placeholder="https://calendly.com/your-name/30min" value={formData.calendly_link} onChange={handleChange} className={styles.input} />
          ) : (
            <div className={styles.linkWrapper}>
              <a href={formData.calendly_link} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {formData.calendly_link || 'Not set'}
              </a>
              {formData.calendly_link && (
                <button onClick={copyCalendly} className={styles.iconBtn}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path></svg>
                </button>
              )}
            </div>
          )}
        </div>

        <div className={styles.field}>
          <label>Max Startups</label>
          {isEditing ? (
            <input type="number" name="max_startups" value={formData.max_startups} onChange={handleChange} min="1" max="10" className={styles.input} />
          ) : (
            <div className={styles.value}>{formData.max_startups}</div>
          )}
        </div>
      </div>
    </div>
  );
}
