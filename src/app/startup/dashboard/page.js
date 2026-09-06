'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import StartupOnboarding from '@/components/StartupOnboarding';
import styles from './dashboard.module.css';

export default function StartupDashboard() {
  const { user, profile } = useAuth();
  const [startup, setStartup] = useState(null);
  const [mentor, setMentor] = useState(null);
  const [stats, setStats] = useState({ meetings: 0, completed: 0 });
  const [loading, setLoading] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    async function fetchData() {
      if (!user) return;
      
      try {
        // Fetch startup data
        const { data: startupData } = await supabase
          .from('startups')
          .select('*')
          .eq('id', user.id)
          .single();
          
        setStartup(startupData);

        // Fetch assignment
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

          // Fetch meetings
          const { data: meetings } = await supabase
            .from('meetings')
            .select('*')
            .eq('startup_id', user.id);
            
          if (meetings) {
            const scheduled = meetings.filter(m => m.status === 'scheduled').length;
            const completed = meetings.filter(m => m.status === 'completed').length;
            setStats({ meetings: scheduled, completed });
          }
        }
        if (startupData) {
          if (!startupData.startup_name) {
            setShowOnboarding(true);
          }
        }
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchData();
  }, [user]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.skeletonHeader}></div>
        <div className={styles.statsGrid}>
          {[1, 2, 3].map(i => <div key={i} className={styles.skeletonCard}></div>)}
        </div>
      </div>
    );
  }

  // Calculate profile completion (basic logic)
  let completion = 20;
  if (startup?.startup_name) completion += 20;
  if (startup?.description) completion += 20;
  if (startup?.pitch_deck_url) completion += 20;
  if (startup?.sector) completion += 20;

  if (showOnboarding) {
    return <StartupOnboarding onComplete={() => window.location.reload()} />;
  }

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.welcomeInfo}>
          <h1>Welcome back, <span className={styles.gradientText}>{startup?.startup_name || profile?.full_name || 'Founder'}</span></h1>
          <p className={styles.subtitle}>Here is what is happening with your mentorship journey today.</p>
        </div>
      </header>

      <div className={styles.completionSection}>
        <div className={styles.completionHeader}>
          <span>Profile Completion</span>
          <span>{completion}%</span>
        </div>
        <div className={styles.progressBarBg}>
          <div 
            className={styles.progressBarFill} 
            style={{ width: `${completion}%` }}
          ></div>
        </div>
        {completion < 100 && (
          <Link href="/startup/profile" className={styles.completeLink}>
            Complete your profile to get the most out of your mentorship
          </Link>
        )}
      </div>

      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path>
              <circle cx="8.5" cy="7" r="4"></circle>
              <line x1="20" y1="8" x2="20" y2="14"></line>
              <line x1="23" y1="11" x2="17" y2="11"></line>
            </svg>
          </div>
          <div className={styles.statValue}>{mentor ? 'Assigned' : 'Pending'}</div>
          <div className={styles.statLabel}>Mentor Status</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <div className={styles.statValue}>{stats.meetings}</div>
          <div className={styles.statLabel}>Meetings Scheduled</div>
        </div>
        <div className={styles.statCard}>
          <div className={styles.statIcon}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
              <polyline points="22 4 12 14.01 9 11.01"></polyline>
            </svg>
          </div>
          <div className={styles.statValue}>{stats.completed}</div>
          <div className={styles.statLabel}>Sessions Completed</div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <section className={styles.mentorSection}>
          <h2 className={styles.sectionTitle}>Your Mentor</h2>
          {mentor ? (
            <div className={styles.mentorCard}>
              <div className={styles.mentorHeader}>
                <div className={styles.mentorAvatar}>
                  {mentor.company_name?.charAt(0) || 'M'}
                </div>
                <div className={styles.mentorInfo}>
                  <h3 className={styles.mentorName}>{mentor.role || 'Assigned Mentor'}</h3>
                  <p className={styles.mentorFirm}>{mentor.company_name}</p>
                </div>
              </div>
              {mentor.expertise && (
                <div className={styles.badges}>
                  {mentor.expertise.map(exp => (
                    <span key={exp} className={styles.badge}>{exp}</span>
                  ))}
                </div>
              )}
              <div className={styles.mentorActions}>
                <Link href="/startup/mentor" className={styles.btnSecondary}>
                  View Profile
                </Link>
                <Link href="/startup/mentor" className={styles.btnPrimary}>
                  Schedule Meeting
                </Link>
              </div>
            </div>
          ) : (
            <div className={styles.emptyState}>
              <div className={styles.emptyIcon}>
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
              </div>
              <h3>Awaiting Mentor Assignment</h3>
              <p>Our team is currently finding the best mentor match for your startup. We will notify you once a mentor has been assigned.</p>
            </div>
          )}
        </section>

        <section className={styles.actionsSection}>
          <h2 className={styles.sectionTitle}>Quick Actions</h2>
          <div className={styles.actionList}>
            <Link href="/startup/profile" className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                </svg>
              </div>
              <div className={styles.actionText}>
                <h4>Update Profile</h4>
                <p>Keep your startup details current</p>
              </div>
            </Link>
            
            {startup?.pitch_deck_url && (
              <a href={startup.pitch_deck_url} target="_blank" rel="noopener noreferrer" className={styles.actionCard}>
                <div className={styles.actionIcon}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                    <polyline points="14 2 14 8 20 8"></polyline>
                    <line x1="16" y1="13" x2="8" y2="13"></line>
                    <line x1="16" y1="17" x2="8" y2="17"></line>
                    <polyline points="10 9 9 9 8 9"></polyline>
                  </svg>
                </div>
                <div className={styles.actionText}>
                  <h4>View Pitch Deck</h4>
                  <p>Review your current presentation</p>
                </div>
              </a>
            )}
            
            <Link href="/startup/meetings" className={styles.actionCard}>
              <div className={styles.actionIcon}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"></polygon>
                  <rect x="1" y="5" width="15" height="14" rx="2" ry="2"></rect>
                </svg>
              </div>
              <div className={styles.actionText}>
                <h4>Meetings</h4>
                <p>View your upcoming and past sessions</p>
              </div>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}
