'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './assignments.module.css';

const TrashIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>);

export default function AssignmentsOverview() {
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAssignments();
  }, []);

  async function fetchAssignments() {
    setLoading(true);
    const { data } = await supabase.from('mentors').select('*, profiles(full_name), assignments(id, startup_id, startups(company_name, industry))');
    if (data) {
      setMentors(data.map(m => ({
        ...m,
        name: m.profiles?.full_name || 'Unknown'
      })));
    }
    setLoading(false);
  }

  const handleRemove = async (assignmentId) => {
    if (confirm('Are you sure you want to remove this assignment?')) {
      await supabase.from('assignments').delete().eq('id', assignmentId);
      fetchAssignments();
    }
  };

  if (loading) return <div className={styles.loadingSkeleton}>Loading...</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Live Mapping Overview</h1>
      
      <div className={styles.grid}>
        {mentors.map(m => (
          <div key={m.id} className={styles.mentorCard}>
            <div className={styles.mentorHeader}>
              <h3>{m.name}</h3>
              <span className={styles.capacityBadge}>{m.assignments?.length || 0} / {m.max_startups}</span>
            </div>
            
            <div className={styles.startupList}>
              {m.assignments && m.assignments.length > 0 ? (
                m.assignments.map(a => (
                  <div key={a.id} className={styles.startupCard}>
                    <div>
                      <strong>{a.startups?.company_name}</strong>
                      <span className={styles.industry}>{a.startups?.industry}</span>
                    </div>
                    <button className={styles.removeBtn} onClick={() => handleRemove(a.id)} title="Remove assignment">
                      <TrashIcon />
                    </button>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText}>No startups assigned</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
