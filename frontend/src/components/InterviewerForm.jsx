import { useState } from 'react';

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
  const [stack, setStack] = useState(interviewer?.skills?.join(', ') ?? '');
  const [error, setError] = useState('');

  function handleSubmit(e) {
    e.preventDefault();
    if (!name.trim()) {
      setError('Name is required.');
      return;
    }
    onSave({ ...interviewer, name: name.trim(), skills: parseStack(stack) });
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
