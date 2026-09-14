import { useCallback, useEffect, useMemo, useState } from 'react';
import InterviewersTab from './components/InterviewersTab.jsx';
import CandidatesTab from './components/CandidatesTab.jsx';
import { api } from './api.js';
import './App.css';

export default function App() {
  const [tab, setTab] = useState('interviewers');
  const [interviewers, setInterviewers] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
    try {
      const [i, c] = await Promise.all([api.interviewers.list(), api.candidates.list()]);
      setInterviewers(i);
      setCandidates(c);
      setError('');
    } catch (e) {
      setError(e.message || 'Failed to load data. Is the backend running on port 8080?');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    reload();
  }, [reload]);

  const allSkills = useMemo(() => {
    const set = new Set();
    interviewers.forEach((i) => i.skills.forEach((s) => set.add(s)));
    candidates.forEach((c) => c.skills.forEach((s) => set.add(s)));
    return Array.from(set).sort();
  }, [interviewers, candidates]);

  return (
    <div className="app">
      <header className="app-header">
        <h1>Interview board</h1>
        <p className="app-subtitle">Match interviewers to candidates by stack.</p>
        <nav className="tabs">
          <button className={tab === 'interviewers' ? 'tab active' : 'tab'} onClick={() => setTab('interviewers')}>
            Interviewers <span className="tab-count">{interviewers.length}</span>
          </button>
          <button className={tab === 'candidates' ? 'tab active' : 'tab'} onClick={() => setTab('candidates')}>
            Candidates <span className="tab-count">{candidates.length}</span>
          </button>
        </nav>
      </header>

      {error && <div className="banner-error">{error}</div>}

      {loading ? (
        <p className="empty-state">Loading…</p>
      ) : tab === 'interviewers' ? (
        <InterviewersTab interviewers={interviewers} allSkills={allSkills} reload={reload} />
      ) : (
        <CandidatesTab
          candidates={candidates}
          interviewers={interviewers}
          allSkills={allSkills}
          reload={reload}
        />
      )}
    </div>
  );
}
