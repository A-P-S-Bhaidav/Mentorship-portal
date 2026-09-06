'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from '../dashboard/dashboard.module.css';

export default function MentorStartups() {
  const { profile } = useAuth();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (profile?.id) {
      fetchStartups();
    }
  }, [profile]);

  const fetchStartups = async () => {
    try {
      setLoading(true);
      const { data: assignments, error } = await supabase
        .from('assignments')
        .select(`
          id,
          startups:startup_id (
            id,
            startup_name,
            sector,
            stage,
            founder_name,
            pitch_deck_url
          )
        `)
        .eq('mentor_id', profile.id)
        .eq('status', 'active');

      if (error) throw error;
      
      const assignedStartups = assignments?.map(a => a.startups) || [];
      setStartups(assignedStartups);
    } catch (err) {
      console.error('Error fetching assigned startups:', err);
    } finally {
      setLoading(false);
    }
  };

  const externalIcon = (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
  );

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>My Startups</h1>
        <p>Manage your assigned mentees and view their details.</p>
      </header>

      <section className={styles.startupsSection}>
        {loading ? (
          <div className={styles.grid}>
            {[1, 2, 3].map(i => (
              <div key={i} className={styles.skeletonCard}></div>
            ))}
          </div>
        ) : startups.length > 0 ? (
          <div className={styles.grid}>
            {startups.map((startup, index) => (
              <div 
                key={startup.id} 
                className={styles.startupCard}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className={styles.cardHeader}>
                  <h3>{startup.startup_name}</h3>
                  <div className={styles.badges}>
                    <span className={styles.badge}>{startup.sector}</span>
                    <span className={styles.badgeOutline}>{startup.stage}</span>
                  </div>
                </div>
                <div className={styles.cardBody}>
                  <div className={styles.founder}>
                    <span className={styles.label}>Founder:</span>
                    <span className={styles.value}>{startup.founder_name}</span>
                  </div>
                </div>
                <div className={styles.cardFooter}>
                  <Link href={`/mentor/startups/${startup.id}`} className={styles.btnPrimary}>
                    View Details
                  </Link>
                  {startup.pitch_deck_url && (
                    <a 
                      href={startup.pitch_deck_url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className={styles.btnSecondary}
                    >
                      Pitch Deck {externalIcon}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <h3>No Startups Assigned Yet</h3>
            <p>You will be notified once a startup is matched with you.</p>
          </div>
        )}
      </section>
    </div>
  );
}
