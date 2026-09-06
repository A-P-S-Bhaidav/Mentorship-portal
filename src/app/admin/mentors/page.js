'use client';
import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './mentors.module.css';

const ChevronDown = () => (<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>);

export default function MentorsManagement() {
  const [mentors, setMentors] = useState([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [expandedRow, setExpandedRow] = useState(null);

  const [filter, setFilter] = useState('All');

  useEffect(() => {
    async function fetchMentors() {
      const { data } = await supabase.from('mentors').select('*, profiles(full_name, email), assignments(id)');
      if (data) {
        setMentors(data.map(m => ({
          ...m,
          name: m.profiles?.full_name || 'Unknown',
          email: m.profiles?.email || '',
          assignedCount: (m.assignments || []).length
        })));
      }
      setLoading(false);
    }
    fetchMentors();
  }, []);

  const filteredMentors = mentors.filter(m => {
    const matchesSearch = m.name.toLowerCase().includes(search.toLowerCase()) || (m.firm && m.firm.toLowerCase().includes(search.toLowerCase()));
    
    let matchesFilter = true;
    if (filter === 'Available') {
      matchesFilter = m.assignedCount < m.max_startups;
    } else if (filter === 'Allotted') {
      matchesFilter = m.assignedCount > 0;
    }
    
    return matchesSearch && matchesFilter;
  });

  if (loading) return <div className={styles.loadingSkeleton}>Loading...</div>;

  return (
    <div className={styles.page}>
      <h1 className={styles.title}>Mentors Management</h1>
      
      <div className={styles.tabsContainer}>
        <button 
          className={`${styles.tab} ${filter === 'All' ? styles.activeTab : ''}`}
          onClick={() => setFilter('All')}
        >
          All Mentors
        </button>
        <button 
          className={`${styles.tab} ${filter === 'Available' ? styles.activeTab : ''}`}
          onClick={() => setFilter('Available')}
        >
          Available (Free) Mentors
        </button>
        <button 
          className={`${styles.tab} ${filter === 'Allotted' ? styles.activeTab : ''}`}
          onClick={() => setFilter('Allotted')}
        >
          Allotted Mentors
        </button>
      </div>

      <input type="text" className={styles.searchInput} placeholder="Search mentors by name or firm..." value={search} onChange={e => setSearch(e.target.value)} />
      
      <div className="glass-card">
        <table className="data-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Firm</th>
              <th>Expertise</th>
              <th>Assigned Startups</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredMentors.map(m => (
              <React.Fragment key={m.id}>
                <tr onClick={() => setExpandedRow(expandedRow === m.id ? null : m.id)}>
                  <td>{m.name}</td>
                  <td>{m.firm || 'N/A'}</td>
                  <td>
                    <div className={styles.badges}>
                      {(m.expertise || []).slice(0, 2).map((exp, i) => (
                        <span key={i} className="badge-primary">{exp}</span>
                      ))}
                      {(m.expertise || []).length > 2 && <span className="badge-secondary">+{(m.expertise || []).length - 2}</span>}
                    </div>
                  </td>
                  <td>{m.assignedCount} / {m.max_startups}</td>
                  <td>
                    {m.assignedCount >= m.max_startups ? (
                      <span className={styles.badgeAtCapacity}>At Capacity</span>
                    ) : (
                      <span className={styles.badgeAvailable}>Available</span>
                    )}
                  </td>
                  <td><button className={styles.iconBtn}><ChevronDown /></button></td>
                </tr>
                {expandedRow === m.id && (
                  <tr className={styles.expandedRow}>
                    <td colSpan="6">
                      <div className={styles.expandedContent}>
                        <p><strong>Email:</strong> {m.email}</p>
                        <p><strong>Full Expertise:</strong> {(m.expertise || []).join(', ') || 'N/A'}</p>
                        <p><strong>Bio:</strong> {m.bio || 'No bio provided.'}</p>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
