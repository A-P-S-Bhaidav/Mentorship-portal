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
  const [approving, setApproving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    // Get unassigned startups
    const { data: sData } = await supabase.from('startups').select('*, assignments(id)');
    const unassigned = (sData || []).filter(s => !s.assignments || s.assignments.length === 0);
    setStartups(unassigned);

    // Get available mentors (with remaining capacity)
    const { data: mData } = await supabase.from('mentors').select('*, profiles(full_name), assignments(id)');
    const available = (mData || []).map(m => ({
      ...m,
      name: m.profiles?.full_name || 'Unknown',
      assignedCount: (m.assignments || []).length
    })).filter(m => m.assignedCount < (m.max_startups || 5));
    
    setMentors(available);
    setLoading(false);
  }

  const handleAutoMatch = () => {
    if (startups.length === 0 || mentors.length === 0) {
      alert('No unassigned startups or available mentors to match.');
      return;
    }

    const suggestions = [];
    // Track remaining capacity for each mentor during suggestion generation
    const capacityUsed = {};
    mentors.forEach(m => { capacityUsed[m.id] = 0; });

    const getRemainingCapacity = (mentor) => {
      return (mentor.max_startups || 5) - mentor.assignedCount - (capacityUsed[mentor.id] || 0);
    };

    // Sort mentors by most remaining capacity first (round-robin fairness)
    const sortedMentors = [...mentors].sort((a, b) => getRemainingCapacity(b) - getRemainingCapacity(a));

    for (const startup of startups) {
      // 1. Try to find a mentor with matching expertise (case-insensitive)
      const startupSector = (startup.sector || '').toLowerCase().trim();
      
      let bestMatch = null;
      let bestCapacity = 0;

      for (const mentor of sortedMentors) {
        if (getRemainingCapacity(mentor) <= 0) continue;
        
        const expertiseMatch = (mentor.expertise || []).some(exp => 
          exp.toLowerCase().trim() === startupSector ||
          startupSector.includes(exp.toLowerCase().trim()) ||
          exp.toLowerCase().trim().includes(startupSector)
        );

        if (expertiseMatch) {
          const cap = getRemainingCapacity(mentor);
          if (cap > bestCapacity) {
            bestMatch = mentor;
            bestCapacity = cap;
          }
        }
      }

      // 2. Fallback: assign to mentor with most remaining capacity
      if (!bestMatch) {
        for (const mentor of sortedMentors) {
          if (getRemainingCapacity(mentor) > 0) {
            bestMatch = mentor;
            break;
          }
        }
      }

      if (bestMatch) {
        suggestions.push({ startup, mentor: bestMatch });
        capacityUsed[bestMatch.id] = (capacityUsed[bestMatch.id] || 0) + 1;
      }
    }

    if (suggestions.length === 0) {
      alert('Could not generate any matches. All mentors may be at capacity.');
    }

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
      setStartups(prev => prev.filter(s => s.id !== startupId));
      setMentors(prev => prev.map(m => m.id === mentorId ? { ...m, assignedCount: m.assignedCount + 1 } : m));
      setSelectedStartup(null);
      setSelectedMentor(null);
      setPreviewMatches(prev => prev.filter(p => p.startup.id !== startupId));
      setShowModal(false);
      return true;
    } else {
      console.error('Assignment error:', error);
      return false;
    }
  };

  const handleApproveAll = async () => {
    if (previewMatches.length === 0) return;
    
    setApproving(true);
    let successCount = 0;
    let errorCount = 0;

    for (const match of previewMatches) {
      const success = await confirmMatch(match.startup.id, match.mentor.id);
      if (success) successCount++;
      else errorCount++;
    }

    setApproving(false);
    setPreviewMatches([]);
    
    if (errorCount === 0) {
      alert(`Successfully assigned ${successCount} startup${successCount > 1 ? 's' : ''} to mentors!`);
    } else {
      alert(`Assigned ${successCount} successfully, ${errorCount} failed. Please check the console for errors.`);
    }
    
    // Refresh data
    fetchData();
  };

  if (loading) return <div className={styles.loadingSkeleton}>Loading...</div>;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Matching Interface</h1>
        <div style={{display: 'flex', gap: '0.75rem'}}>
          <button className="btn btn-primary" onClick={handleAutoMatch}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/></svg>
            Run Auto-Match
          </button>
        </div>
      </div>
      
      {previewMatches.length > 0 && (
        <div className={styles.previewSection}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem'}}>
            <h2>Suggested Matches ({previewMatches.length})</h2>
            <button 
              className="btn btn-primary" 
              onClick={handleApproveAll}
              disabled={approving}
            >
              {approving ? 'Approving...' : `Approve All (${previewMatches.length})`}
            </button>
          </div>
          <div className={styles.previewGrid}>
            {previewMatches.map((match, i) => (
              <div key={i} className={styles.previewCard}>
                <div><strong>{match.startup.startup_name}</strong> ({match.startup.sector || 'No sector'})</div>
                <div className={styles.matchArrow}>→</div>
                <div><strong>{match.mentor.name}</strong></div>
                <button className="btn btn-sm btn-secondary" onClick={() => confirmMatch(match.startup.id, match.mentor.id)}>Approve</button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className={styles.twoColumn}>
        <div className={styles.column}>
          <h2>Unassigned Startups ({startups.length})</h2>
          <div className={styles.cardList}>
            {startups.map(s => (
              <div 
                key={s.id} 
                className={`${styles.card} ${selectedStartup === s.id ? styles.selected : ''}`}
                onClick={() => setSelectedStartup(s.id)}
              >
                <h3>{s.startup_name || 'Unnamed Startup'}</h3>
                <p>Sector: {s.sector || 'N/A'}</p>
                <p>Stage: {s.stage || 'N/A'}</p>
              </div>
            ))}
            {startups.length === 0 && <p className={styles.emptyText}>All startups are assigned.</p>}
          </div>
        </div>
        
        <div className={styles.column}>
          <h2>Available Mentors ({mentors.length})</h2>
          <div className={styles.cardList}>
            {mentors.map(m => (
              <div 
                key={m.id} 
                className={`${styles.card} ${selectedMentor === m.id ? styles.selected : ''}`}
                onClick={() => setSelectedMentor(m.id)}
              >
                <h3>{m.name}</h3>
                <p>Expertise: {(m.expertise || []).join(', ') || 'General'}</p>
                <p>Capacity: {m.assignedCount} / {m.max_startups || 5}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      <div className={styles.actionFooter}>
        <button 
          className="btn btn-primary" 
          disabled={!selectedStartup || !selectedMentor}
          onClick={handleManualMatch}
        >
          Assign Selected
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Confirm Assignment</h3>
              <button className="modal-close" onClick={() => setShowModal(false)}>✕</button>
            </div>
            <p>Are you sure you want to assign <strong>{startups.find(s => s.id === selectedStartup)?.startup_name}</strong> to <strong>{mentors.find(m => m.id === selectedMentor)?.name}</strong>?</p>
            <div style={{display: 'flex', gap: '0.75rem', marginTop: '1.5rem', justifyContent: 'flex-end'}}>
              <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="btn btn-primary" onClick={() => confirmMatch(selectedStartup, selectedMentor)}>Confirm</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
