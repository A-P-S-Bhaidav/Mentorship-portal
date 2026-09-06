'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from './detail.module.css';

export default function StartupDetail({ params }) {
  const router = useRouter();
  const { user } = useAuth();
  const [startup, setStartup] = useState(null);
  const [mentorCalLink, setMentorCalLink] = useState('');
  const [loading, setLoading] = useState(true);
  
  const unwrappedParams = React.use(params);
  const startupId = unwrappedParams?.id;

  useEffect(() => {
    async function fetchStartup() {
      if (!startupId || !user) return;
      
      try {
        // Query through assignments to satisfy RLS policy
        const { data: assignment, error: assignError } = await supabase
          .from('assignments')
          .select(`
            id,
            startups:startup_id (
              id, startup_name, founder_name, sector, stage, 
              description, pitch_deck_url, website, email
            )
          `)
          .eq('startup_id', startupId)
          .eq('mentor_id', user.id)
          .eq('status', 'active')
          .single();

        if (assignError) {
          // Fallback: try direct query (for admins or if RLS allows)
          const { data: directData, error: directError } = await supabase
            .from('startups')
            .select('*')
            .eq('id', startupId)
            .single();
          
          if (!directError && directData) {
            setStartup(directData);
          }
        } else if (assignment?.startups) {
          setStartup(assignment.startups);
        }

        // Fetch mentor's own calendly link
        const { data: mentorData } = await supabase
          .from('mentors')
          .select('cal_link')
          .eq('id', user.id)
          .single();
        
        if (mentorData?.cal_link) {
          setMentorCalLink(mentorData.cal_link);
        }
      } catch (err) {
        console.error('Error fetching startup:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStartup();
  }, [startupId, user]);

  if (loading) {
    return <div className={styles.loading}>Loading startup details...</div>;
  }
  if (!startup) {
    return <div className={styles.error}>Startup not found or you don&apos;t have access.</div>;
  }

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back
      </button>
      
      <header className={styles.header}>
        <h1>{startup.startup_name}</h1>
        <div className={styles.badges}>
          <span className={styles.badge}>{startup.sector}</span>
          <span className={styles.badgeOutline}>{startup.stage}</span>
        </div>
      </header>

      <div className={styles.contentGrid}>
        <div className={styles.detailsCard}>
          <h2>Startup Details</h2>
          <div className={styles.infoGrid}>
            <div className={styles.infoItem}>
              <span className={styles.label}>Founder</span>
              <span className={styles.value}>{startup.founder_name}</span>
            </div>
            <div className={styles.infoItem}>
              <span className={styles.label}>Email</span>
              <span className={styles.value}>{startup.email || 'N/A'}</span>
            </div>
            {startup.website && (
              <div className={styles.infoItem}>
                <span className={styles.label}>Website</span>
                <a href={startup.website} target="_blank" rel="noopener noreferrer" className={styles.value} style={{color: 'var(--accent-primary)'}}>
                  {startup.website}
                </a>
              </div>
            )}
            <div className={styles.infoItem}>
              <span className={styles.label}>Description</span>
              <span className={styles.value}>{startup.description || 'No description provided.'}</span>
            </div>
          </div>
        </div>

        <div className={styles.sideCard}>
          <h2>Pitch Deck</h2>
          {startup.pitch_deck_url ? (
            <a href={startup.pitch_deck_url} target="_blank" rel="noopener noreferrer" className={styles.pitchBtn}>
              View Pitch Deck
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
            </a>
          ) : (
            <p className={styles.noData}>No pitch deck available.</p>
          )}

          {mentorCalLink && (
            <>
              <h2 style={{marginTop: '2rem'}}>Schedule Meeting</h2>
              <a href={mentorCalLink} target="_blank" rel="noopener noreferrer" className={styles.pitchBtn}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>
                Open Cal.com
              </a>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
