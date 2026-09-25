import { useState } from 'react';
import { ROLES } from '../roles.js';

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

export default function InterviewerForm({ interviewer, onSave, onCancel }) {
  const [name, setName] = useState(interviewer?.name ?? '');
  const [role, setRole] = useState(interviewer?.role ?? '');
  const [stack, setStack] = useState(interviewer?.skills?.join(', ') ?? '');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    onSave({ ...interviewer, name: name.trim(), role: role || null, skills: parseStack(stack) });
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
      <select
        className="form-input"
        aria-label="Role"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="">No role</option>
        {ROLES.map((r) => (
          <option key={r.value} value={r.value}>
            {r.label}
          </option>
        ))}
      </select>
      <input
        className="form-input"
        placeholder="Stack, comma separated"
        value={stack}
        onChange={(e) => setStack(e.target.value)}
      />
      {error && <p className="form-error">{error}</p>}
      <div className="inline-form-actions">
        <button type="submit" className="btn-primary">
          {interviewer ? 'Save changes' : 'Add interviewer'}
        </button>
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
      </div>
    </form>
  );
}
