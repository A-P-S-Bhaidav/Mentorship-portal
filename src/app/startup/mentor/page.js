'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './mentor.module.css';

export default function StartupMentorView() {
  const { user } = useAuth();
  const router = useRouter();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMentor() {
      if (!user) return;
      try {
        const { data: assignmentData } = await supabase
          .from('assignments')
          .select('mentor_id')
          .eq('startup_id', user.id)
          .single();

        if (assignmentData?.mentor_id) {
          const { data: mentorData } = await supabase
            .from('mentors')
            .select('*')
            .eq('id', assignmentData.mentor_id)
            .single();
          setMentor(mentorData);
        }
      } catch (err) {
        console.error('Error fetching mentor:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMentor();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonHeader}></div>
        <div className={styles.skeletonBody}></div>
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className={styles.container}>
        <div className={styles.emptyState}>
          <div className={styles.emptyIcon}>
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10"></circle>
              <polyline points="12 6 12 12 16 14"></polyline>
            </svg>
          </div>
          <h2>No Mentor Assigned Yet</h2>
          <p>We are still finding the perfect mentor for your startup. Please check back later.</p>
          <button onClick={() => router.push('/startup/dashboard')} className={styles.backBtn}>
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <header className={styles.pageHeader}>
        <h1>Your Mentor</h1>
      </header>

      <div className={styles.profileCard}>
        <div className={styles.profileHeader}>
          <div className={styles.avatarLarge}>
            {mentor.firm?.charAt(0) || 'M'}
          </div>
          <div className={styles.profileInfo}>
            <h2 className={styles.name}>{mentor.role || 'Mentor Profile'}</h2>
            <p className={styles.firm}>{mentor.firm}</p>
            {mentor.linkedin_url && (
              <a href={mentor.linkedin_url} target="_blank" rel="noopener noreferrer" className={styles.linkedinLink}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
                  <rect x="2" y="9" width="4" height="12"></rect>
                  <circle cx="4" cy="4" r="2"></circle>
                </svg>
                View LinkedIn
              </a>
            )}
          </div>
        </div>

        {mentor.expertise && mentor.expertise.length > 0 && (
          <div className={styles.expertiseSection}>
            <h3>Areas of Expertise</h3>
            <div className={styles.badges}>
              {mentor.expertise.map(exp => (
                <span key={exp} className={styles.badge}>{exp}</span>
              ))}
            </div>
          </div>
        )}

        {mentor.bio && (
          <div className={styles.bioSection}>
            <h3>About</h3>
            <p className={styles.bioText}>{mentor.bio}</p>
          </div>
        )}
      </div>

      {mentor.calendly_link && (
        <div className={styles.schedulingSection}>
          <h2 className={styles.sectionTitle}>Schedule a Mentoring Session</h2>
          <div className={styles.calendlyContainer} style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '12px' }}>
            <a 
              href={mentor.calendly_link} 
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.primaryBtn || styles.backBtn}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'var(--accent-primary, #2563eb)',
                color: 'white',
                padding: '10px 20px',
                borderRadius: '6px',
                textDecoration: 'none',
                fontWeight: '500'
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
              Schedule a Meeting
            </a>
            <span style={{ color: 'var(--text-secondary, #64748b)', fontSize: '0.9rem', wordBreak: 'break-all' }}>
              {mentor.calendly_link}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
