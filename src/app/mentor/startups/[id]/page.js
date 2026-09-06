'use client';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import styles from './detail.module.css';

export default function StartupDetail({ params }) {
  const router = useRouter();
  const [startup, setStartup] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStartup() {
      try {
        const { data, error } = await supabase
          .from('startups')
          .select('*')
          .eq('id', params.id)
          .single();
        if (error) throw error;
        setStartup(data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchStartup();
  }, [params.id]);

  if (loading) {
    return <div className={styles.loading}>Loading startup details...</div>;
  }
  if (!startup) {
    return <div className={styles.error}>Startup not found.</div>;
  }

  return (
    <div className={styles.container}>
      <button onClick={() => router.back()} className={styles.backBtn}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
        Back
      </button>
      
      <header className={styles.header}>
        <h1>{startup.company_name}</h1>
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
        </div>
      </div>
    </div>
  );
}
