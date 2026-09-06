'use client';

import { useState, useRef } from 'react';
import * as XLSX from 'xlsx';
import styles from './bulk-upload.module.css';

export default function BulkUploadPage() {
  const [activeTab, setActiveTab] = useState('startup');
  const [sheetUrl, setSheetUrl] = useState('');
  const [parsedData, setParsedData] = useState([]);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState(null);
  const fileInputRef = useRef(null);

  const startupColumns = ['startup_name', 'founder_name', 'sector', 'stage', 'pitch_deck_url'];
  const mentorColumns = ['full_name', 'email', 'firm', 'expertise', 'cal_link'];

  const expectedColumns = activeTab === 'startup' ? startupColumns : mentorColumns;

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file) => {
    setMessage(null);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = new Uint8Array(e.target.result);
        const workbook = XLSX.read(data, { type: 'array' });
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });
        
        if (jsonData.length > 0) {
          const fileCols = Object.keys(jsonData[0]);
          setColumns(fileCols);
          setParsedData(jsonData);
        } else {
          setMessage({ type: 'error', text: 'File is empty' });
        }
      } catch (err) {
        setMessage({ type: 'error', text: 'Error parsing file: ' + err.message });
      }
    };
    reader.readAsArrayBuffer(file);
  };

  const handleSheetUrlSubmit = async (e) => {
    e.preventDefault();
    if (!sheetUrl) return;

    setMessage(null);
    try {
      const match = sheetUrl.match(/\/d\/([a-zA-Z0-9-_]+)/);
      if (!match) {
        throw new Error('Invalid Google Sheets URL. Could not find document ID.');
      }
      
      const docId = match[1];
      const exportUrl = `https://docs.google.com/spreadsheets/d/${docId}/export?format=csv`;
      
      // In a real app, you might need a proxy or server-side fetch to avoid CORS if the sheet isn't public,
      // but for this implementation we try to fetch directly (assuming public link)
      const response = await fetch(exportUrl);
      if (!response.ok) {
        throw new Error('Failed to fetch from Google Sheets. Make sure anyone with the link can view it.');
      }
      
      const csvText = await response.text();
      const workbook = XLSX.read(csvText, { type: 'string' });
      const firstSheetName = workbook.SheetNames[0];
      const worksheet = workbook.Sheets[firstSheetName];
      const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

      if (jsonData.length > 0) {
        setColumns(Object.keys(jsonData[0]));
        setParsedData(jsonData);
      } else {
        setMessage({ type: 'error', text: 'Sheet is empty or could not be parsed' });
      }
    } catch (err) {
      setMessage({ type: 'error', text: err.message });
    }
  };

  const handleImport = async () => {
    if (parsedData.length === 0) return;

    setLoading(true);
    setProgress(10);
    setMessage(null);

    try {
      // Map data to expected columns (case-insensitive and loose matching could be added here, 
      // but we'll assume the headers match the required columns for simplicity)
      
      const payload = {
        type: activeTab,
        records: parsedData
      };

      setProgress(40);

      const response = await fetch('/api/admin/bulk-create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      setProgress(80);

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Import failed');
      }

      setProgress(100);
      
      if (result.errors && result.errors.length > 0) {
        setMessage({ 
          type: 'error', 
          text: `Successfully imported ${result.successCount} records, but ${result.errors.length} failed. Check console for details.` 
        });
        console.error('Import errors:', result.errors);
      } else {
        setMessage({ 
          type: 'success', 
          text: `Successfully imported all ${result.successCount} records!` 
        });
        setParsedData([]); // Clear on full success
      }
    } catch (err) {
      setMessage({ type: 'error', text: 'Import failed: ' + err.message });
      setProgress(0);
    } finally {
      setLoading(false);
      setTimeout(() => { if (progress === 100) setProgress(0) }, 2000);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Bulk Upload</h1>
      </div>

      <div className={styles.tabs}>
        <button 
          className={`${styles.tab} ${activeTab === 'startup' ? styles.active : ''}`}
          onClick={() => { setActiveTab('startup'); setParsedData([]); setMessage(null); }}
        >
          Bulk Startups
        </button>
        <button 
          className={`${styles.tab} ${activeTab === 'mentor' ? styles.active : ''}`}
          onClick={() => { setActiveTab('mentor'); setParsedData([]); setMessage(null); }}
        >
          Bulk Mentors
        </button>
      </div>

      <div className={styles.uploadCard}>
        <div 
          className={styles.dropzone}
          onDragOver={handleDragOver}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
        >
          <p>Drag and drop a .csv or .xlsx file here, or click to browse</p>
          <input 
            type="file" 
            ref={fileInputRef} 
            onChange={handleFileSelect} 
            accept=".csv, .xlsx, .xls"
            className={styles.fileInput} 
          />
          <button className={styles.button}>Select File</button>
        </div>

        <div className={styles.orDivider}>OR</div>

        <form onSubmit={handleSheetUrlSubmit} className={styles.sheetInput}>
          <input 
            type="url" 
            placeholder="Paste Google Sheets URL here..." 
            value={sheetUrl}
            onChange={(e) => setSheetUrl(e.target.value)}
            className={styles.input}
          />
          <button type="submit" className={styles.button}>Fetch Sheet</button>
        </form>
      </div>

      {message && (
        <div className={`${styles.message} ${styles[message.type]}`}>
          {message.text}
        </div>
      )}

      {parsedData.length > 0 && (
        <div className={styles.previewSection}>
          <div className={styles.previewHeader}>
            <h2>Preview Data ({parsedData.length} records)</h2>
            <button 
              className={styles.button} 
              onClick={handleImport}
              disabled={loading}
            >
              {loading ? 'Importing...' : 'Import All'}
            </button>
          </div>

          <p style={{marginBottom: '1rem', color: 'var(--text-secondary)'}}>
            Expected columns: {expectedColumns.join(', ')}
          </p>

          {progress > 0 && (
            <div className={styles.progressBarContainer}>
              <div className={styles.progressBar} style={{ width: `${progress}%` }}></div>
            </div>
          )}

          <div className={styles.tableContainer}>
            <table className={styles.table}>
              <thead>
                <tr>
                  {columns.map(col => <th key={col}>{col}</th>)}
                </tr>
              </thead>
              <tbody>
                {parsedData.slice(0, 10).map((row, idx) => (
                  <tr key={idx}>
                    {columns.map(col => <td key={`${idx}-${col}`}>{row[col]}</td>)}
                  </tr>
                ))}
              </tbody>
            </table>
            {parsedData.length > 10 && (
              <div style={{padding: '1rem', textAlign: 'center', color: 'var(--text-secondary)'}}>
                Showing first 10 rows of {parsedData.length}...
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
