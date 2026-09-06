'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './startups.module.css';

const ExternalLinkIcon = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>);

export default function StartupsManagement() {
  const [startups, setStartups] = useState([]);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStartups() {
      const { data } = await supabase.from('startups').select('*, profiles(full_name), assignments(mentors(profiles(full_name)))');
      if (data) {
        setStartups(data.map(s => {
          const mentorNames = (s.assignments || []).map(a => a.mentors?.profiles?.full_name).filter(Boolean);
          return {
            ...s,
            founder: s.profiles?.full_name || 'Unknown',
            mentor: mentorNames.length > 0 ? mentorNames.join(', ') : 'Unassigned',
            isAssigned: mentorNames.length > 0
          };
        }));
      }
      setLoading(false);
    }
    fetchStartups();
  }, []);

  const filteredStartups = startups.filter(s => {
    const startupName = s.startup_name || '';
    const founder = s.founder || '';
    const matchesSearch = startupName.toLowerCase().includes(search.toLowerCase()) || founder.toLowerCase().includes(search.toLowerCase());
    const matchesFilter = filter === 'All' ? true : (filter === 'Assigned' ? s.isAssigned : !s.isAssigned);
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className={styles.loadingSkeleton}>Loading...</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Startups Management</h1>
      
      <div className={styles.controls}>
        <input type="text" className={styles.searchInput} placeholder="Search startups..." value={search} onChange={e => setSearch(e.target.value)} />
        <select className={styles.filterSelect} value={filter} onChange={e => setFilter(e.target.value)}>
          <option value="All">All Status</option>
          <option value="Assigned">Assigned</option>
          <option value="Unassigned">Unassigned</option>
        </select>
      </div>
      
      <div className="glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Startup Name</th>
              <th>Founder</th>
              <th>Sector</th>
              <th>Stage</th>
              <th>Pitch Deck</th>
              <th>Assigned Mentor</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {filteredStartups.map(s => (
              <tr key={s.id}>
                <td><strong>{s.startup_name || 'N/A'}</strong></td>
                <td>{s.founder}</td>
                <td>{s.sector || 'N/A'}</td>
                <td><span className="badge-secondary">{s.stage || 'N/A'}</span></td>
                <td>
                  {s.pitch_deck_url ? (
                    <a href={s.pitch_deck_url} target="_blank" rel="noopener noreferrer" className={styles.linkIcon}>
                      <ExternalLinkIcon /> Deck
                    </a>
                  ) : <span className={styles.textMuted}>None</span>}
                </td>
                <td>{s.mentor}</td>
                <td>
                  {s.isAssigned ? (
                    <span className={styles.badgeSuccess}>Assigned</span>
                  ) : (
                    <span className={styles.badgeWarning}>Unassigned</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
