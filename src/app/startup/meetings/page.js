'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { supabase } from '@/lib/supabase';
import styles from './meetings.module.css';

export default function StartupMeetings() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    async function fetchMeetings() {
      if (!user) return;
      try {
        const { data } = await supabase
          .from('meetings')
          .select(`
            id,
            scheduled_at,
            status,
            mentor_id
          `)
          .eq('startup_id', user.id)
          .order('scheduled_at', { ascending: true });

        if (data) {
          // In a real app we'd join with mentors table, mocking mentor name for simplicity here if join fails
          const meetingsWithMentor = await Promise.all(data.map(async (m) => {
            if (m.mentor_id) {
              const { data: mentor } = await supabase
                .from('mentors')
                .select('firm, role')
                .eq('id', m.mentor_id)
                .single();
              return { ...m, mentor_name: mentor?.role || 'Mentor' };
            }
            return { ...m, mentor_name: 'Mentor' };
          }));
          setMeetings(meetingsWithMentor);
        }
      } catch (err) {
        console.error('Error fetching meetings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchMeetings();
  }, [user]);

  const now = new Date();
  
  const upcomingMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.scheduled_at);
    return meetingDate >= now && m.status !== 'cancelled';
  });

  const pastMeetings = meetings.filter(m => {
    const meetingDate = new Date(m.scheduled_at);
    return meetingDate < now || m.status === 'completed' || m.status === 'cancelled';
  });

  const displayMeetings = activeTab === 'upcoming' ? upcomingMeetings : pastMeetings;

  const formatDate = (dateString) => {
    if (!dateString) return 'TBD';
    const d = new Date(dateString);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  };

  const formatTime = (dateString) => {
    if (!dateString) return 'TBD';
    const d = new Date(dateString);
    return d.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerContent}>
          <h1>Mentorship Meetings</h1>
          <p>Track your upcoming and past mentoring sessions.</p>
        </div>
        <Link href="/startup/mentor" className={styles.scheduleBtn}>
          Schedule New Meeting
        </Link>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'past' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past
        </button>
      </div>

      <div className={styles.timelineContainer}>
        {loading ? (
          <div className={styles.loadingState}>
            <div className={styles.skeletonCard}></div>
            <div className={styles.skeletonCard}></div>
          </div>
        ) : displayMeetings.length === 0 ? (
          <div className={styles.emptyState}>
            <div className={styles.emptyIcon}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
                <line x1="16" y1="2" x2="16" y2="6"></line>
                <line x1="8" y1="2" x2="8" y2="6"></line>
                <line x1="3" y1="10" x2="21" y2="10"></line>
              </svg>
            </div>
            <h3>No {activeTab} meetings</h3>
            <p>You don&apos;t have any {activeTab} mentoring sessions at the moment.</p>
            {activeTab === 'upcoming' && (
              <Link href="/startup/mentor" className={styles.emptyAction}>
                Schedule a meeting now
              </Link>
            )}
          </div>
        ) : (
          <div className={styles.meetingList}>
            {displayMeetings.map((meeting) => (
              <div key={meeting.id} className={styles.meetingCard}>
                <div className={styles.dateColumn}>
                  <div className={styles.timeBlock}>
                    <span className={styles.time}>{formatTime(meeting.scheduled_at)}</span>
                    <span className={styles.date}>{formatDate(meeting.scheduled_at)}</span>
                  </div>
                </div>
                <div className={styles.contentColumn}>
                  <div className={styles.meetingHeader}>
                    <h4>Mentoring Session with {meeting.mentor_name}</h4>
                    <span className={`${styles.statusBadge} ${styles[meeting.status] || styles.scheduled}`}>
                      {meeting.status || 'scheduled'}
                    </span>
                  </div>
                  <div className={styles.meetingDetails}>
                    <div className={styles.detailItem}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polygon points="15.5 5 11 5 16 12 11 19 15.5 19 20.5 12 15.5 5"></polygon>
                        <polygon points="8.5 5 4 5 9 12 4 19 8.5 19 13.5 12 8.5 5"></polygon>
                      </svg>
                      Online Meeting
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
