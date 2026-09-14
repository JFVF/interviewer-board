import { useState } from 'react';
import InterviewerToggleChips from './InterviewerToggleChips.jsx';

function parseStack(text) {
  return Array.from(
    new Set(
      text
        .split(/[,;]/)
        .map((s) => s.trim())
        .filter(Boolean)
    )
  );
}

export default function CandidateForm({ candidate, interviewers, onSave, onCancel }) {
  const [name, setName] = useState(candidate?.name ?? '');
  const [jobTitle, setJobTitle] = useState(candidate?.jobTitle ?? '');
  const [stack, setStack] = useState(candidate?.skills?.join(', ') ?? '');
  const [interviewDate, setInterviewDate] = useState(candidate?.interviewDate ?? '');
  const [interviewerIds, setInterviewerIds] = useState(candidate?.interviewerIds ?? []);
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    onSave({
      ...candidate,
      name: name.trim(),
      jobTitle: jobTitle.trim(),
      skills: parseStack(stack),
      interviewDate: interviewDate || null,
      interviewerIds,
      status: candidate?.status ?? 'SCHEDULING',
    });
  }

  return (
    <form className="inline-form" onSubmit={handleSubmit}>
      <input
        className="form-input"
        placeholder="Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
      />
      <input
        className="form-input"
        placeholder="Job applying for"
        value={jobTitle}
        onChange={(e) => setJobTitle(e.target.value)}
      />
      <input
        className="form-input"
        placeholder="Stack, comma separated"
        value={stack}
        onChange={(e) => setStack(e.target.value)}
      />
      <label className="field-label" htmlFor="interview-date">
        Interview date
      </label>
      <input
        id="interview-date"
        type="date"
        className="form-input"
        value={interviewDate ?? ''}
        onChange={(e) => setInterviewDate(e.target.value)}
      />
      <span className="field-label">Assign interviewers</span>
      <InterviewerToggleChips
        interviewers={interviewers}
        selectedIds={interviewerIds}
        onChange={setInterviewerIds}
      />
      {error && <p className="form-error">{error}</p>}
      <div className="inline-form-actions">
        <button type="submit" className="btn-primary">
          {candidate ? 'Save changes' : 'Add candidate'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
