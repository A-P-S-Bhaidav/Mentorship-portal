'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './dashboard.module.css';

const UsersIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"></path><circle cx="9" cy="7" r="4"></circle><path d="M23 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path></svg>);
const BriefcaseIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>);
const LinkIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"></path><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"></path></svg>);
const CalendarIcon = () => (<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect><line x1="16" y1="2" x2="16" y2="6"></line><line x1="8" y1="2" x2="8" y2="6"></line><line x1="3" y1="10" x2="21" y2="10"></line></svg>);

function AnimatedCounter({ end }) {
  const [count, setCount] = useState(0);
  useEffect(() => {
    if (end === 0) return;
    let start = 0;
    const duration = 1500;
    const incrementTime = Math.max(20, duration / end);
    const timer = setInterval(() => {
      start += 1;
      setCount(prev => (prev < end ? prev + 1 : end));
      if (start >= end) clearInterval(timer);
    }, incrementTime);
    return () => clearInterval(timer);
  }, [end]);
  return <span>{count}</span>;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ mentors: 0, startups: 0, assignments: 0, meetings: 0 });
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState([]);
  const [mentors, setMentors] = useState([]);
  
  useEffect(() => {
    async function fetchData() {
      const [{ count: mCount }, { count: sCount }, { count: aCount }, { count: meCount }] = await Promise.all([
        supabase.from('mentors').select('*', { count: 'exact', head: true }),
        supabase.from('startups').select('*', { count: 'exact', head: true }),
        supabase.from('assignments').select('*', { count: 'exact', head: true }).eq('status', 'active'),
        supabase.from('meetings').select('*', { count: 'exact', head: true })
      ]);
      const { data: recent } = await supabase.from('assignments').select('*, mentors(profiles(full_name)), startups(company_name)').order('created_at', { ascending: false }).limit(5);
      const { data: mData } = await supabase.from('mentors').select('id, max_startups, profiles(full_name), assignments(id)');
      setStats({ mentors: mCount || 0, startups: sCount || 0, assignments: aCount || 0, meetings: meCount || 0 });
      if (recent) setActivities(recent);
      if (mData) {
        setMentors(mData.map(m => ({
          name: m.profiles?.full_name || 'Unknown',
          max: m.max_startups || 5,
          assigned: (m.assignments || []).length
        })));
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) return <div className={styles.loadingSkeleton}>Loading...</div>;
  const coveragePercent = stats.startups > 0 ? Math.round((stats.assignments / stats.startups) * 100) : 0;

  return (
    <div className={styles.dashboard}>
      <h1 className={styles.title}>Platform Overview</h1>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}><div className={styles.statIcon}><UsersIcon /></div><div className={styles.statInfo}><span className={styles.statLabel}>Total Mentors</span><span className={styles.statValue}><AnimatedCounter end={stats.mentors} /></span></div></div>
        <div className={styles.statCard}><div className={styles.statIcon}><BriefcaseIcon /></div><div className={styles.statInfo}><span className={styles.statLabel}>Total Startups</span><span className={styles.statValue}><AnimatedCounter end={stats.startups} /></span></div></div>
        <div className={styles.statCard}><div className={styles.statIcon}><LinkIcon /></div><div className={styles.statInfo}><span className={styles.statLabel}>Active Assignments</span><span className={styles.statValue}><AnimatedCounter end={stats.assignments} /></span></div></div>
        <div className={styles.statCard}><div className={styles.statIcon}><CalendarIcon /></div><div className={styles.statInfo}><span className={styles.statLabel}>Total Meetings</span><span className={styles.statValue}><AnimatedCounter end={stats.meetings} /></span></div></div>
      </div>
      <div className={styles.rowGrid}>
        <div className={styles.chartCard}>
          <h2>Assignment Coverage</h2>
          <div className={styles.progressBarBg}><div className={styles.progressBarFill} style={{ width: `${coveragePercent}%` }}></div></div>
          <p className={styles.coverageText}>{coveragePercent}% of startups are assigned to a mentor.</p>
          <h2 style={{ marginTop: '2rem' }}>Mentor Capacity</h2>
          <div className={styles.capacityList}>
            {mentors.map((m, i) => (
              <div key={i} className={styles.capacityRow}>
                <span className={styles.capacityName}>{m.name}</span>
                <div className={styles.capacityBarBg}><div className={styles.capacityBarFill} style={{ width: `${Math.min((m.assigned / m.max) * 100, 100)}%` }}></div></div>
                <span className={styles.capacityText}>{m.assigned} / {m.max}</span>
              </div>
            ))}
          </div>
        </div>
        <div className={styles.feedCard}>
          <h2>Recent Activity</h2>
          <div className={styles.timeline}>
            {activities.length > 0 ? activities.map((act, i) => (
              <div key={i} className={styles.timelineItem}>
                <div className={styles.timelineDot}></div>
                <div className={styles.timelineContent}>
                  <p><strong>{act.mentors?.profiles?.full_name}</strong> assigned to <strong>{act.startups?.company_name}</strong></p>
                  <span className={styles.timelineTime}>{new Date(act.created_at).toLocaleDateString()}</span>
                </div>
              </div>
            )) : <p>No recent activity.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
