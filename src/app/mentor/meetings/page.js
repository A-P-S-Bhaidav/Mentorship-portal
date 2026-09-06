'use client';
import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/context/AuthContext';
import styles from './meetings.module.css';

export default function MentorMeetings() {
  const { profile } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');

  useEffect(() => {
    if (profile?.id) {
      fetchMeetings();
    }
  }, [profile]);

  const fetchMeetings = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('meetings')
        .select(`
          id,
          date,
          status,
          notes,
          startups:startup_id (
            startup_name
          )
        `)
        .eq('mentor_id', profile.id)
        .order('date', { ascending: true });

      if (error) throw error;
      setMeetings(data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const now = new Date();
  const upcomingMeetings = meetings.filter(m => new Date(m.date) >= now && m.status !== 'cancelled');
  const pastMeetings = meetings.filter(m => new Date(m.date) < now || m.status === 'cancelled');

  const displayedMeetings = activeTab === 'upcoming' ? upcomingMeetings : pastMeetings;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Meetings</h1>
        <p>Manage your upcoming and past mentoring sessions.</p>
      </header>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'upcoming' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('upcoming')}
        >
          Upcoming ({upcomingMeetings.length})
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'past' ? styles.activeTab : ''}`}
          onClick={() => setActiveTab('past')}
        >
          Past ({pastMeetings.length})
        </button>
      </div>

      <div className={styles.meetingsList}>
        {loading ? (
          <div className={styles.loading}>Loading meetings...</div>
        ) : displayedMeetings.length > 0 ? (
          displayedMeetings.map(meeting => (
            <div key={meeting.id} className={styles.meetingCard}>
              <div className={styles.meetingInfo}>
                <h3>{meeting.startups?.startup_name}</h3>
                <span className={styles.date}>
                  {new Date(meeting.date).toLocaleDateString('en-US', {
                    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
                    hour: '2-digit', minute: '2-digit'
                  })}
                </span>
              </div>
              <div className={styles.statusBadge} data-status={meeting.status}>
                {meeting.status}
              </div>
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No {activeTab} meetings found.</p>
          </div>
        )}
      </div>
    </div>
  );
}
