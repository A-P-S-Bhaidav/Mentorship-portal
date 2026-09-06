'use client';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import MentorOnboarding from '@/components/MentorOnboarding';
import styles from './dashboard.module.css';

export default function MentorDashboard() {
  const { profile } = useAuth();
  const [startups, setStartups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, upcoming: 0, completed: 0 });
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (profile?.id) {
      fetchDashboardData();
    }
  }, [profile]);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      
      const { data: mentorData } = await supabase
        .from('mentors')
        .select('firm')
        .eq('id', profile.id)
        .single();
        
      if (mentorData && !mentorData.firm) {
        setShowOnboarding(true);
      }

      const { data: assignments, error } = await supabase
        .from('assignments')
        .select(`
          id,
          startup_id,
          startups:startup_id (
            id,
            company_name,
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
      
      const { data: meetings, error: meetingsError } = await supabase
        .from('meetings')
        .select('status')
        .eq('mentor_id', profile.id);
        
      if (meetingsError) throw meetingsError;
      
      const upcoming = meetings?.filter(m => m.status === 'scheduled').length || 0;
      const completed = meetings?.filter(m => m.status === 'completed').length || 0;
      
      setStats({
        total: assignedStartups.length,
        upcoming,
        completed
      });
      
    } catch (err) {
      console.error('Error fetching dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  const icons = {
    users: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>,
    calendar: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--warning)" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>,
    check: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--success)" strokeWidth="2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>,
    external: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
  };

  if (showOnboarding) {
    return <MentorOnboarding onComplete={() => window.location.reload()} />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Welcome, {profile?.name?.split(' ')[0] || 'Mentor'}</h1>
        <p>Here is an overview of your mentorship activities.</p>
      </header>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>{icons.users}</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Assigned Startups</span>
            <span className={styles.statValue}>{loading ? '-' : stats.total}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>{icons.calendar}</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Upcoming Meetings</span>
            <span className={styles.statValue}>{loading ? '-' : stats.upcoming}</span>
          </div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>{icons.check}</div>
          <div className={styles.statInfo}>
            <span className={styles.statLabel}>Completed Sessions</span>
            <span className={styles.statValue}>{loading ? '-' : stats.completed}</span>
          </div>
        </div>
      </div>

      <section className={styles.startupsSection}>
        <div className={styles.sectionHeader}>
          <h2>Your Assigned Startups</h2>
        </div>

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
                  <h3>{startup.company_name}</h3>
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
                      Pitch Deck {icons.external}
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>{icons.users}</div>
            <h3>No Startups Assigned Yet</h3>
            <p>You will be notified once a startup is matched with you.</p>
          </div>
        )}
      </section>
    </div>
  );
}
