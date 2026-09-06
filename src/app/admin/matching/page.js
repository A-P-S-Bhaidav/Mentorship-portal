'use client';
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import styles from './matching.module.css';

export default function MatchingInterface() {
  const [startups, setStartups] = useState([]);
  const [mentors, setMentors] = useState([]);
  const [selectedStartup, setSelectedStartup] = useState(null);
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [previewMatches, setPreviewMatches] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      // Get unassigned startups
      const { data: sData } = await supabase.from('startups').select('*, assignments(id)');
      const unassigned = (sData || []).filter(s => !s.assignments || s.assignments.length === 0);
      setStartups(unassigned);

      // Get available mentors
      const { data: mData } = await supabase.from('mentors').select('*, profiles(full_name), assignments(id)');
      const available = (mData || []).map(m => ({
        ...m,
        name: m.profiles?.full_name || 'Unknown',
        assignedCount: (m.assignments || []).length
      })).filter(m => m.assignedCount < m.max_startups);
      
      setMentors(available);
      setLoading(false);
    }
    fetchData();
  }, []);

  const handleAutoMatch = () => {
    const suggestions = [];
    startups.forEach(startup => {
      // Find mentor with matching industry/expertise
      const match = mentors.find(m => (m.expertise || []).includes(startup.industry) && !suggestions.some(s => s.mentor.id === m.id && s.mentor.assignedCount + suggestions.filter(x => x.mentor.id === m.id).length >= m.max_startups));
      if (match) {
        suggestions.push({ startup, mentor: match });
      }
    });
    setPreviewMatches(suggestions);
  };

  const handleManualMatch = () => {
    if (selectedStartup && selectedMentor) {
      setShowModal(true);
    }
  };

  const confirmMatch = async (startupId, mentorId) => {
    const { error } = await supabase.from('assignments').insert({
      startup_id: startupId,
      mentor_id: mentorId,
      status: 'active'
    });
    
    if (!error) {
      // Refresh local state by removing assigned startup
      setStartups(startups.filter(s => s.id !== startupId));
      setMentors(mentors.map(m => m.id === mentorId ? { ...m, assignedCount: m.assignedCount + 1 } : m));
      setSelectedStartup(null);
      setSelectedMentor(null);
      setPreviewMatches(previewMatches.filter(p => p.startup.id !== startupId));
      setShowModal(false);
      alert('Match assigned successfully!');
    } else {
      alert('Error assigning match.');
    }
  };

  if (loading) return <div className={styles.loadingSkeleton}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Matching Interface</h1>
        <button className="btn" onClick={handleAutoMatch}>Run Auto-Match</button>
      </div>
      
      {previewMatches.length > 0 && (
        <div className={styles.previewSection}>
          <h2>Suggested Matches</h2>
          <div className={styles.previewGrid}>
            {previewMatches.map((match, i) => (
              <div key={i} className={styles.previewCard}>
                <div><strong>{match.startup.company_name}</strong> ({match.startup.industry})</div>
                <div className={styles.matchArrow}>→</div>
                <div><strong>{match.mentor.name}</strong></div>
                <button className="btn btn-sm" onClick={() => confirmMatch(match.startup.id, match.mentor.id)}>Approve</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.twoColumn}>
        <div className={styles.column}>
          <h2>Unassigned Startups</h2>
          <div className={styles.cardList}>
            {startups.map(s => (
              <div 
                key={s.id} 
                className={`${styles.card} ${selectedStartup === s.id ? styles.selected : ''}`}
                onClick={() => setSelectedStartup(s.id)}
              >
                <h3>{s.company_name}</h3>
                <p>Sector: {s.industry || 'N/A'}</p>
                <p>Stage: {s.stage || 'N/A'}</p>
              </div>
            ))}
            {startups.length === 0 && <p className={styles.emptyText}>All startups are assigned.</p>}
          </div>
        </div>
        
        <div className={styles.column}>
          <h2>Available Mentors</h2>
          <div className={styles.cardList}>
            {mentors.map(m => (
              <div 
                key={m.id} 
                className={`${styles.card} ${selectedMentor === m.id ? styles.selected : ''}`}
                onClick={() => setSelectedMentor(m.id)}
              >
                <h3>{m.name}</h3>
                <p>Expertise: {(m.expertise || []).join(', ')}</p>
                <p>Capacity: {m.assignedCount} / {m.max_startups}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className={styles.actionFooter}>
        <button 
          className="btn" 
          disabled={!selectedStartup || !selectedMentor}
          onClick={handleManualMatch}
        >
          Assign Selected
        </button>
      </div>

      {showModal && (
        <div className={styles.modalOverlay}>
          <div className={styles.modalContent}>
            <h3>Confirm Assignment</h3>
            <p>Are you sure you want to assign <strong>{startups.find(s => s.id === selectedStartup)?.company_name}</strong> to <strong>{mentors.find(m => m.id === selectedMentor)?.name}</strong>?</p>
            <div className={styles.modalActions}>
              <button className="btn" style={{background: 'var(--bg-secondary)'}} onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn" onClick={() => confirmMatch(selectedStartup, selectedMentor)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
